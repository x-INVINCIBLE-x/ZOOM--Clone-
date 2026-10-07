from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routers import meetings
from app.config import CORS_ORIGINS
from app.services.meeting_service import ServiceError
from app.seed import run_seed

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_seed()
    yield

app = FastAPI(title="Zoom Clone API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip().rstrip('/') for origin in CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(ServiceError)
async def service_error_handler(request: Request, exc: ServiceError):
    status_code = 400
    if exc.code == "NOT_FOUND":
        status_code = 404
    elif exc.code == "VALIDATION":
        status_code = 422
    elif exc.code == "UNKNOWN":
        status_code = 500
        
    return JSONResponse(
        status_code=status_code,
        content={"code": exc.code, "message": exc.message}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"code": "VALIDATION", "message": str(exc.errors()[0].get("msg", "Validation error"))}
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": "UNKNOWN", "message": "An unexpected error occurred"}
    )

app.include_router(meetings.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
