from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, field_validator


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    due_date: datetime
    priority: str


class TaskCreate(TaskBase):
    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, value: datetime) -> datetime:
        """Ensure the due date is not in the past."""
        if value.date() < date.today():
            raise ValueError("Due date cannot be in the past")
        return value


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    notification_id: Optional[str] = None

    @field_validator("due_date")
    @classmethod
    def validate_update_due_date(cls, value: Optional[datetime]) -> Optional[datetime]:
        # Only validate if a date is actually provided
        if value and value.date() < date.today():
            raise ValueError("Due date cannot be in the past")
        return value


class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    notification_id: Optional[str] = None

    class Config:
        from_attributes = True
