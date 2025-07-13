from fastapi import FastAPI, Depends
from app.routers import accounts, tasks, auth
from app.db.database import engine, Base
from app.models.accounts import User
from app.core.security import get_current_user

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "Task Manager API"}

@app.get("/protected")
async def protected_route(
    user: User = Depends(get_current_user)
):
    return user

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
