from sqlalchemy import Column, Integer, String, Float, DateTime, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./jan_sahayak.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String, unique=True, index=True)
    user_name = Column(String)
    mobile_number = Column(String)
    image_path = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(Text)
    city = Column(String)
    category = Column(String)
    confidence = Column(Float)
    status = Column(String, default="reported")
    department = Column(String)
    municipality_name = Column(String)
    municipality_email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    feature_vector = Column(Text, nullable=True)

class Municipality(Base):
    __tablename__ = "municipalities"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, unique=True, index=True)
    municipality_name = Column(String)
    helpline = Column(String)
    email = Column(String)
    whatsapp = Column(String)
    complaint_portal = Column(String)
    address = Column(Text)
    last_verified = Column(String)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_municipalities(db):
    municipalities = [
        {"city": "Mumbai", "municipality_name": "BMC", "helpline": "1916", "email": "complaints@bmcmail.com", "whatsapp": "+912224132424", "complaint_portal": "https://portal.mcgm.gov.in", "address": "Mahapalika Marg, Fort, Mumbai 400001", "last_verified": "2024-01-01"},
        {"city": "Delhi", "municipality_name": "MCD", "helpline": "1800110081", "email": "complaints@mcd.gov.in", "whatsapp": "+911123936000", "complaint_portal": "https://mcdonline.nic.in", "address": "Dr. S.P. Mukherjee Civic Centre, New Delhi 110002", "last_verified": "2024-01-01"},
        {"city": "Bangalore", "municipality_name": "BBMP", "helpline": "080-22660000", "email": "complaints@bbmp.gov.in", "whatsapp": "+918022221188", "complaint_portal": "https://bbmpsahaaya.karnataka.gov.in", "address": "N R Square, Bengaluru 560002", "last_verified": "2024-01-01"},
        {"city": "Chennai", "municipality_name": "GCC", "helpline": "044-25384532", "email": "complaints@chennaicorporation.gov.in", "whatsapp": "+914425384532", "complaint_portal": "https://www.chennaicorporation.gov.in", "address": "Ripon Building, Chennai 600003", "last_verified": "2024-01-01"},
        {"city": "Hyderabad", "municipality_name": "GHMC", "helpline": "040-21111111", "email": "complaints@ghmc.gov.in", "whatsapp": "+914021111111", "complaint_portal": "https://ghmc.gov.in", "address": "Troop Bazar, Hyderabad 500001", "last_verified": "2024-01-01"},
        {"city": "Pune", "municipality_name": "PMC", "helpline": "020-25501000", "email": "complaints@punecorporation.org", "whatsapp": "+912025501000", "complaint_portal": "https://pmc.gov.in", "address": "Shivajinagar, Pune 411005", "last_verified": "2024-01-01"},
        {"city": "Ahmedabad", "municipality_name": "AMC", "helpline": "079-25391811", "email": "complaints@egovamc.com", "whatsapp": "+917925391811", "complaint_portal": "https://ahmedabadcity.gov.in", "address": "Sardar Patel Bhavan, Ahmedabad 380001", "last_verified": "2024-01-01"},
        {"city": "Kolkata", "municipality_name": "KMC", "helpline": "1800-345-0022", "email": "complaints@kmcgov.in", "whatsapp": "+913322861000", "complaint_portal": "https://www.kmcgov.in", "address": "5, S N Banerjee Road, Kolkata 700013", "last_verified": "2024-01-01"},
        {"city": "Nagpur", "municipality_name": "NMC", "helpline": "0712-2567601", "email": "complaints@nmcnagpur.gov.in", "whatsapp": "+917122567601", "complaint_portal": "https://www.nagpuronline.com", "address": "Mahapalika Marg, Nagpur 440018", "last_verified": "2024-01-01"},
        {"city": "Pimpri-Chinchwad", "municipality_name": "PCMC", "helpline": "020-27425555", "email": "complaints@pcmcindia.gov.in", "whatsapp": "+912027425555", "complaint_portal": "https://www.pcmcindia.gov.in", "address": "Pimpri, Pune 411018", "last_verified": "2024-01-01"},
    ]
    for m in municipalities:
        existing = db.query(Municipality).filter(Municipality.city == m["city"]).first()
        if not existing:
            db.add(Municipality(**m))
    db.commit()
