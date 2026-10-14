from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientTriageUpdate
from app.dsa.priority_queue import QueueItem, PriorityQueue
from app.services.dsa_manager import dsa_manager
from app.services.audit_service import AuditService


class PatientService:
    @staticmethod
    def generate_next_patient_id(db: Session) -> str:
        count = db.query(func.count(Patient.id)).scalar() or 0
        current_year = datetime.now().year
        return f"PT-{current_year}-{(count + 1):04d}"

    @staticmethod
    def get_next_arrival_seq(db: Session) -> int:
        max_seq = db.query(func.max(Patient.arrival_seq)).scalar()
        return (max_seq or 0) + 1

    @classmethod
    def register_patient(cls, db: Session, patient_in: PatientCreate, staff: str = "Dr. Eleanor Vance") -> Patient:
        patient_id = cls.generate_next_patient_id(db)
        arrival_seq = cls.get_next_arrival_seq(db)
        now = datetime.now()

        patient = Patient(
            id=patient_id,
            full_name=patient_in.full_name.strip(),
            age=patient_in.age,
            gender=patient_in.gender,
            contact_number=patient_in.contact_number,
            complaint=patient_in.complaint.strip(),
            arrival_time=now,
            arrival_seq=arrival_seq,
            triage_level=patient_in.triage_level,
            triage_notes=patient_in.triage_notes,
            status="Waiting",
            created_at=now,
            updated_at=now
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

        # 1. Push to Binary Min-Heap Priority Queue
        priority_num = PriorityQueue.get_priority_level(patient.triage_level)
        queue_item = QueueItem(
            priority=priority_num,
            arrival_seq=patient.arrival_seq,
            patient_id=patient.id,
            patient_name=patient.full_name,
            age=patient.age,
            triage_level=patient.triage_level,
            complaint=patient.complaint,
            arrival_time=patient.arrival_time.isoformat(),
            status="Waiting"
        )
        dsa_manager.priority_queue.push(queue_item)

        # 2. Mirror into separate chaining Hash Table
        dsa_manager.sync_patient_to_hash_table({
            "id": patient.id,
            "name": patient.full_name,
            "age": patient.age,
            "triage_level": patient.triage_level,
            "status": patient.status,
            "arrival_time": patient.arrival_time.isoformat()
        })

        # 3. Add to FIFO Reception queue for intake log demo
        dsa_manager.reception_fifo.enqueue({
            "id": patient.id,
            "name": patient.full_name,
            "triage": patient.triage_level,
            "time": now.strftime("%H:%M:%S")
        })

        # 4. Audit Log
        AuditService.record_event(
            db=db,
            event_type="PATIENT_REGISTERED",
            details=f"Patient {patient.full_name} registered with triage urgency '{patient.triage_level}' (Arrival Seq #{arrival_seq})",
            patient_id=patient.id,
            responsible_staff=staff,
            new_value=patient.triage_level
        )

        return patient

    @staticmethod
    def get_patient_by_id(db: Session, patient_id: str) -> Optional[Patient]:
        return db.query(Patient).filter(Patient.id == patient_id).first()

    @staticmethod
    def search_patients(
        db: Session,
        query: Optional[str] = None,
        triage_level: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Patient]:
        q = db.query(Patient)

        if query:
            clean_q = f"%{query.strip()}%"
            q = q.filter(or_(Patient.id.ilike(clean_q), Patient.full_name.ilike(clean_q), Patient.complaint.ilike(clean_q)))

        if triage_level and triage_level != "All":
            q = q.filter(Patient.triage_level == triage_level)

        if status and status != "All":
            q = q.filter(Patient.status == status)

        # Order primarily by arrival sequence descending for records view
        return q.order_by(Patient.arrival_seq.desc()).offset(offset).limit(limit).all()

    @classmethod
    def update_triage_level(cls, db: Session, patient_id: str, update_in: PatientTriageUpdate) -> Optional[Patient]:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return None

        old_level = patient.triage_level
        new_level = update_in.triage_level

        if old_level == new_level:
            return patient

        patient.triage_level = new_level
        patient.updated_at = datetime.now()
        db.commit()
        db.refresh(patient)

        # Update Min-Heap if still waiting
        if patient.status == "Waiting":
            # Remove old node and re-push with new priority (maintaining original arrival_seq!)
            dsa_manager.priority_queue.remove_by_patient_id(patient.id)
            priority_num = PriorityQueue.get_priority_level(new_level)
            new_item = QueueItem(
                priority=priority_num,
                arrival_seq=patient.arrival_seq,
                patient_id=patient.id,
                patient_name=patient.full_name,
                age=patient.age,
                triage_level=new_level,
                complaint=patient.complaint,
                arrival_time=patient.arrival_time.isoformat(),
                status="Waiting"
            )
            dsa_manager.priority_queue.push(new_item)

        # Update Hash Table
        dsa_manager.sync_patient_to_hash_table({
            "id": patient.id,
            "name": patient.full_name,
            "age": patient.age,
            "triage_level": new_level,
            "status": patient.status,
            "arrival_time": patient.arrival_time.isoformat()
        })

        # Audit Event
        AuditService.record_event(
            db=db,
            event_type="STAFF_OVERRIDE_TRIAGE",
            details=f"Staff reclassified triage level from '{old_level}' to '{new_level}'. Reason: {update_in.reason}",
            patient_id=patient.id,
            responsible_staff=update_in.responsible_staff or "Dr. Eleanor Vance",
            previous_value=old_level,
            new_value=new_level,
            reason=update_in.reason
        )

        return patient
