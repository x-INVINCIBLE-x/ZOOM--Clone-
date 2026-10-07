import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app import models
from app.utils import utc_now

# In-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        # Seed test user
        if not db.query(models.User).first():
            user = models.User(id="u_1", name="Test User", email="test@test.com", avatar_color="#fff", created_at=utc_now())
            db.add(user)
            db.commit()
        # Enforce foreign keys for this test session
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_instant_meeting():
    response = client.post("/meetings", json={"hostId": "u_1"})
    assert response.status_code == 201
    data = response.json()
    assert "meetingId" in data
    assert len(data["meetingId"]) == 9
    assert data["status"] == "live"
    assert "startedAt" in data
    assert data["inviteLink"].endswith(data["meetingId"])

def test_two_created_meetings_different_ids():
    r1 = client.post("/meetings", json={"hostId": "u_1"})
    r2 = client.post("/meetings", json={"hostId": "u_1"})
    assert r1.json()["meetingId"] != r2.json()["meetingId"]

def test_schedule_success():
    payload = {
        "hostId": "u_1",
        "title": "Scheduled Meeting",
        "description": "desc",
        "scheduledAt": "2100-01-01T10:00:00Z",
        "timezone": "UTC",
        "duration": 60
    }
    response = client.post("/meetings/schedule", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Scheduled Meeting"
    assert data["status"] == "scheduled"
    assert data["duration"] == 60

def test_schedule_empty_title():
    payload = {
        "hostId": "u_1",
        "title": "",
        "description": "desc",
        "scheduledAt": "2100-01-01T10:00:00Z",
        "timezone": "UTC",
        "duration": 60
    }
    response = client.post("/meetings/schedule", json=payload)
    assert response.status_code == 422

def test_schedule_past_date():
    payload = {
        "hostId": "u_1",
        "title": "Past",
        "description": "desc",
        "scheduledAt": "2000-01-01T10:00:00Z",
        "timezone": "UTC",
        "duration": 60
    }
    response = client.post("/meetings/schedule", json=payload)
    assert response.status_code == 422
    assert response.json()["code"] == "VALIDATION"

def test_schedule_invalid_timezone():
    payload = {
        "hostId": "u_1",
        "title": "TZ",
        "description": "desc",
        "scheduledAt": "2100-01-01T10:00:00Z",
        "timezone": "Fake/Zone",
        "duration": 60
    }
    response = client.post("/meetings/schedule", json=payload)
    assert response.status_code == 422

def test_get_meeting_found_not_found():
    r = client.post("/meetings", json={"hostId": "u_1"})
    m_id = r.json()["meetingId"]
    
    # Found
    r2 = client.get(f"/meetings/{m_id}")
    assert r2.status_code == 200
    assert r2.json()["meetingId"] == m_id
    
    # Not found
    r3 = client.get("/meetings/111111111")
    assert r3.status_code == 404
    assert r3.json()["code"] == "NOT_FOUND"

    # Malformed ID
    r4 = client.get("/meetings/123")
    assert r4.status_code == 422

def test_join_first_sets_live():
    # schedule
    payload = {
        "hostId": "u_1",
        "title": "J",
        "description": "",
        "scheduledAt": "2100-01-01T10:00:00Z",
        "timezone": "UTC",
        "duration": 60
    }
    r = client.post("/meetings/schedule", json=payload)
    m_id = r.json()["meetingId"]
    assert r.json()["status"] == "scheduled"
    
    # join as guest
    r2 = client.post(f"/meetings/{m_id}/join", json={"displayName": "Guest"})
    assert r2.status_code == 200
    assert r2.json()["role"] == "participant"
    assert r2.json()["userId"] is None
    
    # get meeting
    r3 = client.get(f"/meetings/{m_id}")
    assert r3.json()["status"] == "live"
    assert r3.json()["startedAt"] is not None

def test_leave():
    r = client.post("/meetings", json={"hostId": "u_1"})
    m_id = r.json()["meetingId"]
    
    # Join host
    rj = client.post(f"/meetings/{m_id}/join", json={"displayName": "Host", "userId": "u_1"})
    p_id = rj.json()["id"]
    
    # Join guest
    rj2 = client.post(f"/meetings/{m_id}/join", json={"displayName": "Guest"})
    p2_id = rj2.json()["id"]
    
    # Guest leaves
    rl = client.post(f"/meetings/{m_id}/leave", json={"participantId": p2_id})
    assert rl.status_code == 204
    
    m = client.get(f"/meetings/{m_id}")
    assert m.json()["status"] == "live"
    
    # Host leaves
    rl2 = client.post(f"/meetings/{m_id}/leave", json={"participantId": p_id})
    assert rl2.status_code == 204
    
    m2 = client.get(f"/meetings/{m_id}")
    assert m2.json()["status"] == "ended"

def test_foreign_keys_enforced():
    db = TestingSessionLocal()
    # Try inserting participant with fake meeting_id
    from sqlalchemy.exc import IntegrityError
    p = models.Participant(id="p_fake", meeting_id="m_fake", user_id=None, display_name="A", role="participant", joined_at=utc_now())
    db.add(p)
    with pytest.raises(IntegrityError):
        db.commit()
    db.close()
