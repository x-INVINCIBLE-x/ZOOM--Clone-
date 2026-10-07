import random
from datetime import datetime, timezone

def generate_meeting_id() -> str:
    # 9 random digits, first digit non-zero
    first = random.randint(1, 9)
    rest = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{first}{rest}"

def utc_now() -> datetime:
    return datetime.now(timezone.utc)
