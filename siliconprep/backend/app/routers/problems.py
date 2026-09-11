from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.get("", response_model=list[schemas.ProblemListItem])
def list_problems(
    search: str | None = None,
    language: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
    db: Session = Depends(get_db),
):
    problems = crud.get_problems(
        db, search=search, language=language, topic=topic, difficulty=difficulty
    )
    return [
        schemas.ProblemListItem(
            id=p.id,
            slug=p.slug,
            title=p.title,
            topic=p.topic,
            difficulty=p.difficulty,
            success_rate=p.success_rate,
            languages=[l.language for l in p.languages],
        )
        for p in problems
    ]


@router.get("/{slug}", response_model=schemas.ProblemDetail)
def get_problem(slug: str, db: Session = Depends(get_db)):
    p = crud.get_problem_by_slug(db, slug)
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return schemas.ProblemDetail(
        id=p.id,
        slug=p.slug,
        title=p.title,
        topic=p.topic,
        difficulty=p.difficulty,
        description=p.description,
        constraints=p.constraints,
        success_rate=p.success_rate,
        languages=[l.language for l in p.languages],
        starter_code={s.language: s.code for s in p.starter_codes},
    )
