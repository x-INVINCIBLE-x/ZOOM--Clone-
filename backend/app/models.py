from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, CheckConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    avatar_color = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(String, primary_key=True)
    meeting_id = Column(String, nullable=False, unique=True)
    host_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False, default="")
    scheduled_at = Column(DateTime, nullable=False)
    timezone = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)
    
    __table_args__ = (
        CheckConstraint("length(meeting_id) = 9 AND meeting_id GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'"),
        CheckConstraint("duration_minutes >= 1 AND duration_minutes <= 1440"),
        CheckConstraint("status IN ('scheduled', 'live', 'ended')"),
        Index("idx_status_scheduled_at", "status", "scheduled_at"),
    )

class Participant(Base):
    __tablename__ = "participants"
    
    id = Column(String, primary_key=True)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    display_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    joined_at = Column(DateTime, nullable=False)
    left_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        CheckConstraint("role IN ('host', 'participant')"),
        Index("idx_meeting_left_at", "meeting_id", "left_at"),
    )
