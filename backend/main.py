from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from models.database import create_tables, SessionLocal, seed_municipalities
from routes.complaints import router as complaints_router
from routes.municipalities import router as municipalities_router

app = FastAPI(
    title="Jan Sahayak API",
    description="Smart City Civic Issue Reporting Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(complaints_router, prefix="/api")
app.include_router(municipalities_router, prefix="/api")


@app.on_event("startup")
def startup_event():
    create_tables()
    db = SessionLocal()
    seed_municipalities(db)
    db.close()
    print("✅ Jan Sahayak API started successfully")


@app.get("/")
def root():
    return {"message": "Jan Sahayak API", "status": "running", "version": "1.0.0"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}