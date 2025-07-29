from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException

from db.database import get_db
from models.users import User
from models.tasks import Task
from services.user_service import get_current_user


async def verify_task_ownership(
        task_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
) -> Task:
    query = select(Task).where(Task.id == task_id)
    result = await db.execute(query)
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    return task
