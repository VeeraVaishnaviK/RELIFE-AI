from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from beanie import PydanticObjectId
from datetime import datetime

from app.models.inspection import VoiceInspectionLog, Inspection
from app.models.user import User
from app.services.voice_parser import VoiceParser
from app.core.security import get_current_user

router = APIRouter(prefix="/voice-inspection", tags=["Voice-to-Defect NLP Parser"])

class VoiceParseRequest(BaseModel):
    raw_transcript: str
    inspection_id: Optional[str] = None

@router.post("/parse")
async def parse_voice_inspection(
    req: VoiceParseRequest,
    current_user: User = Depends(get_current_user)
):
    if not req.raw_transcript or not req.raw_transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript text cannot be empty")

    parsed_result = VoiceParser.parse_transcript(req.raw_transcript)

    insp_oid = None
    if req.inspection_id and PydanticObjectId.is_valid(req.inspection_id):
        insp_oid = PydanticObjectId(req.inspection_id)
    else:
        # Dummy or placeholder inspection ID if called pre-inspection
        insp_oid = PydanticObjectId()

    log_entry = VoiceInspectionLog(
        inspection_id=insp_oid,
        raw_transcript=req.raw_transcript,
        parsed_output=parsed_result,
        inspector_id=current_user.id,
        created_at=datetime.utcnow()
    )
    await log_entry.insert()

    return {
        "success": True,
        "log_id": str(log_entry.id),
        "parsed_output": parsed_result
    }
