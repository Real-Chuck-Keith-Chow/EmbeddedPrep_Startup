"""
Populates the database with the starter problem catalogue.

Run once after your tables exist:
    python seed.py

Safe to re-run — it wipes and re-inserts the seeded tables each time, so don't
run this against a database that already has real user submissions you want
to keep.
"""

import re

from app.database import Base, SessionLocal, engine
from app.models import Problem, ProblemLanguage, StarterCode, Submission

LANG_LABEL = {"verilog": "Verilog", "sv": "SystemVerilog", "vhdl": "VHDL"}

# Same catalogue as the original frontend mock data (data.js).
PROBLEMS = [
    {"title": "2-to-1 Multiplexer", "topic": "Combinational", "difficulty": "easy", "langs": ["verilog", "sv", "vhdl"], "rate": 91},
    {"title": "4-bit Priority Encoder", "topic": "Combinational", "difficulty": "easy", "langs": ["verilog", "sv"], "rate": 84},
    {"title": "BCD to 7-Segment Decoder", "topic": "Combinational", "difficulty": "easy", "langs": ["verilog", "sv", "vhdl"], "rate": 79},
    {"title": "Ripple Carry Adder", "topic": "Arithmetic", "difficulty": "easy", "langs": ["verilog", "vhdl"], "rate": 88},
    {"title": "8-bit ALU", "topic": "Arithmetic", "difficulty": "medium", "langs": ["verilog", "sv"], "rate": 61},
    {"title": "Booth Multiplier", "topic": "Arithmetic", "difficulty": "hard", "langs": ["verilog", "sv"], "rate": 34},
    {"title": "D Flip-Flop with Async Reset", "topic": "Sequential", "difficulty": "easy", "langs": ["verilog", "sv", "vhdl"], "rate": 93},
    {"title": "Traffic Light FSM", "topic": "FSM", "difficulty": "medium", "langs": ["verilog", "sv", "vhdl"], "rate": 58},
    {"title": "Vending Machine FSM", "topic": "FSM", "difficulty": "medium", "langs": ["sv", "vhdl"], "rate": 52},
    {"title": "Sequence Detector (1011)", "topic": "FSM", "difficulty": "medium", "langs": ["verilog", "sv"], "rate": 55},
    {"title": "Synchronous FIFO", "topic": "Memory", "difficulty": "medium", "langs": ["verilog", "sv"], "rate": 47},
    {"title": "Asynchronous FIFO (Gray Code)", "topic": "CDC", "difficulty": "hard", "langs": ["sv", "vhdl"], "rate": 21},
    {"title": "Dual-Port RAM", "topic": "Memory", "difficulty": "medium", "langs": ["verilog", "vhdl"], "rate": 63},
    {"title": "LRU Cache Controller", "topic": "Memory", "difficulty": "hard", "langs": ["sv"], "rate": 24},
    {"title": "Two-Flop Synchronizer", "topic": "CDC", "difficulty": "easy", "langs": ["verilog", "sv", "vhdl"], "rate": 76},
    {"title": "UART Transmitter", "topic": "Protocols", "difficulty": "medium", "langs": ["verilog", "sv", "vhdl"], "rate": 49},
    {"title": "SPI Master Controller", "topic": "Protocols", "difficulty": "medium", "langs": ["verilog", "sv"], "rate": 44},
    {"title": "I2C Slave Interface", "topic": "Protocols", "difficulty": "hard", "langs": ["sv", "vhdl"], "rate": 27},
    {"title": "AXI-Lite Read Channel", "topic": "Protocols", "difficulty": "hard", "langs": ["sv"], "rate": 22},
    {"title": "Assertion: One-Hot Checker (SVA)", "topic": "Verification", "difficulty": "medium", "langs": ["sv"], "rate": 41},
    {"title": "Self-Checking Testbench Basics", "topic": "Verification", "difficulty": "easy", "langs": ["sv", "vhdl"], "rate": 71},
    {"title": "Debounce Circuit", "topic": "Sequential", "difficulty": "easy", "langs": ["verilog", "vhdl"], "rate": 82},
    {"title": "Register File (2R1W)", "topic": "Memory", "difficulty": "medium", "langs": ["verilog", "sv"], "rate": 56},
    {"title": "Clock Divider (Odd Ratio)", "topic": "Sequential", "difficulty": "medium", "langs": ["verilog", "vhdl"], "rate": 53},
]

