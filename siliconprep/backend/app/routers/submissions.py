from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/submissions", tags=["submissions"])

TOOL = {"verilog": "iverilog", "sv": "verilator", "vhdl": "ghdl"}
EXT = {"verilog": "v", "sv": "sv", "vhdl": "vhd"}


@router.post("", response_model=schemas.SubmissionResult)
def create_submission(payload: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    problem = crud.get_problem(db, payload.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    tool = TOOL.get(payload.language, "iverilog")
    ext = EXT.get(payload.language, "v")

    # --- MOCK JUDGE -----------------------------------------------------
    # This always reports a pass and never actually compiles or simulates
    # the submitted code. It exists so the API/DB/frontend loop works
    # end-to-end. Swap this block for a real call to a sandboxed worker
    # that runs iverilog / verilator / ghdl against a hidden testbench.
    log = (
        f"$ {tool} {problem.slug}.{ext} tb_{problem.slug}.{ext}\n"
        f"TESTBENCH: {problem.slug}\n"
        f"  vector 0  [PASS]\n"
        f"  vector 1  [PASS]\n"
        f"  vector 2  [PASS]\n"
        f"  vector 3  [PASS]\n"
        f"4/4 test vectors passed\n\n"
        f"// Mock output \u2014 no real simulation has run yet."
    )
    status = "passed"
    # ---------------------------------------------------------------------

    crud.create_submission(
        db,
        problem_id=problem.id,
        language=payload.language,
        code=payload.code,
        is_submit=payload.is_submit,
        status=status,
        log=log,
    )

    return schemas.SubmissionResult(status=status, log=log, tool=tool)
