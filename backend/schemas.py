from pydantic import BaseModel
from typing import Optional

class WeatherRecordCreate(BaseModel):
    location: str
    date_range: Optional[str] = None

class WeatherRecordUpdate(BaseModel):
    location: Optional[str] = None
    date_range: Optional[str] = None
    temperature_c: Optional[float] = None
    description: Optional[str] = None
    forecast_data: Optional[str] = None

class WeatherRecord(BaseModel):
    id: int
    location: str
    date_range: Optional[str] = None
    temperature_c: Optional[float] = None
    description: Optional[str] = None
    forecast_data: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

    class Config:
        from_attributes = True
