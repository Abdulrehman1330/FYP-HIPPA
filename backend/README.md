# Backend

The backend starts as one FastAPI codebase with modular folders instead of separate microservices.

Why:

- easier to manage with a 3-person team
- shared auth, database, and document processing logic
- fewer deployment and integration problems during MVP
