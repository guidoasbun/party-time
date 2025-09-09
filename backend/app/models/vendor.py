"""Vendor models for service provider management."""
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class Vendor(Base):
    """Service providers for events."""
    __tablename__ = "vendors"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Vendor information
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)  # caterer, photographer, DJ, etc.
    
    # Contact details
    contact_email = Column(String(255))
    contact_phone = Column(String(20))
    address = Column(Text)
    website = Column(String(255))
    
    # Rating and notes
    rating = Column(DECIMAL(3, 2))  # 0.00 to 5.00
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event_vendors = relationship("EventVendor", back_populates="vendor")


class EventVendor(Base):
    """Junction table for many-to-many relationship between events and vendors."""
    __tablename__ = "event_vendors"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign keys
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    
    # Contract details
    service_description = Column(Text)
    contract_amount = Column(DECIMAL(10, 2))
    contract_date = Column(Date)
    is_confirmed = Column(Boolean, nullable=False, default=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    event = relationship("Event")
    vendor = relationship("Vendor", back_populates="event_vendors")