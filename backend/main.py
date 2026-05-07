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

WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
}

def get_weather_description(code):
    return WEATHER_CODES.get(code, f"Weather code: {code}")

@app.get("/api/reverse-geocode")
def reverse_geocode(lat: float, lon: float):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    # Nominatim requires a user-agent
    headers = {'User-Agent': 'WeatherApp/1.0'}
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=502, detail="Geocoding service error")
    return res.json()

@app.post("/api/weather", response_model=schemas.WeatherResponse)
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
    
    location_name = f"{geo.get('name')}, {geo.get('country', '')}"
    
    # Extract current weather
    current = weather_data.get("current", {})
    temperature_c = current.get("temperature_2m")
    weather_code = current.get("weather_code")
    description = get_weather_description(weather_code)
    
    # Save to database
    daily = weather_data.get("daily", {})
    dates = daily.get("time", [])[:6]
    min_temps = daily.get("temperature_2m_min", [])[:6]
    max_temps = daily.get("temperature_2m_max", [])[:6]
    weather_codes = daily.get("weather_code", [])[:6]

    if len(dates) < 6 or len(min_temps) < 6 or len(max_temps) < 6:
        raise HTTPException(status_code=502, detail="Incomplete forecast data from weather provider")

    saved_records = []
    for i, date in enumerate(dates):
        # Check if record with same location and date exists
        existing_record = db.query(models.WeatherRecord).filter(
            models.WeatherRecord.location == location_name,
            models.WeatherRecord.date == date
        ).first()
        
        if existing_record:
            # Update existing record
            existing_record.min_temperature_k = round(min_temps[i] + 273.15, 2)
            existing_record.max_temperature_k = round(max_temps[i] + 273.15, 2)
            existing_record.description = get_weather_description(weather_codes[i] if i < len(weather_codes) else weather_codes[0])
            db_record = existing_record
        else:
            # Create new record
            db_record = models.WeatherRecord(
                location=location_name,
                date=date,
                min_temperature_k=round(min_temps[i] + 273.15, 2),
                max_temperature_k=round(max_temps[i] + 273.15, 2),
                description=get_weather_description(weather_codes[i] if i < len(weather_codes) else weather_codes[0])
            )
            db.add(db_record)
        
        saved_records.append(db_record)

    db.commit()
    for record in saved_records:
        db.refresh(record)
    
    # Return current weather response with forecast data
    return schemas.WeatherResponse(
        location=location_name,
        temperature_c=temperature_c,
        weather_code=weather_code,
        description=description,
        forecast_data=json.dumps(daily),
        lat=lat,
        lon=lon
    )

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

# Exports with optional location and date range filters
def build_export_query(db: Session, location: str = None, start_date: str = None, end_date: str = None):
    """Build a filtered query for export based on location and date range"""
    query = db.query(models.WeatherRecord)
    
    if location:
        query = query.filter(models.WeatherRecord.location.ilike(f"%{location}%"))
    
    if start_date:
        query = query.filter(models.WeatherRecord.date >= start_date)
    
    if end_date:
        query = query.filter(models.WeatherRecord.date <= end_date)
    
    return query.all()

@app.get("/api/export/csv")
def export_csv(location: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    records = build_export_query(db, location, start_date, end_date)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Location", "Date", "Min Temperature (K)", "Max Temperature (K)", "Description", "Timestamp"])
    for r in records:
        writer.writerow([r.id, r.location, r.date, r.min_temperature_k, r.max_temperature_k, r.description, r.timestamp])
    
    filename = f"weather_export{'_' + location if location else ''}{'_' + start_date if start_date else ''}.csv"
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

@app.get("/api/export/json")
def export_json(location: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    records = build_export_query(db, location, start_date, end_date)
    data = [{"id": r.id, "location": r.location, "date": r.date, "min_temperature_k": r.min_temperature_k, "max_temperature_k": r.max_temperature_k, "description": r.description, "timestamp": r.timestamp.isoformat() if r.timestamp else None} for r in records]
    filename = f"weather_export{'_' + location if location else ''}{'_' + start_date if start_date else ''}.json"
    return Response(content=json.dumps(data), media_type="application/json", headers={"Content-Disposition": f"attachment; filename={filename}"})

@app.get("/api/export/xml")
def export_xml(location: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    records = build_export_query(db, location, start_date, end_date)
    xml_str = "<records>"
    for r in records:
        xml_str += f"<record><id>{r.id}</id><location>{r.location}</location><date>{r.date}</date><min_temperature_k>{r.min_temperature_k}</min_temperature_k><max_temperature_k>{r.max_temperature_k}</max_temperature_k><description>{r.description}</description><timestamp>{r.timestamp.isoformat() if r.timestamp else ''}</timestamp></record>"
    xml_str += "</records>"
    filename = f"weather_export{'_' + location if location else ''}{'_' + start_date if start_date else ''}.xml"
    return Response(content=xml_str, media_type="application/xml", headers={"Content-Disposition": f"attachment; filename={filename}"})

@app.get("/api/export/markdown")
def export_markdown(location: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    records = build_export_query(db, location, start_date, end_date)
    md_str = "# Weather Records\n\n| ID | Location | Date | Min Temperature (K) | Max Temperature (K) | Description | Timestamp |\n|---|---|---|---|---|---|---|\n"
    for r in records:
        md_str += f"| {r.id} | {r.location} | {r.date} | {r.min_temperature_k} | {r.max_temperature_k} | {r.description} | {r.timestamp.isoformat() if r.timestamp else ''} |\n"
    filename = f"weather_export{'_' + location if location else ''}{'_' + start_date if start_date else ''}.md"
    return Response(content=md_str, media_type="text/markdown", headers={"Content-Disposition": f"attachment; filename={filename}"})

@app.get("/api/export/pdf")
def export_pdf(location: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    try:
        from fpdf import FPDF
    except ImportError:
        raise HTTPException(status_code=500, detail="fpdf2 is not installed")
    
    records = build_export_query(db, location, start_date, end_date)
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    title = "Weather Records"
    if location or start_date or end_date:
        title += " (Filtered)"
    pdf.cell(200, 10, txt=title, ln=1, align='C')
    
    if location:
        pdf.cell(200, 10, txt=f"Location: {location}", ln=1)
    if start_date and end_date:
        pdf.cell(200, 10, txt=f"Date Range: {start_date} to {end_date}", ln=1)
    elif start_date:
        pdf.cell(200, 10, txt=f"From: {start_date}", ln=1)
    elif end_date:
        pdf.cell(200, 10, txt=f"Until: {end_date}", ln=1)
    
    pdf.ln(5)
    
    for r in records:
        pdf.cell(200, 10, txt=f"ID: {r.id}, Location: {r.location}, Date: {r.date}, Min: {r.min_temperature_k}K, Max: {r.max_temperature_k}K", ln=1)
    
    filename = f"weather_export{'_' + location if location else ''}{'_' + start_date if start_date else ''}.pdf"
    pdf.output(filename)
    return FileResponse(filename, media_type="application/pdf", filename=filename)
