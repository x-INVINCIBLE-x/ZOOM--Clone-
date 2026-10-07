# ZOOM WEB APP CLONE, PHASE 2 PLAN

## Folder Structure
```text
backend/
  app/
    main.py
    config.py
    database.py
    models.py
    schemas.py
    services/
      meeting_service.py
    routers/
      meetings.py
    utils.py
    seed.py
  tests/
    test_meetings.py
  requirements.txt
  .env.example
```

## Schema Models
1. **User**: id, name, email, avatar_color, created_at
2. **Meeting**: id, meeting_id, host_id, title, description, scheduled_at, timezone, duration_minutes, status, started_at, ended_at, created_at
3. **Participant**: id, meeting_id, user_id, display_name, role, joined_at, left_at

## Endpoints (match exact phase 1 service)
- `POST /meetings`
- `GET /meetings/upcoming`
- `GET /meetings/recent`
- `POST /meetings/schedule`
- `GET /meetings/{meeting_id}`
- `POST /meetings/{meeting_id}/join`
- `GET /meetings/{meeting_id}/participants`
- `POST /meetings/{meeting_id}/leave`
- `GET /health`

## Workflow
1. Scaffold Python project and install dependencies (`fastapi`, `sqlalchemy`, `pydantic`, `pytest`).
2. Create `database.py`, `models.py`, `config.py` handling SQLite with FK checks.
3. Add `seed.py` reflecting `lib/mock-data.ts`.
4. Create `schemas.py` with `camelCase` conversion.
5. Create `utils.py`, `services/meeting_service.py` to enforce business rules.
6. Create routers and `main.py` (with CORS and exception handlers).
7. Write and pass `pytest` tests.
8. Wire Next.js frontend to use real API instead of mock.
