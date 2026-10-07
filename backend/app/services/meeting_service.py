import uuid
from datetime import timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from app.utils import generate_meeting_id, utc_now
from app.config import FRONTEND_BASE_URL

class ServiceError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message

def _build_invite_link(meeting_id: str) -> str:
    return f"{FRONTEND_BASE_URL}/j/{meeting_id}"

def _to_schema(meeting: models.Meeting) -> schemas.Meeting:
    schema = schemas.Meeting.model_validate(meeting)
    schema.invite_link = _build_invite_link(meeting.meeting_id)
    return schema

def _to_participant_schema(participant: models.Participant, meeting: models.Meeting) -> schemas.Participant:
    schema = schemas.Participant.model_validate(participant)
    schema.meeting_id = meeting.meeting_id # Return the 9-digit ID as requested
    return schema

def create_meeting(db: Session, host_id: str, title: str = None) -> schemas.Meeting:
    user = db.query(models.User).filter(models.User.id == host_id).first()
    if not user:
        raise ServiceError("NOT_FOUND", "Host user not found")

    title = title or "New Meeting"
    for _ in range(5):
        try:
            meeting_id = generate_meeting_id()
            now = utc_now()
            db_meeting = models.Meeting(
                id=f"m_{uuid.uuid4().hex}",
                meeting_id=meeting_id,
                host_id=host_id,
                title=title,
                description="",
                scheduled_at=now,
                timezone="UTC",
                duration_minutes=60,
                status="live",
                started_at=now,
                created_at=now
            )
            db.add(db_meeting)
            db.commit()
            db.refresh(db_meeting)
            return _to_schema(db_meeting)
        except IntegrityError:
            db.rollback()
            continue
    raise ServiceError("UNKNOWN", "Failed to generate unique meeting ID")

def get_meeting(db: Session, meeting_id: str) -> schemas.Meeting:
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise ServiceError("NOT_FOUND", "Meeting not found")
    return _to_schema(meeting)

def get_upcoming_meetings(db: Session) -> list[schemas.Meeting]:
    meetings = db.query(models.Meeting).filter(
        models.Meeting.status.in_(["scheduled", "live"])
    ).order_by(models.Meeting.scheduled_at.asc()).all()
    return [_to_schema(m) for m in meetings]

def get_recent_meetings(db: Session) -> list[schemas.Meeting]:
    meetings = db.query(models.Meeting).filter(
        models.Meeting.status == "ended"
    ).order_by(models.Meeting.ended_at.desc()).all()
    return [_to_schema(m) for m in meetings]

def schedule_meeting(db: Session, input_data: schemas.ScheduleMeetingInput) -> schemas.Meeting:
    user = db.query(models.User).filter(models.User.id == input_data.host_id).first()
    if not user:
        raise ServiceError("NOT_FOUND", "Host user not found")

    now = utc_now()
    if input_data.scheduled_at < now - timedelta(minutes=1):
        raise ServiceError("VALIDATION", "Scheduled date cannot be in the past")

    for _ in range(5):
        try:
            meeting_id = generate_meeting_id()
            db_meeting = models.Meeting(
                id=f"m_{uuid.uuid4().hex}",
                meeting_id=meeting_id,
                host_id=input_data.host_id,
                title=input_data.title,
                description=input_data.description,
                scheduled_at=input_data.scheduled_at,
                timezone=input_data.timezone,
                duration_minutes=input_data.duration,
                status="scheduled",
                created_at=now
            )
            db.add(db_meeting)
            db.commit()
            db.refresh(db_meeting)
            return _to_schema(db_meeting)
        except IntegrityError:
            db.rollback()
            continue
    raise ServiceError("UNKNOWN", "Failed to generate unique meeting ID")

def join_meeting(db: Session, meeting_id: str, display_name: str, user_id: str = None) -> schemas.Participant:
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise ServiceError("NOT_FOUND", "Meeting not found")

    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise ServiceError("NOT_FOUND", "User not found")

    # Check for existing active join
    if user_id:
        existing = db.query(models.Participant).filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.user_id == user_id,
            models.Participant.left_at.is_(None)
        ).first()
        if existing:
            return _to_participant_schema(existing, meeting)

    now = utc_now()
    if meeting.status == "scheduled":
        meeting.status = "live"
        if not meeting.started_at:
            meeting.started_at = now
        db.add(meeting)

    role = "host" if user_id == meeting.host_id else "participant"
    
    participant = models.Participant(
        id=f"p_{uuid.uuid4().hex}",
        meeting_id=meeting.id,
        user_id=user_id,
        display_name=display_name,
        role=role,
        joined_at=now
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return _to_participant_schema(participant, meeting)

def get_participants(db: Session, meeting_id: str) -> list[schemas.Participant]:
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise ServiceError("NOT_FOUND", "Meeting not found")

    participants = db.query(models.Participant).filter(
        models.Participant.meeting_id == meeting.id,
        models.Participant.left_at.is_(None)
    ).all()
    
    return [_to_participant_schema(p, meeting) for p in participants]

def leave_meeting(db: Session, meeting_id: str, participant_id: str) -> None:
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise ServiceError("NOT_FOUND", "Meeting not found")

    participant = db.query(models.Participant).filter(
        models.Participant.id == participant_id,
        models.Participant.meeting_id == meeting.id
    ).first()

    if not participant:
        return

    now = utc_now()
    participant.left_at = now
    
    if participant.role == "host":
        meeting.status = "ended"
        meeting.ended_at = now
        db.add(meeting)

    db.add(participant)
    db.commit()
