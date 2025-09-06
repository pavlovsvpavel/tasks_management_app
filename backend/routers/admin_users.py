from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.security import get_password_hash, verify_admin
from db.database import get_db
from models.users import User
from schemas.users import UserCreate, UserResponse, AdminUserUpdate
from sqlalchemy.future import select
from services.user_service import get_user_by_email, create_user

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("", response_model=list[UserResponse])
async def get_all_users(
        db: AsyncSession = Depends(get_db),
        _: str = Depends(verify_admin),
):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.post("/create", response_model=UserResponse)
async def create_user_admin(
        user: UserCreate,
        db: AsyncSession = Depends(get_db),
        _: str = Depends(verify_admin),
):
    db_user = await get_user_by_email(db, email=user.email)

    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already registered"
        )
    return await create_user(db=db, user_data=user)


@router.patch("/{user_id}")
async def update_user_status(
        user_id: int,
        update_data: AdminUserUpdate,
        db: AsyncSession = Depends(get_db),
        _: str = Depends(verify_admin),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.is_active is not None:
        user.is_active = update_data.is_active

    if update_data.new_password:
        user.hashed_password = get_password_hash(update_data.new_password)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"message": "User updated"}


@router.delete("/{user_id}")
async def delete_user_admin(
        user_id: str,
        db: AsyncSession = Depends(get_db),
        _: str = Depends(verify_admin),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}
