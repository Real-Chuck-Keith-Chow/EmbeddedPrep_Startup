// Multiple-choice question bank for quiz.html.
//
// TO ADD A NEW QUESTION: copy one of the objects below, give it a unique id,
// and edit the fields. Nothing else needs to change — quiz.js reads this
// array and builds the whole page from it.
//
//   {
//     id: <unique number>,
//     topic: "<short label shown above the question, e.g. 'GPIO'>",
//     question: "<the question text>",
//     code: "<optional — a code snippet shown in a monospace block>",
//     options: [
//       { key: "A", text: "<option text — use \n for multi-line options>" },
//       { key: "B", text: "<option text>" },
//       ... as many options as you need
//     ],
//     correct: "<the key of the right option, e.g. 'B'>",
//   }
//
// `code` is optional — omit it entirely for plain conceptual questions.
//
// SELECT-ALL-THAT-APPLY QUESTIONS: make `correct` an ARRAY of keys instead of
// a single string, e.g. correct: ["A", "C", "D"]. quiz.js detects this
// automatically and renders checkboxes + a "Check answer" button instead of
// answer-on-click. Everything else about the object shape stays the same.
//
const QUIZ_QUESTIONS = [
  {
    id: 1,
    topic: "I/O Systems",
    question: "What are the four categories of I/O?",
    options: [
      { key: "A", text: "Parallel" },
      { key: "B", text: "Serial" },
      { key: "C", text: "Analog" },
      { key: "D", text: "Time" },
      { key: "E", text: "All the above" },
    ],
    correct: "E",
  },
  {
    id: 2,
    topic: "Embedded Fundamentals",
    question: "Is Cyber-Physical Systems another name for embedded systems?",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
    ],
    correct: "A",
  },
  {
    id: 3,
    topic: "GPIO",
    question: 'What does "friendly" code mean when accessing GPIO pins?',
    options: [
      { key: "A", text: "Code that toggles all pins on the port." },
      { key: "B", text: "Code that modifies only the intended pin without affecting others." },
      { key: "C", text: "Code that uses delays to debounce switches." },
      { key: "D", text: "Code that enables all interrupts." },
    ],
    correct: "B",
  },
  {
    id: 4,
    topic: "C Operators",
    question: "What are the expected outputs for the following code?",
    code:
`#include <stdio.h>

int main() {
    int counting_num = 5;
    printf("Post-increment: %d\\n", counting_num++);
    printf("Pre-increment: %d\\n", ++counting_num);
    printf("Post-decrement: %d\\n", counting_num--);
    printf("Pre-decrement: %d\\n", --counting_num);
    return 0;
}`,
    options: [
      { key: "A", text: "Post-increment: 5\nPre-increment: 7\nPost-decrement: 7\nPre-decrement: 5" },
      { key: "B", text: "Post-increment: 6\nPre-increment: 6\nPost-decrement: 4\nPre-decrement: 4" },
      { key: "C", text: "Post-increment: 5\nPre-increment: 6\nPost-decrement: 6\nPre-decrement: 5" },
      { key: "D", text: "Post-increment: 6\nPre-increment: 7\nPost-decrement: 6\nPre-decrement: 5" },
      { key: "E", text: "None of the above" },
    ],
    correct: "A",
  },
  {
    id: 5,
    topic: "C Operators",
    question:
      "What is the output here? (Note: this expression modifies the same variable more than once " +
      "without a sequence point in between, which is technically undefined behavior in C — most " +
      "compilers, including GCC, produce the result below, but don't rely on this pattern in real code.)",
    code:
`#include <stdio.h>

int main() {
    int counting_num = 5;
    int result = ++counting_num + counting_num++ - --counting_num;
    printf("The result is: %d\\n", result);
    return 0;
}`,
    options: [
      { key: "A", text: "The result is 8" },
      { key: "B", text: "The result is 9" },
      { key: "C", text: "The result is 6" },
      { key: "D", text: "The result is 7" },
      { key: "E", text: "None of the above" },
    ],
    correct: "D",
  },
  {
    id: 6,
    topic: "Control Flow",
    question: "What is the expected output here? (switch statement, no break statements)",
    code:
`#include <stdio.h>

int main() {
    int day = 2;
    switch (day) {
        case 1:
            printf("First day\\n");
        case 2:
            printf("Second day\\n");
        case 3:
            printf("Third day\\n");
        case 4:
            printf("Fourth day\\n");
        default:
            printf("Invalid day\\n");
    }
    return 0;
}`,
    options: [
      { key: "A", text: "Second day" },
      { key: "B", text: "Second day\nThird day\nFourth day" },
      { key: "C", text: "Second day\nThird day\nFourth day\nInvalid day" },
      { key: "D", text: "Invalid day" },
      { key: "E", text: "None of the above" },
    ],
    correct: "C",
  },
  {
    id: 7,
    topic: "Control Flow",
    question: "What is the expected output here? (same as above, but with break statements)",
    code:
`#include <stdio.h>

int main() {
    int day = 1;
    switch (day) {
        case 1:
            printf("First day\\n");
            break;
        case 2:
            printf("Second day\\n");
            break;
        case 3:
            printf("Third day\\n");
            break;
        case 4:
            printf("Fourth day\\n");
            break;
        default:
            printf("Invalid day\\n");
    }
    return 0;
}`,
    options: [
      { key: "A", text: "First day\nSecond day\nThird day\nFourth day\nInvalid day" },
      { key: "B", text: "First day" },
      { key: "C", text: "First day\nSecond day\nThird day\nFourth day" },
      { key: "D", text: "None of the above" },
    ],
    correct: "B",
  },
  {
    id: 8,
    topic: "Memory & Data",
    question: 'How is the string "Hi" stored in memory?',
    options: [
      { key: "A", text: 'As letters "H" and "i"' },
      { key: "B", text: 'As two numbers: 72 for "H" and 105 for "i"' },
      { key: "C", text: "As a single number like 7205" },
      { key: "D", text: "As a sequence of pixels showing the shapes of the letters" },
      { key: "E", text: "None of the above" },
    ],
    correct: "B",
  },
  {
    id: 9,
    topic: "Memory & Data",
    question: "What is the difference between storing a char '5' and an int 5?",
    options: [
      { key: "A", text: "They are stored the same way, no difference." },
      { key: "B", text: "char '5' is stored as 53 and int 5 is stored as binary 5" },
      { key: "C", text: "char '5' is stored as a single byte and int 5 is stored as multiple bytes" },
      { key: "D", text: "char '5' is stored as 5 and int 5 is stored as 53" },
      { key: "E", text: "B and C" },
      { key: "F", text: "None of the above" },
    ],
    correct: "E",
  },
  {
    id: 10,
    topic: "Arrays & Memory",
    question: "What is the expected output for the following code?",
    code:
`#include <stdio.h>

int main() {
    int digits[] = { 9, 26, 51, 12, 145, 78, 95 };
    printf("Size of the digits: %zu bytes\\n", sizeof(digits));
    printf("Size of an element: %zu bytes\\n", sizeof(digits[3]));
    return 0;
}`,
    options: [
      { key: "A", text: "Size of the entire array: 28 bytes\nSize of an element: 4 bytes" },
      { key: "B", text: "Size of the entire array: 7 bytes\nSize of an element: 1 bytes" },
      { key: "C", text: "Size of the entire array: 14 bytes\nSize of an element: 2 bytes" },
      { key: "D", text: "Size of the entire array: 28 bytes\nSize of an element: 1 bytes" },
      { key: "E", text: "Compilation error" },
      { key: "F", text: "None of the above" },
    ],
    correct: "A",
  },
  {
    id: 11,
    topic: "C Fundamentals",
    question: "In C, which of the following number(s) equal false in Boolean?",
    options: [
      { key: "A", text: "0" },
      { key: "B", text: "-1" },
      { key: "C", text: "0 and -1" },
      { key: "D", text: "Any non-zero number" },
      { key: "E", text: "Infinite numbers" },
      { key: "F", text: "None of the above" },
    ],
    correct: "A",
  },
  {
    id: 12,
    topic: "Function Parameters",
    question: "What will be the output of the following code?",
    code:
`#include <stdio.h>

void calculating_numbers(int first_value, int second_value) {
    printf("%d", first_value - second_value);
}

int main() {
    int first_value = 30;
    int second_value = 9;
    calculating_numbers(second_value, first_value);
    return 0;
}`,
    options: [
      { key: "A", text: "21" },
      { key: "B", text: "-21" },
      { key: "C", text: "Undefined behaviour" },
      { key: "D", text: "39" },
      { key: "E", text: "30" },
      { key: "F", text: "Compilation error" },
    ],
    correct: "B",
  },
  {
    id: 13,
    topic: "Pointers",
    question: "What is the output of the following code?",
    code:
`#include <stdio.h>

int main() {
    int array[] = { 678, 88, 94, 80, 13, 33 };
    int* pointer = array;
    pointer = pointer + 3;
    printf("%d\\n", *(pointer - 2));
    return 0;
}`,
    options: [
      { key: "A", text: "678" },
      { key: "B", text: "94" },
      { key: "C", text: "80" },
      { key: "D", text: "33" },
      { key: "E", text: "13" },
      { key: "F", text: "88" },
      { key: "G", text: "Compilation error" },
      { key: "H", text: "Undefined behaviour" },
    ],
    correct: "F",
  },
  {
    id: 14,
    topic: "Embedded Fundamentals",
    question: "Which of the following are embedded systems? Select all that apply.",
    options: [
      { key: "A", text: "Digital multimeter" },
      { key: "B", text: "Desktop computer running Windows" },
      { key: "C", text: "Microwave oven" },
      { key: "D", text: "Smart thermostat" },
      { key: "E", text: "A microcontroller with custom firmware controlling a motor" },
      { key: "F", text: "A web server running on a cloud VM" },
      { key: "G", text: "A PC running a single-purpose program" },
    ],
    correct: ["A", "C", "D", "E"],
  },
];
