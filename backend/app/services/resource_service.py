from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.doctor import Doctor
from app.models.bed import Bed
from app.schemas.doctor import DoctorCreate, BedCreate
from app.services.audit_service import AuditService


class ResourceService:
    @staticmethod
    def get_doctors(db: Session, available_only: bool = False) -> List[Doctor]:
        q = db.query(Doctor)
        if available_only:
            q = q.filter(Doctor.is_available == True)
        return q.order_by(Doctor.name.asc()).all()

    @staticmethod
    def get_beds(db: Session, status: Optional[str] = None) -> List[Bed]:
        q = db.query(Bed)
        if status and status != "All":
            q = q.filter(Bed.status == status)
        return q.order_by(Bed.label.asc()).all()

    @staticmethod
    def create_doctor(db: Session, doc_in: DoctorCreate, staff: str = "Administrator") -> Doctor:
        doc_id = doc_in.id or f"DOC-{(db.query(Doctor).count() + 101)}"
        doc = Doctor(
            id=doc_id,
            name=doc_in.name,
            department=doc_in.department,
            is_available=doc_in.is_available,
            created_at=datetime.now()
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        AuditService.record_event(
            db=db,
            event_type="DOCTOR_ADDED",
            details=f"Doctor {doc.name} ({doc.department}) registered in system",
            responsible_staff=staff,
            new_value=doc.id
        )
        return doc

    @staticmethod
    def create_bed(db: Session, bed_in: BedCreate, staff: str = "Administrator") -> Bed:
        bed_id = bed_in.id or f"BED-{(db.query(Bed).count() + 1):02d}"
        bed = Bed(
            id=bed_id,
            label=bed_in.label,
            section=bed_in.section,
            status=bed_in.status,
            created_at=datetime.now()
        )
        db.add(bed)
        db.commit()
        db.refresh(bed)
        AuditService.record_event(
            db=db,
            event_type="BED_ADDED",
            details=f"Bed {bed.label} ({bed.section}) added to ER inventory",
            responsible_staff=staff,
            new_value=bed.id
        )
        return bed

    @staticmethod
    def update_bed_status(db: Session, bed_id: str, new_status: str, staff: str = "Staff") -> Optional[Bed]:
        bed = db.query(Bed).filter(Bed.id == bed_id).first()
        if not bed:
            return None
        old_status = bed.status
        bed.status = new_status
        db.commit()
        db.refresh(bed)
        AuditService.record_event(
            db=db,
            event_type="BED_STATUS_CHANGED",
            details=f"Bed {bed.label} status changed from {old_status} to {new_status}",
            responsible_staff=staff,
            previous_value=old_status,
            new_value=new_status
        )
        return bed
