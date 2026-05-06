from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WeatherRecordCreate(BaseModel):
    location: str
    date: Optional[str] = None
    min_temperature_k: Optional[float] = None
    max_temperature_k: Optional[float] = None
    description: Optional[str] = None

class WeatherRecordUpdate(BaseModel):
    location: Optional[str] = None
    date: Optional[str] = None
    min_temperature_k: Optional[float] = None
    max_temperature_k: Optional[float] = None
    description: Optional[str] = None

class WeatherRecord(BaseModel):
    id: int
    location: str
    date: str
    min_temperature_k: float
    max_temperature_k: float
    description: str
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class WeatherResponse(BaseModel):
    location: str
    temperature_c: float
    weather_code: int
    description: str
    forecast_data: str
    lat: float
    lon: float
