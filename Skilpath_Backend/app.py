from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from src.routes.user_routes import user_router
from src.config.database import Base,  sync_engine
from src.config.settings import Settings
import logging
from contextlib import asynccontextmanager
# from src.utils.init_super_admin import create_super_admin
from src.config.database import SessionLocal
from src.models import skill, learning_plan, lesson, plan_event
from src.routes.onboarding import onboarding_router
from src.routes.roadmap import roadmap_router
from src.routes.lesson import lesson_router
from src.routes.dashboard import dashboard_router
from src.routes.profile import profile_router
from src.routes.skills import skills_router

# Configure logging
logging.basicConfig(
    filename='app.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db = SessionLocal()
    try:
        # from src.utils.reference_fetcher import get_reference_links
        # print(get_reference_links("Python", "Inheritance"))
        #create_super_admin(db)
        print("*")
    finally:
        db.close()
    yield 


settings=Settings()



app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Skillpath Project",
    version="1.0.0",
    lifespan=lifespan )

# Create tables synchronously
Base.metadata.create_all(bind=sync_engine)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add these lines where you already have app.include_router for user_router
app.include_router(onboarding_router, prefix="/api", tags=["Onboarding"])
app.include_router(roadmap_router, prefix="/api", tags=["Roadmap"])
app.include_router(lesson_router, prefix="/api", tags=["Lessons"])
app.include_router(dashboard_router, prefix="/api", tags=["Dashboard"])
app.include_router(profile_router, prefix="/api", tags=["Profile"])

app.include_router(user_router, prefix="/user", tags=["user"])

app.include_router(skills_router, prefix="/api", tags=["Skills"])

# Run app
if __name__ == "__main__":
    uvicorn.run("app:app", host=settings.HOST, port=settings.PORT, reload=True)