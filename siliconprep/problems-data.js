// Local problem catalogue — powers problems.html and problem.html with zero
// install and no server required. This mirrors exactly what the FastAPI
// backend (see /backend, and backend/seed.py specifically) would return, so
// reconnecting the real backend later is just a matter of rewriting api.js's
// internals back to fetch() calls — this file, problems.js, editor.js, and
// the HTML pages don't need to change.

const LANG_LABEL = { verilog: "Verilog", sv: "SystemVerilog", vhdl: "VHDL" };

const MUX_DESCRIPTION =
  "Implement a 2-to-1 multiplexer. When sel is low, the output y follows " +
  "input a. When sel is high, y follows input b.\n\n" +
  "Interface: sel, a, b are 1-bit inputs; y is a 1-bit output.\n\n" +
  "Truth table:\n" +
  "sel a b | y\n" +
  " 0  0 0 | 0\n" +
  " 0  0 1 | 0\n" +
  " 0  1 0 | 1\n" +
  " 0  1 1 | 1\n" +
  " 1  0 0 | 0\n" +
  " 1  0 1 | 1\n" +
  " 1  1 0 | 0\n" +
  " 1  1 1 | 1";

const MUX_CONSTRAINTS =
  "Combinational only \u2014 no clock, no internal state. Any of assign, an " +
  "always_comb/always @(*) block, or a VHDL concurrent statement is acceptable.";

const MUX_STARTER = {
  verilog:
`module mux2to1 (
    input  wire sel,
    input  wire a,
    input  wire b,
    output wire y
);

    // TODO: implement y = sel ? b : a

endmodule
`,
  sv:
`module mux2to1 (
    input  logic sel,
    input  logic a,
    input  logic b,
    output logic y
);

    // TODO: implement y = sel ? b : a

endmodule
`,
  vhdl:
`library ieee;
use ieee.std_logic_1164.all;

entity mux2to1 is
    port (
        sel : in  std_logic;
        a   : in  std_logic;
        b   : in  std_logic;
        y   : out std_logic
    );
end entity;

architecture rtl of mux2to1 is
begin
    -- TODO: implement y = sel ? b : a
end architecture;
`,
};

const PLACEHOLDER_DESCRIPTION =
  "Full problem statement coming soon. This entry is seeded with placeholder " +
  "content so the app can be tested end-to-end.";

const GENERIC_STARTER = {
  verilog: "module top (\n    // TODO: ports\n);\n\n    // TODO: implementation\n\nendmodule\n",
  sv: "module top (\n    // TODO: ports\n);\n\n    // TODO: implementation\n\nendmodule\n",
  vhdl:
`library ieee;
use ieee.std_logic_1164.all;

entity top is
    -- TODO: ports
end entity;

architecture rtl of top is
begin
    -- TODO: implementation
end architecture;
`,
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const RAW_PROBLEMS = [
  { title: "2-to-1 Multiplexer", topic: "Combinational", difficulty: "easy", langs: ["verilog", "sv", "vhdl"], rate: 91 },
  { title: "4-bit Priority Encoder", topic: "Combinational", difficulty: "easy", langs: ["verilog", "sv"], rate: 84 },
  { title: "BCD to 7-Segment Decoder", topic: "Combinational", difficulty: "easy", langs: ["verilog", "sv", "vhdl"], rate: 79 },
  { title: "Ripple Carry Adder", topic: "Arithmetic", difficulty: "easy", langs: ["verilog", "vhdl"], rate: 88 },
  { title: "8-bit ALU", topic: "Arithmetic", difficulty: "medium", langs: ["verilog", "sv"], rate: 61 },
  { title: "Booth Multiplier", topic: "Arithmetic", difficulty: "hard", langs: ["verilog", "sv"], rate: 34 },
  { title: "D Flip-Flop with Async Reset", topic: "Sequential", difficulty: "easy", langs: ["verilog", "sv", "vhdl"], rate: 93 },
  { title: "Traffic Light FSM", topic: "FSM", difficulty: "medium", langs: ["verilog", "sv", "vhdl"], rate: 58 },
  { title: "Vending Machine FSM", topic: "FSM", difficulty: "medium", langs: ["sv", "vhdl"], rate: 52 },
  { title: "Sequence Detector (1011)", topic: "FSM", difficulty: "medium", langs: ["verilog", "sv"], rate: 55 },
  { title: "Synchronous FIFO", topic: "Memory", difficulty: "medium", langs: ["verilog", "sv"], rate: 47 },
  { title: "Asynchronous FIFO (Gray Code)", topic: "CDC", difficulty: "hard", langs: ["sv", "vhdl"], rate: 21 },
  { title: "Dual-Port RAM", topic: "Memory", difficulty: "medium", langs: ["verilog", "vhdl"], rate: 63 },
  { title: "LRU Cache Controller", topic: "Memory", difficulty: "hard", langs: ["sv"], rate: 24 },
  { title: "Two-Flop Synchronizer", topic: "CDC", difficulty: "easy", langs: ["verilog", "sv", "vhdl"], rate: 76 },
  { title: "UART Transmitter", topic: "Protocols", difficulty: "medium", langs: ["verilog", "sv", "vhdl"], rate: 49 },
  { title: "SPI Master Controller", topic: "Protocols", difficulty: "medium", langs: ["verilog", "sv"], rate: 44 },
  { title: "I2C Slave Interface", topic: "Protocols", difficulty: "hard", langs: ["sv", "vhdl"], rate: 27 },
  { title: "AXI-Lite Read Channel", topic: "Protocols", difficulty: "hard", langs: ["sv"], rate: 22 },
  { title: "Assertion: One-Hot Checker (SVA)", topic: "Verification", difficulty: "medium", langs: ["sv"], rate: 41 },
  { title: "Self-Checking Testbench Basics", topic: "Verification", difficulty: "easy", langs: ["sv", "vhdl"], rate: 71 },
  { title: "Debounce Circuit", topic: "Sequential", difficulty: "easy", langs: ["verilog", "vhdl"], rate: 82 },
  { title: "Register File (2R1W)", topic: "Memory", difficulty: "medium", langs: ["verilog", "sv"], rate: 56 },
  { title: "Clock Divider (Odd Ratio)", topic: "Sequential", difficulty: "medium", langs: ["verilog", "vhdl"], rate: 53 },
];

const PROBLEMS = RAW_PROBLEMS.map((p, i) => {
  const isMux = i === 0;
  return {
    id: i + 1,
    slug: slugify(p.title),
    title: p.title,
    topic: p.topic,
    difficulty: p.difficulty,
    success_rate: p.rate,
    languages: p.langs,
    description: isMux ? MUX_DESCRIPTION : PLACEHOLDER_DESCRIPTION,
    constraints: isMux ? MUX_CONSTRAINTS : "TBD",
    starter_code: Object.fromEntries(
      p.langs.map((lang) => [lang, (isMux ? MUX_STARTER : GENERIC_STARTER)[lang]])
    ),
  };
});
