from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from . import models


def get_problems(
    db: Session,
    search: str | None = None,
    language: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
):
    stmt = select(models.Problem).options(selectinload(models.Problem.languages))

    if search:
        stmt = stmt.where(models.Problem.title.ilike(f"%{search}%"))
    if topic:
        stmt = stmt.where(models.Problem.topic == topic)
    if difficulty:
        stmt = stmt.where(models.Problem.difficulty == difficulty)
    if language:
        stmt = stmt.join(models.ProblemLanguage).where(
            models.ProblemLanguage.language == language
        )

    stmt = stmt.order_by(models.Problem.id)
    return db.execute(stmt).unique().scalars().all()


def get_problem_by_slug(db: Session, slug: str):
    stmt = (
        select(models.Problem)
        .options(
            selectinload(models.Problem.languages),
            selectinload(models.Problem.starter_codes),
        )
        .where(models.Problem.slug == slug)
    )
    return db.execute(stmt).scalars().first()


def get_problem(db: Session, problem_id: int):
    return db.get(models.Problem, problem_id)


def get_topics(db: Session) -> list[str]:
    stmt = select(models.Problem.topic).distinct().order_by(models.Problem.topic)
    return list(db.execute(stmt).scalars().all())


def create_submission(
    db: Session,
    *,
    problem_id: int,
    language: str,
    code: str,
    is_submit: bool,
    status: str,
    log: str,
) -> models.Submission:
    submission = models.Submission(
        problem_id=problem_id,
        language=language,
        code=code,
        is_submit=is_submit,
        status=status,
        log=log,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission
