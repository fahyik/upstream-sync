### Task 5: Testing

What do you believe is the most effective strategy for testing this project? What is your philosophy regarding testing?

#### Answer

The project is pretty well separated, so it should be fairly straight-forward to set up unit testing for the repositories and services.
Having said that, the main focus of testing for this project should be on data integrity and consistency, i.e. the email fetcher and import services.
In addition to unit testing, I would add some end-to-end testing on this part to make sure the import workflow functions correctly.

I am rather pragmatic when it comes to testing, the bare minimum is that we have automated tests written for important flows / functions.
