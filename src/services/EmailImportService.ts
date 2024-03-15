import { EmailRepository } from "../datastore/repositories/EmailRepository";
import { MessageRepository } from "../datastore/repositories/MessageRepository";
import { ThreadRepository } from "../datastore/repositories/ThreadRepository";
import { UserRepository } from "../datastore/repositories/UserRepository";
import { EmailEntity } from "../model/entities/EmailEntity";
import { MessageEntity } from "../model/entities/MessageEntity";
import { ThreadEntity } from "../model/entities/ThreadEntity";
import { EmailFetcherService } from "./EmailFetcherService";

export class EmailImportService {
  constructor(
    private readonly emailFetcherService: EmailFetcherService,
    private readonly emailRepository: EmailRepository,
    private readonly messageRepository: MessageRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async import(): Promise<void> {
    const fetchedEmails = await this.retrieveAndPersistEmails();

    const groupedEmails = await this.groupEmails(fetchedEmails);

    const messages = await Promise.all(
      groupedEmails.map(({ email, thread }) =>
        this.createMessageFromEmail(email, thread)
      )
    );
    await this.messageRepository.persist(messages);
  }

  private async groupEmails(
    fetchedEmails: EmailEntity[]
  ): Promise<{ email: EmailEntity; thread: ThreadEntity }[]> {
    const map = new Map<string, { email: EmailEntity; thread: ThreadEntity }>(); // maps message-id to thread-id

    for (const email of fetchedEmails) {
      const messageId = email.universalMessageId.email.value;
      const inReplyTo = email.inReplyTo?.email.value;

      if (inReplyTo === undefined) {
        const newThread = await this.createThread(email.subject);
        map.set(messageId, { email, thread: newThread });
        continue;
      }

      if (map.has(inReplyTo)) {
        const { thread } = map.get(inReplyTo)!;
        map.set(messageId, { email, thread });
      } else {
        // FIXME: find thread in db
        //        using findOneByEmailUniversalMessageIdentifier
        const missingThread = await this.createThread("MISSING THREAD");
        map.set(messageId, { email, thread: missingThread });
      }
    }

    return Array.from(map.values());
  }

  private async retrieveAndPersistEmails() {
    const fetchedEmails = await this.emailFetcherService.fetch();
    await this.emailRepository.persist(fetchedEmails);
    return fetchedEmails;
  }

  private async createThread(name: string) {
    const thread = new ThreadEntity(name);
    await this.threadRepository.persist([thread]);
    return thread;
  }

  private async createMessageFromEmail(
    email: EmailEntity,
    thread: ThreadEntity
  ): Promise<MessageEntity> {
    const user = await this.userRepository.findByEmail(email.from.email);
    const messageSenderId = user?.id ?? null;

    const message = MessageEntity.createFromEmail(
      messageSenderId,
      thread.id!,
      email
    );
    return message;
  }
}
