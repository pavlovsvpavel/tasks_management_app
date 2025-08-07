from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.dialects.mysql import VARCHAR
from sqlalchemy.orm import relationship
from sqlalchemy.sql.functions import func
from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True, index=True)
    picture = Column(VARCHAR, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True, server_default=func.now())
    is_active = Column(Boolean, default=True)

    tasks = relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan"
    )
