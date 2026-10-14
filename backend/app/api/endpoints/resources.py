from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.doctor import DoctorCreate, DoctorResponse, BedCreate, BedResponse
from app.services.resource_service import ResourceService

router = APIRouter()


@router.get("/doctors", response_model=List[DoctorResponse])
def get_doctors(
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    return ResourceService.get_doctors(db, available_only=available_only)


@router.post("/doctors", response_model=DoctorResponse)
def create_doctor(
    doc_in: DoctorCreate,
    db: Session = Depends(get_db)
):
    return ResourceService.create_doctor(db, doc_in)


@router.get("/beds", response_model=List[BedResponse])
def get_beds(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return ResourceService.get_beds(db, status=status)


@router.post("/beds", response_model=BedResponse)
def create_bed(
    bed_in: BedCreate,
    db: Session = Depends(get_db)
):
    return ResourceService.create_bed(db, bed_in)


@router.put("/beds/{bed_id}/status", response_model=BedResponse)
def update_bed_status(
    bed_id: str,
    new_status: str = Query(..., description="Available, Occupied, Cleaning / Maintenance"),
    db: Session = Depends(get_db)
):
    bed = ResourceService.update_bed_status(db, bed_id, new_status)
    if not bed:
        raise HTTPException(status_code=404, detail=f"Bed {bed_id} not found")
    return bed
