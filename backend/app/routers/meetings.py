from fastapi import APIRouter, Depends, Path, HTTPException
from sqlalchemy.orm import Session
import re

from app import schemas
from app.database import get_db
from app.services import meeting_service

router = APIRouter(prefix="/meetings", tags=["Meetings"])

def validate_meeting_id(meeting_id: str = Path(..., description="The 9-digit meeting ID")):
    if not re.match(r"^\d{9}$", meeting_id):
        from app.services.meeting_service import ServiceError
        raise ServiceError("VALIDATION", "Invalid meeting ID format")
    return meeting_id

@router.post("", response_model=schemas.Meeting, status_code=201)
def create_meeting(input_data: schemas.CreateMeetingInput, db: Session = Depends(get_db)):
    return meeting_service.create_meeting(db, input_data.host_id, input_data.title)

@router.get("/upcoming", response_model=list[schemas.Meeting])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    return meeting_service.get_upcoming_meetings(db)

@router.get("/recent", response_model=list[schemas.Meeting])
def get_recent_meetings(db: Session = Depends(get_db)):
    return meeting_service.get_recent_meetings(db)

@router.post("/schedule", response_model=schemas.Meeting, status_code=201)
def schedule_meeting(input_data: schemas.ScheduleMeetingInput, db: Session = Depends(get_db)):
    return meeting_service.schedule_meeting(db, input_data)

@router.get("/{meeting_id}", response_model=schemas.Meeting)
def get_meeting(meeting_id: str = Depends(validate_meeting_id), db: Session = Depends(get_db)):
    return meeting_service.get_meeting(db, meeting_id)

@router.post("/{meeting_id}/join", response_model=schemas.Participant)
def join_meeting(input_data: schemas.JoinMeetingInput, meeting_id: str = Depends(validate_meeting_id), db: Session = Depends(get_db)):
    return meeting_service.join_meeting(db, meeting_id, input_data.display_name, input_data.user_id)

@router.get("/{meeting_id}/participants", response_model=list[schemas.Participant])
def get_participants(meeting_id: str = Depends(validate_meeting_id), db: Session = Depends(get_db)):
    return meeting_service.get_participants(db, meeting_id)

@router.post("/{meeting_id}/leave", status_code=204)
def leave_meeting(input_data: schemas.LeaveMeetingInput, meeting_id: str = Depends(validate_meeting_id), db: Session = Depends(get_db)):
    meeting_service.leave_meeting(db, meeting_id, input_data.participant_id)
    return
