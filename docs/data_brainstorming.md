# NyayaAI Data Strategy & Brainstorming

As a judicial intelligence platform for the Indian Legal System, specifically tailored for criminal cases, the data architecture must support high-fidelity research, structured legal drafting, and an automated ingestion pipeline.

---

## 1. Scope: Criminal Law & Cases
We will restrict our initial scope to Indian Criminal Law, focusing on:
- **Statutes**: The Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS), Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS), and Indian Evidence Act / Bharatiya Sakshya Adhiniyam (BSA).
- **Case Laws**: High Court and Supreme Court judgments relating to criminal law (e.g., murder, theft, bail matters, criminal appeals).

---

## 2. Storage & Retrieval Architecture
To achieve high fidelity and reliability, we will use a **dual-database architecture**:

```
                       ┌─────────────────────────┐
                       │      FastAPI App        │
                       └────────────┬────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│     Qdrant Vector     │                       │     MongoDB Store     │
│       Database        │                       │  (Original Sources)   │
├───────────────────────┤                       ├───────────────────────┤
│ • Dense Embeddings    │                       │ • Raw Case Judgments  │
│ • Sparse Vectors      │                       │ • Citation Metadata   │
│ • Article/Sec Chunks  │                       │ • SC Filing Templates │
└───────────────────────┘                       └───────────────────────┘
```

### A. Qdrant (Semantic & Hybrid Search)
- **Role**: Store vector embeddings of chunks (e.g., 500-token paragraphs of cases, legal sections).
- **Payload**: Minimal metadata (`chunk_id`, `case_id`, `section_reference`) to keep searches fast.
- **Sparse Vectors**: For exact statutory matching (e.g., "Section 302 IPC").

### B. MongoDB (Metadata & Raw Source Retrieval)
- **Role**: Store the full text of judgments, statutes, and metadata.
- **Why**: Lawyers need verified citations and the original context. When Qdrant returns a matching case block, we use the `case_id` to query MongoDB and retrieve the full judgment text and its official citation. This allows us to link the user back to the source document.

### C. Internet Search Fallback (Web Citation Window)
- For queries that don't match our local Qdrant/Mongo database, the system will use an external search API (e.g., Google Search API, DuckDuckGo, or a web scraper) to query legal websites and render results in a separate "Web Search Citations" pane.

---

## 3. Citation Verification & Deep Linking Strategy

To solve the challenge of citation maintenance (which often leads to hallucinations in LLMs), we will enforce a strict **metadata mapping contract** between Qdrant chunks and MongoDB documents.

### A. Qdrant Chunk Schema
Every chunk upserted to Qdrant must contain the following payload fields:
```json
{
  "mongo_id": "65f8a2b...",       // String ID referencing the full MongoDB doc
  "citation": "2023 INSC 123",    // Standard official citation
  "source_title": "State of Karnataka v. X", // Title of case or statute
  "page_number": 12,              // PDF/Doc Page offset (if available)
  "paragraph_number": 45,         // Paragraph offset (more reliable for judgments)
  "law_type": "criminal"          // Filter key
}
```

### B. Deep Linking in the Frontend
1. **Query**: The lawyer searches: *"Bail provisions under Section 439 CrPC for cheating cases"*.
2. **Retrieve**: Qdrant returns top 5 chunks.
3. **Render Snippets**: The UI displays these 5 snippets. Next to each snippet, it displays a **verified badge**: `[Citation: 2023 INSC 123 | Page 12]`.
4. **Open Document**: If the user clicks on the citation:
   - The FE makes an API call to `/api/v1/research/document/{mongo_id}`.
   - The backend retrieves the full text from MongoDB.
   - The FE loads the text in a side-by-side viewer, scrolling automatically to `page_number` 12 or highlighting the text corresponding to `paragraph_number` 45.

### C. LLM Integration (No Citation Hallucination)
- We do **not** let the LLM guess or generate citations.
- The LLM is fed the Qdrant chunks alongside their metadata.
- The prompt instructs the LLM: *"You must only cite cases using the format [1], [2], etc., corresponding to the provided context index."*
- Our API response post-processor maps `[1]` back to the actual verified MongoDB citation metadata object.

