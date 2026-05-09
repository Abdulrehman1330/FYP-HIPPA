# Clinician Web

Main frontend for clinicians and staff.

Planned responsibilities:

- Secure login
- Document upload
- Extraction review
- Plan of Care editing
- Risk score visualization

## Current RAG Demo

The current frontend milestone is a static clinician RAG chatbot demo:

```text
public/rag-chatbot-demo.html
```

Run the backend first:

```powershell
uvicorn backend.api.app.main:app --reload
```

Then serve the static page:

```powershell
cd apps\clinician-web\public
python -m http.server 8001
```

Open:

```text
http://127.0.0.1:8001/rag-chatbot-demo.html
```

Demo behavior:

- Ask clinician questions against `/rag/question`.
- Generate cited Plan of Care goals through `/rag/poc-section`.
- Show source snippets and confidence.
- Refuse unsupported insulin questions.
- Switch to reviewer role and load recent audit events.

This is a demo screen until the real Next.js app is scaffolded.
