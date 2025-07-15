import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from models.tasks import Task
from schemas.tasks import TaskCreate, TaskResponse, TaskUpdate

from models.users import User
from services.task_services import verify_task_ownership
from services.user_service import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/create", response_model=TaskResponse)
async def create_task(
        task: TaskCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Create a new task"""

    task = Task(**task.model_dump(), user_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/get/all-tasks", response_model=List[TaskResponse])
async def get_all_tasks(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Get all tasks by current user.

    Returns:
    - 200: All tasks
    - 401: If not authenticated
    """

    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

    return tasks


@router.get("/get/{task_id}", response_model=TaskResponse)
async def get_task(
        task: Task = Depends(verify_task_ownership)
):
    """
    Get a specific task by ID if it belongs to the current user.

    Returns:
    - 200: Task details
    - 404: If task doesn't exist or doesn't belong to user
    - 401: If not authenticated
    """

    return task


@router.patch("/update/{task_id}", response_model=TaskResponse)
async def update_task(
        task_update: TaskUpdate,
        db: Session = Depends(get_db),
        task: Task = Depends(verify_task_ownership)
):
    """
    Update a specific task with full database loading and concurrency control.

    - **name** (optional): New task name
    - **description** (optional): New description
    - **completed** (optional): Set completion status
    """

    update_data = task_update.model_dump(exclude_unset=True)

    if "completed" in update_data:
        task.completed = update_data["completed"]
        task.completed_at = datetime.datetime.now(datetime.UTC) if update_data["completed"] else None

    if "name" in update_data:
        task.name = update_data["name"]

    if "description" in update_data:
        task.description = update_data["description"]

    db.commit()
    db.refresh(task)

    return task


@router.delete("/delete/{task_id}")
async def delete_task(
        db: Session = Depends(get_db),
        task: Task = Depends(verify_task_ownership)
):
    """
    Delete a specific task if it belongs to the current user.

    Returns:
    - 200: Task deleted successfully
    - 404: If task doesn't exist or doesn't belong to user
    - 401: If not authenticated
    """

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}
