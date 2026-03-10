from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import os
import aiofiles

from models.database import Complaint, get_db
from services.classifier import classify_image
from services.router import route_complaint, extract_city_from_address

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/complaints")
async def submit_complaint(
    user_name: str = Form(...),
    mobile_number: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(default=""),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Save image
    ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    image_bytes = await image.read()
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(image_bytes)

    # AI Classification
    classification = classify_image(image_bytes)
    category = classification["category"]
    confidence = classification["confidence"]

    # Route to municipality
    routing = route_complaint(address, category)

    # Generate complaint ID
    complaint_id = f"JS{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:6].upper()}"

    # Store in DB
    complaint = Complaint(
        complaint_id=complaint_id,
        user_name=user_name,
        mobile_number=mobile_number,
        image_path=filepath,
        latitude=latitude,
        longitude=longitude,
        address=address,
        city=routing.get("city", "Unknown"),
        category=category,
        confidence=confidence,
        status="reported",
        department=routing.get("department", ""),
        municipality_name=routing.get("municipality_name", ""),
        municipality_email=routing.get("email", ""),
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return {
        "success": True,
        "complaint_id": complaint_id,
        "category": category,
        "confidence": confidence,
        "department": routing.get("department"),
        "municipality": routing.get("municipality_name"),
        "city": routing.get("city"),
        "message": f"Complaint registered and routed to {routing.get('municipality_name', 'local authority')}",
        "all_predictions": classification.get("all_predictions", {}),
    }


@router.get("/complaints")
def get_complaints(
    status: str = None,
    category: str = None,
    city: str = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    if category:
        query = query.filter(Complaint.category == category)
    if city:
        query = query.filter(Complaint.city.ilike(f"%{city}%"))
    complaints = query.order_by(Complaint.created_at.desc()).limit(limit).all()

    return [
        {
            "id": c.id,
            "complaint_id": c.complaint_id,
            "user_name": c.user_name,
            "mobile_number": c.mobile_number,
            "image_url": f"/api/uploads/{os.path.basename(c.image_path)}",
            "latitude": c.latitude,
            "longitude": c.longitude,
            "address": c.address,
            "city": c.city,
            "category": c.category,
            "confidence": c.confidence,
            "status": c.status,
            "department": c.department,
            "municipality_name": c.municipality_name,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in complaints
    ]


@router.get("/complaints/{complaint_id}")
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {
        "id": c.id,
        "complaint_id": c.complaint_id,
        "user_name": c.user_name,
        "mobile_number": c.mobile_number,
        "image_url": f"/api/uploads/{os.path.basename(c.image_path)}",
        "latitude": c.latitude,
        "longitude": c.longitude,
        "address": c.address,
        "city": c.city,
        "category": c.category,
        "confidence": c.confidence,
        "status": c.status,
        "department": c.department,
        "municipality_name": c.municipality_name,
        "municipality_email": c.municipality_email,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.patch("/complaints/{complaint_id}/status")
def update_status(
    complaint_id: str,
    status: str = Form(...),
    db: Session = Depends(get_db),
):
    valid_statuses = ["reported", "assigned", "in_progress", "resolved"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Use: {valid_statuses}")

    c = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    c.status = status
    c.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "complaint_id": complaint_id, "new_status": status}


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Complaint).count()
    by_status = {}
    by_category = {}
    by_city = {}

    for c in db.query(Complaint).all():
        by_status[c.status] = by_status.get(c.status, 0) + 1
        by_category[c.category] = by_category.get(c.category, 0) + 1
        if c.city:
            by_city[c.city] = by_city.get(c.city, 0) + 1

    return {
        "total": total,
        "by_status": by_status,
        "by_category": by_category,
        "by_city": by_city,
    }


@router.post("/classify")
async def classify_only(image: UploadFile = File(...)):
    image_bytes = await image.read()
    result = classify_image(image_bytes)
    return result