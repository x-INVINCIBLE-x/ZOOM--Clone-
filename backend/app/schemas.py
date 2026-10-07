from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator
from typing import Optional, List
from typing_extensions import Annotated
from datetime import datetime
import zoneinfo

class CamelModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        alias_generator=lambda x: ''.join(word.capitalize() if i else word for i, word in enumerate(x.split('_')))
    )

class User(CamelModel):
    id: str
    name: str
    email: str
    avatar_color: str
    created_at: datetime

class Meeting(CamelModel):
    id: str
    meeting_id: str
    host_id: str
    title: str
    description: str
    scheduled_at: datetime
    timezone: str
    duration_minutes: int = Field(serialization_alias="duration")
    status: str
    invite_link: str = ""
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)

class Participant(CamelModel):
    id: str
    meeting_id: str
    user_id: Optional[str]
    display_name: str
    role: str
    joined_at: datetime
    left_at: Optional[datetime]

class CreateMeetingInput(CamelModel):
    host_id: str
    title: Optional[Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]] = None

class ScheduleMeetingInput(CamelModel):
    host_id: str
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
    description: Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)]
    scheduled_at: datetime
    timezone: str
    duration: int = Field(ge=1, le=1440)

    @field_validator('timezone')
    @classmethod
    def validate_timezone(cls, v: str) -> str:
        try:
            zoneinfo.ZoneInfo(v)
            return v
        except zoneinfo.ZoneInfoNotFoundError:
            raise ValueError("Invalid IANA timezone")

class JoinMeetingInput(CamelModel):
    display_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    user_id: Optional[str] = None

class LeaveMeetingInput(CamelModel):
    participant_id: str

class ErrorResponse(CamelModel):
    code: str
    message: str
