import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from typing import List
from starlette import status
from core.security import get_current_user
from db.database import get_db
from models.tasks import Task
from schemas.tasks import TaskCreate, TaskResponse, TaskUpdate

from models.accounts import User

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/create", response_model=TaskResponse)
async def create_task(
        task: TaskCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Create a new task"""

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    db_task = Task(**task.model_dump(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task


@router.get("/get/all-tasks", response_model=List[TaskResponse])
async def get_tasks(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get all tasks by current user.

    Returns:
    - 200: All tasks
    - 401: If not authenticated
    """

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

    return tasks


@router.get("/get/{task_id}", response_model=TaskResponse)
async def get_tasks(
        task_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """
    Get a specific task by ID if it belongs to the current user.

    Returns:
    - 200: Task details
    - 404: If task doesn't exist or doesn't belong to user
    - 401: If not authenticated
    """

    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()

    if current_user.id != Task.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found for this user",
        )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )

    return task


@router.patch("/update/{task_id}",
              response_model=TaskResponse,
              )
async def update_task(
        task_id: int,
        task_update: TaskUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Update a specific task with full database loading and concurrency control.

    - **task_id**: ID of task to update
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
