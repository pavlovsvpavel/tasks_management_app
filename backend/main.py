from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import users, auth, health
from routers import tasks
from db.database import engine, Base

app = FastAPI(
    title="Task App",
    description="Application for tasks management",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

if settings.ENVIRONMENT == "development" or settings.ENVIRONMENT == "local":
    print("Running in development mode, enabling CORS for web testing.")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Create database tables
# Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(tasks.router, prefix=settings.API_PREFIX)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
