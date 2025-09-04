from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.auth import router as auth_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Party-Time Event Planning API",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Party-Time API is running!",
        "version": "1.0.0",
        "environment": "development"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}