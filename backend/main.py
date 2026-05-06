from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
import requests
import json
import csv
import io
import os

from backend import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Weather API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Geocoding via Open-Meteo
def get_coordinates(location: str):
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json"
    res = requests.get(url)
    data = res.json()
    if not data.get("results"):
        return None
    return data["results"][0]

def get_weather(lat: float, lon: float):
    # current weather + 5 day forecast (daily)
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto"
    res = requests.get(url)
    return res.json()

@app.post("/api/weather", response_model=schemas.WeatherRecord)
def create_weather_record(record: schemas.WeatherRecordCreate, db: Session = Depends(get_db)):
    geo = get_coordinates(record.location)
    if not geo:
        raise HTTPException(status_code=404, detail="Location not found!")
    
    lat = geo["latitude"]
    lon = geo["longitude"]
    
    try:
        weather_data = get_weather(lat, lon)
        if "error" in weather_data:
            raise Exception()
    except Exception:
        raise HTTPException(status_code=503, detail="Weather resource unavailable!")
    
    current_temp = weather_data.get("current", {}).get("temperature_2m")
    
    description = f"Weather code: {weather_data.get('current', {}).get('weather_code')}"
    
    db_record = models.WeatherRecord(
        location=f"{geo.get('name')}, {geo.get('country', '')}",
        date_range=record.date_range,
        temperature_c=current_temp,
        description=description,
        forecast_data=json.dumps(weather_data.get("daily", {})),
        lat=lat,
        lon=lon
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/api/weather", response_model=list[schemas.WeatherRecord])
def get_all_weather(db: Session = Depends(get_db)):
    return db.query(models.WeatherRecord).all()

@app.put("/api/weather/{record_id}", response_model=schemas.WeatherRecord)
def update_weather(record_id: int, update_data: schemas.WeatherRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(models.WeatherRecord).filter(models.WeatherRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_record, key, value)
        
    db.commit()
    db.refresh(db_record)
    return db_record

@app.delete("/api/weather/{record_id}")
def delete_weather(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.WeatherRecord).filter(models.WeatherRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(db_record)
    db.commit()
    return {"message": "Deleted successfully"}

# Exports
@app.get("/api/export/csv")
def export_csv(db: Session = Depends(get_db)):
    records = db.query(models.WeatherRecord).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Location", "Date Range", "Temperature (C)", "Description"])
    for r in records:
        writer.writerow([r.id, r.location, r.date_range, r.temperature_c, r.description])
    
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=weather_export.csv"})

@app.get("/api/export/json")
def export_json(db: Session = Depends(get_db)):
    records = db.query(models.WeatherRecord).all()
    data = [{"id": r.id, "location": r.location, "temperature_c": r.temperature_c} for r in records]
    return Response(content=json.dumps(data), media_type="application/json", headers={"Content-Disposition": "attachment; filename=weather_export.json"})

@app.get("/api/export/xml")
def export_xml(db: Session = Depends(get_db)):
    records = db.query(models.WeatherRecord).all()
    xml_str = "<records>"
    for r in records:
        xml_str += f"<record><id>{r.id}</id><location>{r.location}</location><temperature>{r.temperature_c}</temperature></record>"
    xml_str += "</records>"
    return Response(content=xml_str, media_type="application/xml", headers={"Content-Disposition": "attachment; filename=weather_export.xml"})

@app.get("/api/export/markdown")
def export_markdown(db: Session = Depends(get_db)):
    records = db.query(models.WeatherRecord).all()
    md_str = "# Weather Records\n\n| ID | Location | Temperature (C) |\n|---|---|---|\n"
    for r in records:
        md_str += f"| {r.id} | {r.location} | {r.temperature_c} |\n"
    return Response(content=md_str, media_type="text/markdown", headers={"Content-Disposition": "attachment; filename=weather_export.md"})

@app.get("/api/export/pdf")
def export_pdf(db: Session = Depends(get_db)):
    try:
        from fpdf import FPDF
    except ImportError:
        raise HTTPException(status_code=500, detail="fpdf2 is not installed")
    
    records = db.query(models.WeatherRecord).all()
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Weather Records", ln=1, align='C')
    
    for r in records:
        pdf.cell(200, 10, txt=f"ID: {r.id}, Location: {r.location}, Temp: {r.temperature_c}C", ln=1)
        
    pdf_path = "weather_export.pdf"
    pdf.output(pdf_path)
    return FileResponse(pdf_path, media_type="application/pdf", filename="weather_export.pdf")
