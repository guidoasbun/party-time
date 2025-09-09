"""
Base class for SQLAlchemy models.
This module provides the declarative base that all models will inherit from.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.
    
    This class serves as the foundation for all database models in the application.
    It inherits from SQLAlchemy's DeclarativeBase which provides:
    - Automatic table name generation
    - Column type inference
    - Relationship management
    """
    pass