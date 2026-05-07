from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user")
    city = Column(String)
    society_name = Column(String)

    readings = relationship("Reading", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    appliance_usages = relationship("ApplianceUsage", back_populates="user")

class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    units = Column(Integer)
    city = Column(String)
    state = Column(String)
    household_type = Column(String)
    total_bill = Column(Float)
    city_tier = Column(String)
    region = Column(String)
    climate = Column(String)
    carbon_kg = Column(Float)
    green_score = Column(Integer)
    renewable_potential = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Nullable for backward compatibility with existing records
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="readings")
    appliance_usages = relationship("ApplianceUsage", back_populates="reading")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String)
    type = Column(String)  # "high_usage", "anomaly", "slab"
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")

class Tariff(Base):
    __tablename__ = "tariffs"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String)
    provider = Column(String)
    year = Column(Integer)

    slab_limit = Column(String)   # "50", "100", "rest"
    rate = Column(Float)

    fixed_charge = Column(Float, default=0)
    tax_percent = Column(Float, default=0)

class ApplianceUsage(Base):
    __tablename__ = "appliance_usage"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    appliance = Column(String)
    units = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    reading = relationship("Reading", back_populates="appliance_usages")
    user = relationship("User", back_populates="appliance_usages")