# Full worked example for problem #1 — the rest get placeholder text until you
# write real statements + testbenches for them.
MUX_DESCRIPTION = (
    "Implement a 2-to-1 multiplexer. When sel is low, the output y follows "
    "input a. When sel is high, y follows input b.\n\n"
    "Interface: sel, a, b are 1-bit inputs; y is a 1-bit output.\n\n"
    "Truth table:\n"
    "sel a b | y\n"
    " 0  0 0 | 0\n"
    " 0  0 1 | 0\n"
    " 0  1 0 | 1\n"
    " 0  1 1 | 1\n"
    " 1  0 0 | 0\n"
    " 1  0 1 | 1\n"
    " 1  1 0 | 0\n"
    " 1  1 1 | 1"
)
MUX_CONSTRAINTS = (
    "Combinational only \u2014 no clock, no internal state. Any of assign, an "
    "always_comb/always @(*) block, or a VHDL concurrent statement is acceptable."
)
MUX_STARTER = {
    "verilog": (
        "module mux2to1 (\n"
        "    input  wire sel,\n"
        "    input  wire a,\n"
        "    input  wire b,\n"
        "    output wire y\n"
        ");\n\n"
        "    // TODO: implement y = sel ? b : a\n\n"
        "endmodule\n"
    ),
    "sv": (
        "module mux2to1 (\n"
        "    input  logic sel,\n"
        "    input  logic a,\n"
        "    input  logic b,\n"
        "    output logic y\n"
        ");\n\n"
        "    // TODO: implement y = sel ? b : a\n\n"
        "endmodule\n"
    ),
    "vhdl": (
        "library ieee;\n"
        "use ieee.std_logic_1164.all;\n\n"
        "entity mux2to1 is\n"
        "    port (\n"
        "        sel : in  std_logic;\n"
        "        a   : in  std_logic;\n"
        "        b   : in  std_logic;\n"
        "        y   : out std_logic\n"
        "    );\n"
        "end entity;\n\n"
        "architecture rtl of mux2to1 is\n"
        "begin\n"
        "    -- TODO: implement y = sel ? b : a\n"
        "end architecture;\n"
    ),
}

PLACEHOLDER_DESCRIPTION = (
    "Full problem statement coming soon. This entry is seeded with placeholder "
    "content so the API and database can be tested end-to-end."
)

GENERIC_STARTER = {
    "verilog": "module top (\n    // TODO: ports\n);\n\n    // TODO: implementation\n\nendmodule\n",
    "sv": "module top (\n    // TODO: ports\n);\n\n    // TODO: implementation\n\nendmodule\n",
    "vhdl": (
        "library ieee;\n"
        "use ieee.std_logic_1164.all;\n\n"
        "entity top is\n"
        "    -- TODO: ports\n"
        "end entity;\n\n"
        "architecture rtl of top is\n"
        "begin\n"
        "    -- TODO: implementation\n"
        "end architecture;\n"
    ),
}


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Wipe existing seeded data so this script is safe to re-run.
        db.query(Submission).delete()
        db.query(StarterCode).delete()
        db.query(ProblemLanguage).delete()
        db.query(Problem).delete()
        db.commit()

        for i, p in enumerate(PROBLEMS):
            is_mux = i == 0
            problem = Problem(
                slug=slugify(p["title"]),
                title=p["title"],
                topic=p["topic"],
                difficulty=p["difficulty"],
                success_rate=p["rate"],
                description=MUX_DESCRIPTION if is_mux else PLACEHOLDER_DESCRIPTION,
                constraints=MUX_CONSTRAINTS if is_mux else "TBD",
            )
            db.add(problem)
            db.flush()  # assigns problem.id before we reference it below

            for lang in p["langs"]:
                db.add(ProblemLanguage(problem_id=problem.id, language=lang))
                starter = MUX_STARTER if is_mux else GENERIC_STARTER
                db.add(
                    StarterCode(
                        problem_id=problem.id, language=lang, code=starter[lang]
                    )
                )

        db.commit()
        print(f"Seeded {len(PROBLEMS)} problems.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
