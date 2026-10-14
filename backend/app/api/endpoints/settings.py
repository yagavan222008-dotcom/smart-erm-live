from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.setting import ApplicationSetting
from app.services.seed_service import SeedService
from app.services.audit_service import AuditService

router = APIRouter()


class SettingsUpdate(BaseModel):
    facility_name: str
    staff_name: str


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings_records = db.query(ApplicationSetting).all()
    res = {s.key: s.value for s in settings_records}
    if "FACILITY_NAME" not in res:
        res["FACILITY_NAME"] = "Metropolitan Central Emergency Center"
    if "CURRENT_STAFF" not in res:
        res["CURRENT_STAFF"] = "Dr. Eleanor Vance (Triage Lead)"
    return res


@router.post("/settings")
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    fac = db.query(ApplicationSetting).filter(ApplicationSetting.key == "FACILITY_NAME").first()
    if fac:
        fac.value = payload.facility_name
    else:
        db.add(ApplicationSetting(key="FACILITY_NAME", value=payload.facility_name))

    stf = db.query(ApplicationSetting).filter(ApplicationSetting.key == "CURRENT_STAFF").first()
    if stf:
        stf.value = payload.staff_name
    else:
        db.add(ApplicationSetting(key="CURRENT_STAFF", value=payload.staff_name))

    db.commit()

    AuditService.record_event(
        db=db,
        event_type="SETTINGS_UPDATED",
        details=f"Facility set to '{payload.facility_name}', Staff set to '{payload.staff_name}'",
        responsible_staff=payload.staff_name
    )

    return {"status": "success", "facility_name": payload.facility_name, "staff_name": payload.staff_name}


@router.post("/seed")
def seed_demo_data(force_reset: bool = False, db: Session = Depends(get_db)):
    return SeedService.seed_initial_data(db, force_reset=force_reset)
