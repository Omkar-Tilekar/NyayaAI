from fastapi import APIRouter, HTTPException

router = APIRouter()

# 🟢 TYPE YOURSELF: Practice creating API routes in FastAPI.
# Uncomment or type the code below.
#
# Why this file exists: It handles all lawyer research queries, searching
# local databases (Qdrant + Mongo) and fallback web sources.
#
# Common mistake: Forgetting to handle exceptions when DB is down.
#
# How it will evolve: Later we will add dense vector similarity search, 
# sparse BM25 query logic, and MongoDB document fetchers.

@router.get("/search")
async def search_cases(q: str, limit: int = 5):
    """Endpoint to search for relevant criminal cases.
    Currently returns a mock payload until Qdrant is connected.
    """
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    return {
        "query": q,
        "results": [
            {
                "title": "State of Maharashtra v. XYZ (Mock Case)",
                "citation": "2024 INSC 999",
                "relevance_score": 0.95,
                "snippet": "This is a placeholder result showing semantic matching on criminal bail issues.",
                "mongo_id": "mock_mongo_id_123",
                "page_number": 3
            }
        ]
    }


@router.get("/document/{doc_id}")
async def get_document(doc_id: str):
    """
    Endpoint to retrieve the full document context from MongoDB.
    """
    return {
        "id": doc_id,
        "title": "State of Maharashtra v. XYZ (Mock Case)",
        "full_text": "This is the complete text of the judgment fetched from MongoDB...",
        "citation": "2024 INSC 999"
    }