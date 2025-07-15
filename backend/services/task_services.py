from fastapi import Depends
from sqlalchemy.orm import Session
from starlette import status
from starlette.exceptions import HTTPException

from db.database import get_db
from models.users import User
from models.tasks import Task
from services.user_service import get_current_user


async def verify_task_ownership(
        task_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
) -> type[Task]:
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found for this user"
        )

    return task
