import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.bed import Bed
from app.models.treatment import Treatment
from app.schemas.treatment import (
    StartTreatmentRequest,
    CompleteTreatmentRequest,
    DischargePatientRequest,
    CancelPatientRequest,
)
from app.services.dsa_manager import dsa_manager
from app.services.audit_service import AuditService


class TreatmentService:
    @classmethod
    def start_treatment(
        cls,
        db: Session,
        patient_id: str,
        request: StartTreatmentRequest
    ) -> Patient:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

        if patient.status != "Waiting":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot start treatment: Patient is currently '{patient.status}', must be 'Waiting'"
            )

        # Validate and claim Doctor if provided
        doctor: Optional[Doctor] = None
        if request.doctor_id:
            doctor = db.query(Doctor).filter(Doctor.id == request.doctor_id).first()
            if not doctor:
                raise HTTPException(status_code=404, detail=f"Doctor {request.doctor_id} not found")
            if not doctor.is_available:
                raise HTTPException(
                    status_code=400,
                    detail=f"Doctor {doctor.name} is currently occupied with patient {doctor.current_patient_id}"
                )

        # Validate and claim Bed if provided
        bed: Optional[Bed] = None
        if request.bed_id:
            bed = db.query(Bed).filter(Bed.id == request.bed_id).first()
            if not bed:
                raise HTTPException(status_code=404, detail=f"Bed {request.bed_id} not found")
            if bed.status != "Available":
                raise HTTPException(
                    status_code=400,
                    detail=f"Bed {bed.label} is currently '{bed.status}', not 'Available'"
                )

        now = datetime.now()
        treatment_id = f"TRT-{now.strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"

        # Create treatment record
        treatment = Treatment(
            id=treatment_id,
            patient_id=patient.id,
            doctor_id=doctor.id if doctor else None,
            bed_id=bed.id if bed else None,
            status="In Progress",
            start_time=now,
            initial_assessment=request.initial_assessment
        )
        db.add(treatment)

        # Update Doctor allocation
        if doctor:
            doctor.is_available = False
            doctor.current_patient_id = patient.id
            patient.doctor_id = doctor.id

        # Update Bed allocation
        if bed:
            bed.status = "Occupied"
            bed.current_patient_id = patient.id
            patient.bed_id = bed.id

        # Update Patient
        patient.status = "Under Treatment"
        patient.treatment_start_time = now
        patient.updated_at = now

        db.commit()
        db.refresh(patient)

        # REMOVE from active Min-Heap (waiting queue)
        dsa_manager.priority_queue.remove_by_patient_id(patient.id)

        # Mirror status in Hash Table
        dsa_manager.sync_patient_to_hash_table({
            "id": patient.id,
            "name": patient.full_name,
            "age": patient.age,
            "triage_level": patient.triage_level,
            "status": patient.status,
            "arrival_time": patient.arrival_time.isoformat()
        })

        # Record Audit
        doc_info = f"Doctor: {doctor.name}" if doctor else "No doctor assigned"
        bed_info = f"Bed: {bed.label}" if bed else "No bed assigned"
        staff_name = request.responsible_staff or (doctor.name if doctor else "Dr. Eleanor Vance")

        AuditService.record_event(
            db=db,
            event_type="TREATMENT_STARTED",
            details=f"Treatment started for {patient.full_name}. {doc_info}, {bed_info}",
            patient_id=patient.id,
            responsible_staff=staff_name,
            previous_value="Waiting",
            new_value="Under Treatment"
        )

        return patient

    @classmethod
    def complete_treatment(
        cls,
        db: Session,
        patient_id: str,
        request: CompleteTreatmentRequest
    ) -> Patient:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

        if patient.status != "Under Treatment":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot complete treatment: Patient status is '{patient.status}', must be 'Under Treatment'"
            )

        now = datetime.now()

        # Update treatment episode
        active_treatment = db.query(Treatment).filter(
            Treatment.patient_id == patient.id,
            Treatment.status == "In Progress"
        ).order_by(Treatment.start_time.desc()).first()

        if active_treatment:
            active_treatment.status = "Completed"
            active_treatment.end_time = now
            active_treatment.notes = request.treatment_notes
            active_treatment.interventions = request.interventions

        # Release Doctor back to available
        if patient.doctor_id:
            doc = db.query(Doctor).filter(Doctor.id == patient.doctor_id).first()
            if doc and doc.current_patient_id == patient.id:
                doc.is_available = True
                doc.current_patient_id = None

        patient.status = "Treatment Completed"
        patient.treatment_end_time = now
        patient.treatment_notes = request.treatment_notes
        patient.updated_at = now

        db.commit()
        db.refresh(patient)

        # Mirror in Hash Table
        dsa_manager.sync_patient_to_hash_table({
            "id": patient.id,
            "name": patient.full_name,
            "age": patient.age,
            "triage_level": patient.triage_level,
            "status": patient.status,
            "arrival_time": patient.arrival_time.isoformat()
        })

        AuditService.record_event(
            db=db,
            event_type="TREATMENT_COMPLETED",
            details=f"Treatment marked complete for {patient.full_name}. Notes: {request.treatment_notes or 'Standard care provided'}",
            patient_id=patient.id,
            responsible_staff=request.responsible_staff or "Dr. Eleanor Vance",
            previous_value="Under Treatment",
            new_value="Treatment Completed"
        )

        return patient

    @classmethod
    def discharge_patient(
        cls,
        db: Session,
        patient_id: str,
        request: DischargePatientRequest
    ) -> Patient:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

        if patient.status not in ["Treatment Completed", "Under Treatment"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot discharge patient in '{patient.status}' status"
            )

        now = datetime.now()

        # Release doctor if still held
        if patient.doctor_id:
            doc = db.query(Doctor).filter(Doctor.id == patient.doctor_id).first()
            if doc and doc.current_patient_id == patient.id:
                doc.is_available = True
                doc.current_patient_id = None

        # Release Bed to "Cleaning / Maintenance" or "Available"
        if patient.bed_id:
            bed = db.query(Bed).filter(Bed.id == patient.bed_id).first()
            if bed and bed.current_patient_id == patient.id:
                bed.status = "Available"
                bed.current_patient_id = None

        patient.status = "Discharged"
        patient.discharge_time = now
        patient.discharge_notes = request.discharge_notes
        patient.updated_at = now

        db.commit()
        db.refresh(patient)

        # Mirror in Hash Table
        dsa_manager.sync_patient_to_hash_table({
            "id": patient.id,
            "name": patient.full_name,
            "age": patient.age,
            "triage_level": patient.triage_level,
            "status": patient.status,
            "arrival_time": patient.arrival_time.isoformat()
        })

        AuditService.record_event(
            db=db,
            event_type="PATIENT_DISCHARGED",
            details=f"Patient {patient.full_name} discharged from ER. Notes: {request.discharge_notes or 'Safe discharge'}",
            patient_id=patient.id,
            responsible_staff=request.responsible_staff or "Dr. Eleanor Vance",
            previous_value="Treatment Completed",
            new_value="Discharged"
        )

        return patient

    @classmethod
    def cancel_patient(
        cls,
        db: Session,
        patient_id: str,
        request: CancelPatientRequest
    ) -> Patient:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

        if patient.status != "Waiting":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel patient with status '{patient.status}'. Only 'Waiting' patients may be cancelled."
            )

        now = datetime.now()
        patient.status = "Cancelled"
        patient.cancellation_reason = request.reason
        patient.updated_at = now

        db.commit()
        db.refresh(patient)

        # Remove from Min-Heap
        dsa_manager.priority_queue.remove_by_patient_id(patient.id)

        # Mirror in Hash Table
        dsa_manager.sync_patient_to_hash_table({
            "id": patient.id,
            "name": patient.full_name,
            "age": patient.age,
            "triage_level": patient.triage_level,
            "status": patient.status,
            "arrival_time": patient.arrival_time.isoformat()
        })

        AuditService.record_event(
            db=db,
            event_type="PATIENT_CANCELLED",
            details=f"Patient {patient.full_name} cancelled from waiting list. Reason: {request.reason}",
            patient_id=patient.id,
            responsible_staff=request.responsible_staff or "Staff",
            previous_value="Waiting",
            new_value="Cancelled",
            reason=request.reason
        )

        return patient
