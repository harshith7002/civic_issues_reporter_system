"""Municipality routing and geocoding service."""
import re
from models.database import Municipality, SessionLocal

CITY_ALIASES = {
    "mumbai": "Mumbai", "bombay": "Mumbai",
    "delhi": "Delhi", "new delhi": "Delhi",
    "bangalore": "Bangalore", "bengaluru": "Bangalore",
    "chennai": "Chennai", "madras": "Chennai",
    "hyderabad": "Hyderabad",
    "pune": "Pune",
    "ahmedabad": "Ahmedabad",
    "kolkata": "Kolkata", "calcutta": "Kolkata",
    "nagpur": "Nagpur",
    "pimpri": "Pimpri-Chinchwad", "chinchwad": "Pimpri-Chinchwad",
}

DEFAULT_MUNICIPALITY = {
    "city": "Unknown",
    "municipality_name": "Local Municipal Corporation",
    "helpline": "1800-111-0000",
    "email": "civic@municipality.gov.in",
    "whatsapp": None,
    "complaint_portal": "https://india.gov.in",
    "address": "Municipal Office",
}


def extract_city_from_address(address: str) -> str:
    """Extract city name from address string."""
    if not address:
        return "Unknown"
    addr_lower = address.lower()
    for alias, city in CITY_ALIASES.items():
        if alias in addr_lower:
            return city
    # Try to extract last meaningful part
    parts = [p.strip() for p in address.split(",")]
    for part in reversed(parts):
        clean = re.sub(r"\d+", "", part).strip()
        if len(clean) > 3:
            return clean.title()
    return "Unknown"


def get_municipality_for_city(city: str):
    """Lookup municipality by city name."""
    db = SessionLocal()
    try:
        # Direct lookup
        muni = db.query(Municipality).filter(
            Municipality.city.ilike(city)
        ).first()
        if muni:
            return muni

        # Alias lookup
        canonical = CITY_ALIASES.get(city.lower())
        if canonical:
            muni = db.query(Municipality).filter(
                Municipality.city == canonical
            ).first()
            if muni:
                return muni

        return None
    finally:
        db.close()


def get_all_municipalities():
    """Get all municipalities."""
    db = SessionLocal()
    try:
        return db.query(Municipality).all()
    finally:
        db.close()


def route_complaint(address: str, category: str) -> dict:
    """Route complaint to correct municipality and department."""
    from services.classifier import get_department

    city = extract_city_from_address(address)
    municipality = get_municipality_for_city(city)
    department = get_department(category)

    if municipality:
        return {
            "city": municipality.city,
            "municipality_name": municipality.municipality_name,
            "email": municipality.email,
            "helpline": municipality.helpline,
            "whatsapp": municipality.whatsapp,
            "complaint_portal": municipality.complaint_portal,
            "department": department,
            "routed": True,
        }
    else:
        return {
            **DEFAULT_MUNICIPALITY,
            "city": city if city != "Unknown" else "Unknown",
            "department": department,
            "routed": False,
        }