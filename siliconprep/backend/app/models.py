from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    topic: Mapped[str] = mapped_column(String(60), index=True)
    difficulty: Mapped[str] = mapped_column(String(10))  # "easy" | "medium" | "hard"
    description: Mapped[str] = mapped_column(Text, default="")
    constraints: Mapped[str] = mapped_column(Text, default="")
    success_rate: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    languages: Mapped[list["ProblemLanguage"]] = relationship(
        back_populates="problem", cascade="all, delete-orphan"
    )
    starter_codes: Mapped[list["StarterCode"]] = relationship(
        back_populates="problem", cascade="all, delete-orphan"
    )
    submissions: Mapped[list["Submission"]] = relationship(
        back_populates="problem", cascade="all, delete-orphan"
    )


class ProblemLanguage(Base):
    """One row per language a problem supports, e.g. (problem 1, 'verilog')."""

    __tablename__ = "problem_languages"

    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id"))
    language: Mapped[str] = mapped_column(String(20))  # "verilog" | "sv" | "vhdl"

    problem: Mapped["Problem"] = relationship(back_populates="languages")


class StarterCode(Base):
    """The editor's starting template for one (problem, language) pair."""

    __tablename__ = "starter_code"

    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id"))
    language: Mapped[str] = mapped_column(String(20))
    code: Mapped[str] = mapped_column(Text)

    problem: Mapped["Problem"] = relationship(back_populates="starter_codes")


class Submission(Base):
    """A Run or Submit event. `status`/`log` come from the judge (mocked for now)."""

    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id"))
    language: Mapped[str] = mapped_column(String(20))
    code: Mapped[str] = mapped_column(Text)
    is_submit: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="passed")
    log: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    problem: Mapped["Problem"] = relationship(back_populates="submissions")
