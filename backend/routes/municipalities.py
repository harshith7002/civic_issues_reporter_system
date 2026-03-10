from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import Municipality, get_db

router = APIRouter()


@router.get("/municipalities")
def get_municipalities(db: Session = Depends(get_db)):
    munis = db.query(Municipality).all()
    return [
        {
            "id": m.id,
            "city": m.city,
            "municipality_name": m.municipality_name,
            "helpline": m.helpline,
            "email": m.email,
            "whatsapp": m.whatsapp,
            "complaint_portal": m.complaint_portal,
            "address": m.address,
            "last_verified": m.last_verified,
        }
        for m in munis
    ]


@router.get("/municipalities/{city}")
def get_municipality_by_city(city: str, db: Session = Depends(get_db)):
    m = db.query(Municipality).filter(Municipality.city.ilike(city)).first()
    if not m:
        return {"error": "Municipality not found"}
    return {
        "city": m.city,
        "municipality_name": m.municipality_name,
        "helpline": m.helpline,
        "email": m.email,
        "whatsapp": m.whatsapp,
        "complaint_portal": m.complaint_portal,
        "address": m.address,
    }