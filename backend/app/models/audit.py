from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.core.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(50), unique=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    patient_id = Column(String(50), nullable=True, index=True)
    responsible_staff = Column(String(120), nullable=False)
    previous_value = Column(String(200), nullable=True)
    new_value = Column(String(200), nullable=True)
    reason = Column(Text, nullable=True)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now, nullable=False, index=True)
