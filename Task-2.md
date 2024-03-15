### Task 2: Take messages stored in database into account

In the first task, you organized messages into threads by matching the `In-Reply-To` field with the `Message-Id` field, but this was limited to emails freshly fetched and loaded into memory. However, consider the scenario where emails matching the `In-Reply-To` value are not present in the `fetchedEmails` array but have instead been stored in the database from a previous run of the `EmailImportService`.

#### Questions

1. To include messages already stored in the database, which existing repository method should be leveraged?
2. Describe how you would use this method to achieve the intended outcome. Implementation details are not required, just a clear explanation of your approach.


#### Answers
1. findOneByEmailUniversalMessageIdentifier on MessageRepository
2. In the existing implementation from Task 1, I use a hashmap so I can look up the current list of emails imported. In the case where the In-Reply-To cannot be found in the hashmap, we will then have to look up in the database by calling findOneByEmailUniversalMessageIdentifier(). 
If the message cannot be found, an error needs to be thrown (see note below on assumption). 

Depending on chunk size of each sync, or should there be a need to reduce db calls, we might have to implement a separate findByEmailUniversalMessageIdentifiers to bulk pull the messages / threads.

I am also making an assumption here that we will be able to retrieve sorted emails from "the beginning of time" from the underlying API, i.e. a thread is basically a linked-list, and we should be able to identify and persist the head before processing the "children". (Not necessary but makes thing easier in my opinion.)
If the underlying API does not provide this, we will then have to do an initial load of all current emails inside the fetcher service before processing and creating the messages / threads.
