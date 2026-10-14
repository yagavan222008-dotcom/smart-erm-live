from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.router import api_router
from app.models import Patient, Doctor, Bed, Treatment, AuditEvent, ApplicationSetting
from app.services.seed_service import SeedService
from app.services.dsa_manager import dsa_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)

    # Rebuild DSA state or seed initial data
    db = SessionLocal()
    try:
        doctor_count = db.query(Doctor).count()
        if doctor_count == 0:
            SeedService.seed_initial_data(db)
        else:
            # Reconstruct binary min-heap from SQLite waiting patients
            waiting_patients = db.query(Patient).filter(Patient.status == "Waiting").all()
            dsa_manager.rebuild_queue_from_db(waiting_patients)

            # Sync Hash Table
            all_patients = db.query(Patient).all()
            for p in all_patients:
                dsa_manager.sync_patient_to_hash_table({
                    "id": p.id,
                    "name": p.full_name,
                    "age": p.age,
                    "triage_level": p.triage_level,
                    "status": p.status,
                    "arrival_time": p.arrival_time.isoformat()
                })
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Hospital Emergency Room Management System demonstrating real Data Structures & Algorithms",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler to avoid exposing internal raw stack traces
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An operational error occurred: {str(exc)}"}
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "docs_url": "/docs",
        "api_health": f"{settings.API_V1_STR}/health"
    }
