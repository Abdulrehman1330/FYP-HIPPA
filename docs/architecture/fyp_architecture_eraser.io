title Compact Architecture - HIPAA-Aware Home Health and Hospice AI Platform

// Compact report version for Eraser.io

Users [icon: users, color: gray, label: "Clinician / Reviewer / Admin"]

Secure MVP Platform [icon: shield, color: blue, label: "Secure HIPAA-Aware MVP Boundary\nRBAC, encryption, audit logs, synthetic/de-identified development data"] {

  Application Layer [color: blue, label: "Application Layer"] {
    Web App [icon: monitor, color: blue, label: "Next.js Web App\nLogin, upload, review,\nPOC editor, risk dashboard"]
    Backend API [icon: server, color: cyan, label: "FastAPI Backend\nAuth + RBAC\nWorkflow orchestration"]
    Review UI [icon: clipboard-check, color: cyan, label: "Human Review\nAccept / edit / reject\nFinal approval"]
  }

  AI Pipeline [color: green, label: "AI Pipeline"] {
    Document AI [icon: scan-text, color: green, label: "Document AI Pipeline\nOpenCV preprocessing\nTesseract OCR\nRule-based extraction\nValidation rules"]
    RAG Core [icon: network, color: green, label: "Core RAG Module\nBuild evidence corpus\nRetrieve top-k snippets\nGenerate cited POC draft\nMissing-evidence warnings"]
    Risk AI [icon: brain, color: green, label: "Readmission Risk AI\nScikit-learn baseline\nLogistic Regression / Random Forest\nSHAP explanations"]
  }

  Protected Data Layer [color: orange, label: "Protected Data Layer"] {
    Document Store [icon: database, color: orange, label: "Encrypted Document Store\nRaw OASIS-E2 / POC files"]
    Clinical DB [icon: database, color: orange, label: "PostgreSQL\nApproved structured records\nFinal POC outputs"]
    RAG Store [icon: database, color: orange, label: "Evidence + Vector Store\nSource snippets\nEmbeddings / TF-IDF index\nCitation IDs"]
    Model Store [icon: archive, color: orange, label: "Model Registry\nRisk models\nEncoders\nMetrics"]
  }

  Governance Layer [color: red, label: "Governance Layer"] {
    Security Controls [icon: lock, color: red, label: "Security Controls\nTLS, encryption at rest\nSecrets/config management\nMinimum necessary access"]
    Audit Metrics [icon: file-clock, color: red, label: "Audit + Metrics\nUser actions\nReview decisions\nRAG citations\nPrediction logs"]
  }
}

Optional External Services [icon: cloud, color: purple, label: "Optional only\nDocument AI benchmark\nHosted LLM generator backend\nRAG remains core MVP"]

// Main user access
Users > Web App: "1. Secure login and workflow access"
Web App > Backend API: "2. API requests"
Backend API > Security Controls: "3. Auth, RBAC, secrets"

// Document extraction flow
Backend API > Document Store: "4. Store uploaded OASIS/POC"
Document Store > Document AI: "5. Preprocess + OCR"
Document AI > Review UI: "6. Extracted fields + validation flags"
Review UI > Clinical DB: "7. Approved structured record"
Review UI > RAG Store: "8. Approved source snippets"

// RAG-based POC flow
Clinical DB > RAG Core: "9. Approved fields"
RAG Store > RAG Core: "10. Retrieved evidence"
RAG Core > Review UI: "11. Cited POC draft"
Review UI > Clinical DB: "12. Final approved POC"

// Risk prediction flow
Clinical DB > Risk AI: "13. Validated features"
Model Store > Risk AI: "14. Model + encoders"
Risk AI > Web App: "15. Risk score + SHAP factors"

// Audit and monitoring
Backend API > Audit Metrics: "Access + API logs"
Review UI > Audit Metrics: "Review + approval logs"
RAG Core > Audit Metrics: "Retrieval + citation logs"
Risk AI > Audit Metrics: "Prediction logs"

// Optional benchmarks
Document AI -.-> Optional External Services: "Optional comparison"
RAG Core -.-> Optional External Services: "Optional LLM backend"
