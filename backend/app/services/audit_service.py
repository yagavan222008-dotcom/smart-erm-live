import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent
from app.services.dsa_manager import dsa_manager


class AuditService:
    @staticmethod
    def record_event(
        db: Session,
        event_type: str,
        details: str,
        patient_id: Optional[str] = None,
        responsible_staff: str = "Dr. Eleanor Vance (Lead ER Triage)",
        previous_value: Optional[str] = None,
        new_value: Optional[str] = None,
        reason: Optional[str] = None
    ) -> AuditEvent:
        """
        Creates persistent AuditEvent in SQLite AND pushes event node into educational LinkedList.
        """
        event_id = f"EVT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

        audit_entry = AuditEvent(
            event_id=event_id,
            event_type=event_type,
            patient_id=patient_id,
            responsible_staff=responsible_staff,
            previous_value=previous_value,
            new_value=new_value,
            reason=reason,
            details=details,
            timestamp=datetime.now()
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)

        # Mirror in DSA Singly Linked List
        dsa_manager.log_event_to_linked_list(
            event_id=event_id,
            patient_id=patient_id or "GENERAL",
            event_type=event_type,
            details=details,
            staff=responsible_staff
        )

        return audit_entry