---

## 4. Automated Admin Ingestion Pipeline

To make the platform dynamic and let administrators add new cases without developer intervention:

```
┌───────────┐      Raw Text/PDF      ┌──────────────┐      Insert      ┌─────────┐
│ Admin UI  ├───────────────────────►│ FastAPI App  ├─────────────────►│ MongoDB │
└───────────┘                        └──────┬───────┘                  └─────────┘
                                            │
                                            ▼ (Async Background Task)
                                     ┌──────────────┐
                                     │  Text Split  │
                                     └──────┬───────┘
                                            │ Chunks
                                            ▼
                                     ┌──────────────┐
                                     │ Embeddings   │
                                     └──────┬───────┘
                                            │ Vectors + Metadata
                                            ▼
                                     ┌──────────────┐
                                     │ Qdrant Index │
                                     └──────────────┘
```

### A. The Ingestion Process Flow
1. **Upload**: An admin logs into the Admin Console and uploads a PDF or pastes the text of a new judgment, specifying details like *Title*, *Citation*, *Court*, and *Date*.
2. **Persistence**: The FastAPI server saves the raw document and metadata to MongoDB first. This returns a `mongo_id`.
3. **Async Task Hand-off**: The server triggers a background task (using FastAPI's `BackgroundTasks`) and immediately returns a `202 Accepted` status with a task ID back to the admin UI, ensuring the admin doesn't experience timeouts for large documents.
4. **Processing Pipeline**:
   - **Chunking**: The background worker splits the case text into overlap-bounded chunks.
   - **Vector Generation**: Generates embeddings for each chunk.
   - **Qdrant Sync**: Writes chunks and embeddings into Qdrant, referencing the original `mongo_id` and citation.
5. **Dynamic Searchability**: The new case is instantly indexed and searchable by lawyers.

---

## 5. Zero-Cost Student Tech Stack

You **do not need any budget** to build a highly accurate prototype of NyayaAI. We can run the entire pipeline locally on your computer using open-source, free tiers.

| Component | Cloud / Paid Option | **Free / Student Alternative** |
|---|---|---|
| **Vector DB** | Paid Qdrant Cloud | **Qdrant Local (Docker / In-Memory)** (100% Free, runs on local disk) |
| **Document Store** | MongoDB Atlas Paid | **MongoDB Community Edition** (Local install, free) or **Atlas Free Tier** (512MB, free forever) |
| **Embeddings** | OpenAI `text-embedding-3` | **Local Embeddings via HuggingFace** (`sentence-transformers` using `bge-small-en-v1.5` or `all-MiniLM-L6-v2`. Free, CPU-friendly) |
| **LLM Engine** | GPT-4o | **Google Gemini API Free Tier** (generous request limits, high accuracy) or **Groq Cloud API** (Free tier with Llama-3-70b) or **Local Ollama** (Llama-3 8B, 100% offline & free) |
| **Hosting** | Azure / AWS | **Localhost Development** (FastAPI + Streamlit/Vite run on local machine) |

---

## 6. Drafting System (Supreme Court Standards)

Legal drafting in the Supreme Court of India follows strict procedural rules (e.g., margins, font sizes, specific sections like Synopses, List of Dates, Questions of Law, Grounds, and Prayers).

### A. Modular Section-by-Section Pipeline
Instead of asking an LLM to generate a 20-page petition at once (which leads to hallucination and quality degradation), our pipeline will draft section-by-section:
1. **Synopsis & List of Dates**: Based on user-input timeline and case facts.
2. **Questions of Law**: Formulating the constitutional or legal questions.
3. **Grounds**: Connecting the case facts to relevant statutes (e.g., "For that the High Court erred in not appreciating Section 439 of CrPC...").
4. **Prayer**: The formal relief requested from the Court.

### B. Template Matching
We will store standard SC petition templates in MongoDB and feed them as context to the LLM to enforce structural compliance.
