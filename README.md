# NyayaAI ⚖️

NyayaAI is an AI-powered judicial intelligence platform specifically designed for the Indian Legal System. It aims to empower lawyers and judges by delivering highly accurate legal research, citation verification, and compliance-guided legal drafting for Supreme Court petitions.

---

## 🚀 Key Features

1. **Precision Legal Research**: Semantic and hybrid search over Indian Criminal Law statutes and case precedents with zero-hallucination citation verification.
2. **Supreme Court Drafting Pipeline**: Section-by-section automated drafting tool aligned with standard filing guidelines (Synopsis, List of Dates, Questions of Law, Grounds, Prayers).
3. **Automated Admin Ingestion**: Dynamic PDF and raw text processing engine utilizing MongoDB and Qdrant vector indexing.
4. **Deep-Linking**: Direct document viewing mapping back to official page and paragraph numbers.

---

## 🛠️ Architecture & Stack (Zero-Cost Local Development)

- **Backend**: FastAPI (Python)
- **Vector Search**: Qdrant (Local Docker or In-Memory)
- **Document Store**: MongoDB (Local Community Server)
- **Embeddings**: Local HuggingFace Models (`sentence-transformers`)
- **LLM Engine**: Google Gemini API (Free Tier) / Local Llama-3 (Ollama)

---

## 📂 Project Structure

```
nyaya-ai/
│
├── docs/                      # Technical designs and data strategies
├── backend/                   # FastAPI backend services
│   ├── app/
│   │   ├── api/               # API Router and v1 endpoints
│   │   ├── core/              # Global configuration
│   │   ├── models/            # Schema validation
│   │   └── services/          # Core RAG, Drafting, and Ingestion logic
│   ├── requirements.txt       # Dependencies
│   └── .env.example           # Environment template
└── .gitignore                 # Version control exclusions
```

---

## ⚙️ Setting Up

1. **Clone the Repo** (if not already local).
2. **Setup Virtual Environment**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Boot Up Backend**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
