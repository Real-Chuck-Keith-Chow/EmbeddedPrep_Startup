from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud
from .database import Base, engine, get_db
from .routers import problems, submissions

# Creates any missing tables on startup. Fine for a starter project — once your
# schema stabilizes, switch to Alembic migrations instead of relying on this.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SiliconPrep API")

# Dev-only CORS: wide open so Live Server / file:// pages can call the API.
# Restrict allow_origins to your real frontend domain before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router)
app.include_router(submissions.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/topics", response_model=list[str])
def list_topics(db: Session = Depends(get_db)):
    return crud.get_topics(db)
