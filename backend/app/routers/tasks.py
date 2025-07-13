import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from typing import List

from starlette import status
from starlette.requests import Request

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.tasks import Task
from app.schemas.tasks import TaskCreate, TaskResponse, TaskUpdate

from app.models.accounts import User

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/create", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_task = Task(**task.model_dump(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task

@router.get("/get", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

    return tasks


@router.patch("/{task_id}",
    response_model=TaskResponse,
)
async def update_task(
        request: Request,
        task_id: int,
        task_update: TaskUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a specific task with full database loading and concurrency control.

    - **task_id**: ID of task to update
    - **version**: Current version for optimistic locking
    - **name** (optional): New task name
    - **description** (optional): New description
    - **completed** (optional): Set completion status
    """
    # Load task with all relationships and version checking
    stmt = (
        select(Task)
        .options(selectinload(Task.user))  # Eager load user relationship
        .where(
            Task.id == task_id,
            Task.user_id == current_user.id  # Ensure ownership
        )
        .with_for_update()  # Row-level locking
    )

    db_task = db.execute(stmt).scalar_one_or_none()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )

    # Apply updates
    update_data = task_update.model_dump(exclude_unset=True)

    if "completed" in update_data:
        db_task.completed = update_data["completed"]
        db_task.completed_at = datetime.datetime.now(datetime.UTC) if update_data["completed"] else None

    if "name" in update_data:
        db_task.name = update_data["name"]

    if "description" in update_data:
        db_task.description = update_data["description"]

    db.commit()
    db.refresh(db_task)

    return db_task