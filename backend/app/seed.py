import uuid
from datetime import timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app import models
from app.utils import utc_now

def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if empty
        if db.query(models.User).first():
            return
        
        now = utc_now()
        
        user1 = models.User(
            id="u_1",
            name="Priya Sharma",
            email="priya.sharma@acmecorp.com",
            avatar_color="#0B5CFF",
            created_at=now
        )
        user2 = models.User(
            id="u_2",
            name="Alex Johnson",
            email="alex.johnson@acmecorp.com",
            avatar_color="#FF742E",
            created_at=now
        )
        db.add_all([user1, user2])
        db.flush()
        
        # Test meeting
        m_test = models.Meeting(
            id="m_test",
            meeting_id="123456789",
            host_id="u_2",
            title="Q4 Product Roadmap Review",
            description="Discussing Q4 roadmap.",
            scheduled_at=now,
            timezone="UTC",
            duration_minutes=60,
            status="live",
            started_at=now,
            created_at=now
        )
        
        # Upcoming meetings
        m_up_1 = models.Meeting(
            id="m_up_1",
            meeting_id="234567890",
            host_id="u_1",
            title="Engineering Weekly Sync",
            description="Weekly sync with the engineering team.",
            scheduled_at=now + timedelta(days=1),
            timezone="UTC",
            duration_minutes=30,
            status="scheduled",
            created_at=now
        )
        m_up_2 = models.Meeting(
            id="m_up_2",
            meeting_id="345678901",
            host_id="u_1",
            title="Design System Refinement",
            description="Review new Figma components.",
            scheduled_at=now + timedelta(days=2),
            timezone="UTC",
            duration_minutes=45,
            status="scheduled",
            created_at=now
        )
        
        # Recent meetings
        m_rec_1 = models.Meeting(
            id="m_rec_1",
            meeting_id="456789012",
            host_id="u_1",
            title="Sprint Planning",
            description="",
            scheduled_at=now - timedelta(days=1),
            timezone="UTC",
            duration_minutes=60,
            status="ended",
            started_at=now - timedelta(days=1),
            ended_at=now - timedelta(days=1) + timedelta(minutes=60),
            created_at=now
        )
        m_rec_2 = models.Meeting(
            id="m_rec_2",
            meeting_id="567890123",
            host_id="u_1",
            title="1:1 with Manager",
            description="",
            scheduled_at=now - timedelta(days=2),
            timezone="UTC",
            duration_minutes=30,
            status="ended",
            started_at=now - timedelta(days=2),
            ended_at=now - timedelta(days=2) + timedelta(minutes=30),
            created_at=now
        )
        m_rec_3 = models.Meeting(
            id="m_rec_3",
            meeting_id="678901234",
            host_id="u_1",
            title="All Hands Meeting",
            description="",
            scheduled_at=now - timedelta(days=5),
            timezone="UTC",
            duration_minutes=60,
            status="ended",
            started_at=now - timedelta(days=5),
            ended_at=now - timedelta(days=5) + timedelta(minutes=60),
            created_at=now
        )
        db.add_all([m_test, m_up_1, m_up_2, m_rec_1, m_rec_2, m_rec_3])
        db.flush()
        
        # Participants for test meeting
        p_1 = models.Participant(
            id="p_1",
            meeting_id="m_test",
            user_id="u_2",
            display_name="Alex Johnson",
            role="host",
            joined_at=now
        )
        p_2 = models.Participant(
            id="p_2",
            meeting_id="m_test",
            user_id=None,
            display_name="Sam Wilson",
            role="participant",
            joined_at=now + timedelta(seconds=60)
        )
        p_3 = models.Participant(
            id="p_3",
            meeting_id="m_test",
            user_id=None,
            display_name="Jordan Lee",
            role="participant",
            joined_at=now + timedelta(seconds=120)
        )
        p_4 = models.Participant(
            id="p_4",
            meeting_id="m_test",
            user_id=None,
            display_name="Casey Smith",
            role="participant",
            joined_at=now + timedelta(seconds=180)
        )
        db.add_all([p_1, p_2, p_3, p_4])
        
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
    print("Database seeded.")
