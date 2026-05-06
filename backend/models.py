from sqlalchemy import Column, Integer, String, Float, Text
from backend.database import Base

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True)
    date_range = Column(String)
    temperature_c = Column(Float)
    description = Column(String)
    forecast_data = Column(Text) # JSON string of forecast
    lat = Column(Float)
    lon = Column(Float)
