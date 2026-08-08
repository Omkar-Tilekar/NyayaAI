from fastapi import APIRouter, HTTPException

router = APIRouter()

# 🟢 TYPE YOURSELF: Practice creating API routes in FastAPI.
# Uncomment or type the code below.
#
# Why this file exists: To provide lawyers with Supreme Court-standard
# petitions using a modular section-by-section drafting pipeline.
#
# Common mistake: Forgetting to validate input schemas (e.g. empty case facts).
#
# How it will evolve: Later we will connect this to Pydantic schemas and 
# an LLM service that consumes case timelines to draft distinct sections.

@router.post("/draft")
async def generate_draft(case_data: dict):
    """
    Endpoint to initiate document drafting.
    Receives case details and drafts specific petition sections.
    """
    if "facts" not in case_data:
        raise HTTPException(status_code=400, detail="Case facts are required for drafting")
        
    return {
        "status": "success",
        "drafts": {
            "synopsis": "Based on facts: Synopsis draft...",
            "list_of_dates": "1. 01/01/2026: Incident occurred...",
            "questions_of_law": "Whether the court erred in ignoring statutory bail rights...",
            "grounds": "Ground A: The lower court misapplied Section 439 CrPC...",
            "prayer": "Therefore, the petitioner prays that bail be granted..."
        }
    }
