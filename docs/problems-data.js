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

// Empty for now — add new problems here in the same shape as before:
//   { title: "...", topic: "...", difficulty: "easy|medium|hard", langs: ["verilog","sv","vhdl"], rate: 0 }
// The MUX_* / GENERIC_STARTER constants above are kept as a reference for
// the fuller shape (description, constraints, starter code) a real problem
// needs — set `isMux` logic below to target whichever entry should get the
// full write-up, or write a similar per-problem lookup as more get added.
const RAW_PROBLEMS = [];

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

// ---------------------------------------------------------------------------
// Coding problems that run on the code-runner backend (coding-backend/server.js).
// `slug` must match the key in PROBLEMS in server.js, which holds the hidden tests.
// ---------------------------------------------------------------------------
LANG_LABEL.c = "C";

[
  {
    slug: "sum-two",
    title: "Sum of Two Numbers",
    topic: "Embedded C",
    difficulty: "easy",
    lang: "c",
    description:
      "Read two integers from stdin and print their sum.\n\nExample:\nInput:  2 3\nOutput: 5",
    constraints: "Use scanf to read the input. Print only the sum.",
    sample: "2 3\n",
    starter:
      '#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    // TODO: print a + b\n    return 0;\n}\n',
  },
  {
    slug: "endianness",
    title: "Endianness and Byte Order",
    topic: "Embedded C",
    difficulty: "medium",
    lang: "c",
    description:
      'Read one 32-bit hex value from stdin. Print three lines:\n1) "little" or "big" (detect it at runtime)\n2) the 4 bytes of the value in memory order, as lowercase hex separated by spaces\n3) the byte-swapped value as 0x followed by 8 lowercase hex digits\n\nHint: look at the value through a uint8_t pointer.\n\nExample:\nInput:  0x12345678\nOutput:\nlittle\n78 56 34 12\n0x78563412',
    constraints: "Do not use htonl or other library byte-swap helpers.",
    sample: "0x12345678\n",
    starter:
      '#include <stdio.h>\n#include <stdint.h>\n\nint main(void) {\n    unsigned int tmp;\n    scanf("%x", &tmp);\n    uint32_t v = tmp;\n\n    // TODO 1: print "little" or "big"\n    // TODO 2: print the bytes of v in memory order\n    // TODO 3: print the byte-swapped value as 0x%08x\n    return 0;\n}\n',
  },
  {
    slug: "hello-verilog",
    title: "Hello Verilog",
    topic: "Verilog Basics",
    difficulty: "easy",
    lang: "verilog",
    description:
      "Write a module named main that prints exactly:\nHello from Verilog inside Docker!\nthen ends the simulation with $finish.",
    constraints: "Use $display and $finish inside an initial block.",
    sample: "",
    starter:
      "module main;\n  initial begin\n    // TODO: $display the message\n    $finish;\n  end\nendmodule\n",
  },
].forEach((p) => {
  PROBLEMS.push({
    id: PROBLEMS.length + 1,
    slug: p.slug,
    title: p.title,
    topic: p.topic,
    difficulty: p.difficulty,
    success_rate: 0,
    languages: [p.lang],
    description: p.description,
    constraints: p.constraints,
    starter_code: { [p.lang]: p.starter },
    sample_input: p.sample,
    backend: true, // run on the code-runner server instead of the mock judge
  });
});