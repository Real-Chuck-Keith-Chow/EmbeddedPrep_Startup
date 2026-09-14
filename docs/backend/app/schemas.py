from pydantic import BaseModel, ConfigDict


class ProblemListItem(BaseModel):
    id: int
    slug: str
    title: str
    topic: str
    difficulty: str
    success_rate: int
    languages: list[str]

    model_config = ConfigDict(from_attributes=True)


class ProblemDetail(BaseModel):
    id: int
    slug: str
    title: str
    topic: str
    difficulty: str
    description: str
    constraints: str
    success_rate: int
    languages: list[str]
    starter_code: dict[str, str]

    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    problem_id: int
    language: str
    code: str
    is_submit: bool = False


class SubmissionResult(BaseModel):
    status: str
    log: str
    tool: str
