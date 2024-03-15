### Task 4: Preventing Duplicate Imports in Parallel Email Processing

Consider a scenario where emails of different users are imported daily through parallel execution processes. When multiple users interact with the service, it's possible for the service to import emails having the same `Message-Id` (for example, when user A sends an email to users B and C, both B and C will have emails in their inboxes with the same `Message-Id`).

Given that import processes are executed in parallel, there's a risk that emails corresponding to a specific `Message-Id` might be imported multiple times. Explain how you would ensure that only a single instance of an email is imported for each unique `Message-Id`? Your response may involve infrastructure or architectural changes if needed, but this is not required. Do not implement the solution, just describe the approach you would take.

#### Answer

Since we are using SQL, I would make use of the database feature for conflict resolution by setting a unique index on the `Message-Id`. i.e. to do a "INSERT INTO ... ON CONFLICT DO NOTHING;"

Similary for the threads, I would add an additional column to store the Message-Id of the "head" and implement a unique index on this column. As currently there is no way to prevent concurrent insert of the same thread.
