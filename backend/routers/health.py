from fastapi import APIRouter
from starlette.responses import Response

router = APIRouter(tags=["health"])


@router.head("/health")
async def health_check():
    return Response(status_code=200)
