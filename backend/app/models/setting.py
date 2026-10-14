from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from app.core.database import Base


class ApplicationSetting(Base):
    __tablename__ = "application_settings"

    key = Column(String(80), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(200), nullable=True)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
