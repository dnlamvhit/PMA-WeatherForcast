from sqlalchemy import Column, Integer, String, Float, DateTime, UniqueConstraint
from backend.database import Base
from datetime import datetime

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True)
    date = Column(String, index=True)
    min_temperature_k = Column(Float)
    max_temperature_k = Column(Float)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (UniqueConstraint('location', 'date', name='unique_location_date'),)
