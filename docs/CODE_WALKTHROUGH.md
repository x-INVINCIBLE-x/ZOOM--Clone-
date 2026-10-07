# Code Walkthrough

## 1. How a meeting is created
**Files/Functions:** `backend/app/routers/meetings.py` (`create_meeting`), `backend/app/services/meeting_service.py` (`create_meeting`), `lib/api/meetings.ts` (`createMeeting`)

When the user clicks "New Meeting", the frontend calls `createMeeting()` in `lib/api/meetings.ts`. This sends a POST request to `/api/meetings` containing the host's user ID and a generated title. The FastAPI backend router catches this and delegates to `meeting_service.create_meeting()`, which generates a unique 9-digit meeting ID, creates a new database record, and immediately adds the host as the first participant.

## 2. How the Meeting ID is generated and kept unique
**Files/Functions:** `backend/app/utils.py` (`generate_meeting_id`), `backend/app/services/meeting_service.py` (`create_meeting`)

`generate_meeting_id()` creates a random 9-digit string string formatted exactly like a real Zoom ID. Uniqueness is guaranteed by a `while True:` loop in `meeting_service.create_meeting()`. The service generates an ID, queries the database to see if it exists, and if it does, it generates a new one. It repeats this until it finds a unique ID, then inserts the meeting into the SQLite database.

## 3. How meetings are stored (schema and relationships)
**Files/Functions:** `backend/app/models.py` (`Meeting`, `Participant`)

Meetings are stored in a SQLite database using SQLAlchemy. The schema consists of two models: `Meeting` and `Participant`. 
- `Meeting` stores the `meeting_id` (primary key), `title`, `description`, `host_id`, `start_time`, `duration_minutes`, and `status`.
- `Participant` stores the participant's `id`, `meeting_id` (foreign key), `display_name`, `role`, and `joined_at`.
The relationship is one-to-many: a `Meeting` can have multiple `Participant`s. A cascade rule (`cascade="all, delete-orphan"`) ensures that deleting a meeting automatically deletes all associated participants.

## 4. How a meeting is found
**Files/Functions:** `backend/app/services/meeting_service.py` (`get_meeting`), `backend/app/routers/meetings.py` (`get_meeting`)

When a user tries to view or join a meeting, the frontend sends a GET request to `/api/meetings/{meeting_id}`. The service layer queries the database using `db.query(models.Meeting).filter_by(meeting_id=meeting_id).first()`. If no meeting matches the ID, it explicitly raises a `ServiceError` with code `NOT_FOUND`, which the router translates into a 404 HTTP response.

## 5. How joining works
**Files/Functions:** `backend/app/services/meeting_service.py` (`join_meeting`), `components/forms/JoinMeetingForm.tsx`

When a user submits the Join form, `meeting_service.join_meeting()` runs. It first verifies the meeting exists and isn't ended. It then checks if the user is the host. If they aren't, they are assigned the "attendee" role. A new `Participant` record is created in the database. The frontend then automatically redirects the user to `/meeting/[meeting_id]`, passing the participant data to the `MeetingRoom` component.

## 6. How scheduling works
**Files/Functions:** `backend/app/services/meeting_service.py` (`create_meeting`), `components/forms/ScheduleMeetingForm.tsx`

Scheduling works identically to creating an instant meeting, but it accepts additional optional payload parameters: `title`, `description`, `start_time`, and `duration_minutes`. The `ScheduleMeetingForm` collects this data and sends it in the POST request body. The service stores these values in the `Meeting` record. The dashboard UI fetches `/api/meetings` and separates them into "Upcoming" and "Recent" based on the `start_time` and `status`.

## 7. How the UI talks to the backend
**Files/Functions:** `lib/api/client.ts` (`apiClient`), `lib/api/meetings.ts`

All communication happens over HTTP using the browser's native `fetch` API. `apiClient` is a generic wrapper around `fetch` that automatically prepends the `API_BASE_URL`, sets the `Content-Type` to `application/json`, and parses the JSON response. `lib/api/meetings.ts` defines specific wrapper functions (`getMeeting`, `createMeeting`, etc.) that abstract away the URLs and HTTP methods, providing a clean TypeScript contract for the React components to use.

## 8. How errors travel from backend to UI
**Files/Functions:** `backend/app/main.py` (`service_error_handler`), `lib/api/client.ts` (`apiClient`)

When business logic fails (e.g., meeting ended, invalid ID), the backend raises a `ServiceError`. A global exception handler in FastAPI catches this and returns a standard JSON payload: `{"code": "ERROR_CODE", "message": "Human readable"}` along with the correct HTTP status code.
The frontend `apiClient` intercepts non-2xx responses, parses this JSON, and reconstructs an `ApiError` class in JavaScript. The UI components (like `JoinMeetingForm`) catch this thrown `ApiError` and display its `.message` property to the user inside a generic error toast or red text warning.
