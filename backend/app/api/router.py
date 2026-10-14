from fastapi import APIRouter
from app.api.endpoints import (
    health,
    dashboard,
    patients,
    queue,
    treatment,
    resources,
    audit,
    reports,
    settings,
    dsa
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(dashboard.router, tags=["Dashboard"])
api_router.include_router(patients.router, tags=["Patients"])
api_router.include_router(queue.router, tags=["Queue"])
api_router.include_router(treatment.router, tags=["Treatment"])
api_router.include_router(resources.router, tags=["Resources"])
api_router.include_router(audit.router, tags=["Audit & History"])
api_router.include_router(reports.router, tags=["Reports"])
api_router.include_router(settings.router, tags=["Settings"])
api_router.include_router(dsa.router, tags=["DSA Visualizer"])
