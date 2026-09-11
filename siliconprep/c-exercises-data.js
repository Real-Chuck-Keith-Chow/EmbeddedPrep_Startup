// Fill-in-the-blank C exercises for c-exercises.html — W3Schools-style:
// a code snippet with one blank, an inline input to fill it in, and instant
// checking. No real compiler involved (this is a static, zero-install site),
// so the check is a text match against the accepted answer(s), not real
// execution.
//
// TO ADD A NEW EXERCISE: copy one of the objects below, give it a unique id,
// and edit the fields. Nothing else needs to change.
//
//   {
//     id: <unique number>,
//     topic: "<short label shown above the exercise, e.g. 'Pointers'>",
//     prompt: "<the instruction text shown above the code>",
//     code_before: "<code text before the blank, including its own \n's>",
//     code_after: "<code text after the blank>",
//     answer: ["<accepted answer>", "<optional alternate accepted answer>"],
//   }
//
// The blank is rendered as an inline text input sitting right between
// code_before and code_after — write them so the code still reads correctly
// with the answer dropped in between (matching whitespace included).
// Checking trims the user's input but is otherwise an exact, case-sensitive
// match against any string in `answer` (C is case-sensitive, so "Printf"
// shouldn't be accepted for "printf").
//
const EXERCISES = [
  {
    id: 1,
    topic: "C Basics",
    prompt: 'Insert the missing part to output "Hello World" to the screen.',
    code_before: '#include <stdio.h>\n\nint main() {\n  ',
    code_after: '("Hello World");\n  return 0;\n}',
    answer: ["printf"],
  },
  {
    id: 2,
    topic: "C Basics",
    prompt: "Declare an integer variable named x and assign it the value 5.",
    code_before: '#include <stdio.h>\n\nint main() {\n  ',
    code_after: ' x = 5;\n  printf("%d", x);\n  return 0;\n}',
    answer: ["int"],
  },
  {
    id: 3,
    topic: "C Operators",
    prompt: "Complete the code to increment count by 1, using the post-increment operator.",
    code_before: '#include <stdio.h>\n\nint main() {\n  int count = 0;\n  count',
    code_after: ';\n  printf("%d", count);\n  return 0;\n}',
    answer: ["++"],
  },
  {
    id: 4,
    topic: "Control Flow",
    prompt: "Complete the condition to check whether x is greater than y.",
    code_before: '#include <stdio.h>\n\nint main() {\n  int x = 10, y = 5;\n  if (x ',
    code_after: ' y) {\n    printf("x is greater");\n  }\n  return 0;\n}',
    answer: [">"],
  },
  {
    id: 5,
    topic: "Control Flow",
    prompt: "Complete the keyword that stops a switch statement from falling through to the next case.",
    code_before: '#include <stdio.h>\n\nint main() {\n  int day = 2;\n  switch (day) {\n    case 1:\n      printf("Monday");\n      break;\n    case 2:\n      printf("Tuesday");\n      ',
    code_after: ';\n    default:\n      printf("Unknown");\n  }\n  return 0;\n}',
    answer: ["break"],
  },
  {
    id: 6,
    topic: "Arrays & Memory",
    prompt: "Complete the declaration so numbers is an array of 5 integers.",
    code_before: '#include <stdio.h>\n\nint main() {\n  int numbers',
    code_after: ';\n  printf("%zu", sizeof(numbers));\n  return 0;\n}',
    answer: ["[5]"],
  },
  {
    id: 7,
    topic: "Pointers",
    prompt: "Complete the code to print the value stored at the address held by pointer p (not the address itself).",
    code_before: '#include <stdio.h>\n\nint main() {\n  int x = 42;\n  int *p = &x;\n  printf("%d", ',
    code_after: 'p);\n  return 0;\n}',
    answer: ["*"],
  },
  {
    id: 8,
    topic: "Pointers",
    prompt: "Complete the parameter type so this function can modify the caller's variable through a pointer.",
    code_before: 'void increment(int ',
    code_after: 'num) {\n  (*num)++;\n}',
    answer: ["*"],
  },
  {
    id: 9,
    topic: "GPIO / Bitwise Ops",
    prompt: "Complete the operator to SET bit 3 of gpio without disturbing any other bits.",
    code_before: '#include <stdio.h>\n\nint main() {\n  unsigned char gpio = 0b00000000;\n  gpio ',
    code_after: ' (1 << 3);  // set bit 3\n  printf("%d", gpio);\n  return 0;\n}',
    answer: ["|="],
  },
  {
    id: 10,
    topic: "GPIO / Bitwise Ops",
    prompt: "Complete the operator to CLEAR bit 3 of gpio without disturbing any other bits.",
    code_before: '#include <stdio.h>\n\nint main() {\n  unsigned char gpio = 0b00001111;\n  gpio ',
    code_after: ' ~(1 << 3);  // clear bit 3\n  printf("%d", gpio);\n  return 0;\n}',
    answer: ["&="],
  },
  {
    id: 11,
    topic: "Loops",
    prompt: "Complete the loop condition so it prints 0 through 4 (5 numbers total).",
    code_before: '#include <stdio.h>\n\nint main() {\n  for (int i = 0; i ',
    code_after: ' 5; i++) {\n    printf("%d ", i);\n  }\n  return 0;\n}',
    answer: ["<"],
  },
  {
    id: 12,
    topic: "Structs & Hardware",
    prompt: "Complete the keyword used to group related hardware register fields into one custom type.",
    code_before: '',
    code_after: ' {\n  int status;\n  int control;\n} Register;',
    answer: ["struct"],
  },
];
