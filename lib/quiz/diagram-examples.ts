import type { Quiz, QuizQuestion } from "./types";
import { diagramForQuestion } from "./diagrams";

/**
 * Hand-checked examples for the diagram preview.
 * These are not produced by the quiz model. Each picture is attached only
 * after `diagramForQuestion` agrees with the stem and the answer.
 */
const RAW_EXAMPLES: QuizQuestion[] = [
  {
    id: "ex-frac-bar",
    type: "mc",
    prompt: {
      zh: "下圖的長方形分成相等的部分。着色部分佔全部的幾分之幾？",
      en: "The rectangle below is split into equal parts. What fraction of the whole is shaded?",
    },
    choices: ["1/4", "1/2", "3/4", "1/3"],
    answer: "1/4",
    explanation: {
      zh: "長方形分成 4 等份，着色 1 份，所以是 1/4。",
      en: "The rectangle has 4 equal parts and 1 is shaded, so the fraction is 1/4.",
    },
    diagram: {
      kind: "shaded-fraction",
      shape: "bar",
      parts: 4,
      shaded: 1,
      target: "shaded",
    },
  },
  {
    id: "ex-frac-circle",
    type: "fill",
    prompt: {
      zh: "下圖的圓形分成相等的扇形。着色部分佔整個圓的幾分之幾？請約成最簡分數。",
      en: "The circle below is split into equal sectors. What fraction of the whole circle is shaded? Give the fraction in lowest terms.",
    },
    answer: "1/3",
    accepts: ["1/3", "1 / 3"],
    explanation: {
      zh: "6 個相等扇形中有 2 個着色，即 2/6，約成 1/3。",
      en: "2 of the 6 equal sectors are shaded. 2/6 simplifies to 1/3.",
    },
    diagram: {
      kind: "shaded-fraction",
      shape: "circle",
      parts: 6,
      shaded: 2,
      target: "shaded",
    },
  },
  {
    id: "ex-frac-grid",
    type: "number",
    prompt: {
      zh: "下圖每格大小相同。沒有着色的部分佔全部的幾分之幾？請用最簡分數作答。",
      en: "Every cell below is the same size. What fraction of the whole grid is not shaded? Give the fraction in lowest terms.",
    },
    answer: "7/12",
    explanation: {
      zh: "一共 3 × 4 = 12 格，着色 5 格，空白有 12 − 5 = 7 格，最簡分數是 7/12。",
      en: "There are 3 × 4 = 12 cells and 5 are shaded, so 7 are blank. 7/12 is already in lowest terms.",
    },
    diagram: {
      kind: "shaded-fraction",
      shape: "grid",
      rows: 3,
      cols: 4,
      parts: 12,
      shaded: 5,
      target: "unshaded",
    },
  },
  {
    id: "ex-area-l",
    type: "number",
    prompt: {
      zh: "下圖的單位是厘米。求圖形的面積。（以平方厘米為單位，只填數字。）",
      en: "The lengths below are in cm. Find the area of the figure. Give the number only, in square centimetres.",
    },
    answer: "81",
    explanation: {
      zh: "先看成 12 × 8 的長方形，再減去右上角 5 × 3 的空位。12 × 8 − 5 × 3 = 96 − 15 = 81。",
      en: "Take the 12 × 8 rectangle, then subtract the 5 × 3 corner. 12 × 8 − 5 × 3 = 96 − 15 = 81.",
    },
    diagram: {
      kind: "composite-area",
      template: "l-shape",
      unit: "cm",
      width: 12,
      height: 8,
      cutWidth: 5,
      cutHeight: 3,
      cutCorner: "top-right",
    },
  },
  {
    id: "ex-area-step",
    type: "number",
    prompt: {
      zh: "下圖由兩個長方形拼成，單位是厘米。求圖形的面積。（以平方厘米為單位，只填數字。）",
      en: "The figure below is two rectangles joined together. Lengths are in cm. Find the area. Give the number only, in square centimetres.",
    },
    answer: "86",
    explanation: {
      zh: "左面長方形是 6 × 9 = 54，右面長方形是 8 × 4 = 32，合計 54 + 32 = 86。",
      en: "The left rectangle is 6 × 9 = 54 and the right one is 8 × 4 = 32. 54 + 32 = 86.",
    },
    diagram: {
      kind: "composite-area",
      template: "step",
      unit: "cm",
      leftWidth: 6,
      rightWidth: 8,
      height: 9,
      rightHeight: 4,
    },
  },
  {
    id: "ex-area-l-stem",
    type: "number",
    prompt: {
      zh: "下圖原是長 10 厘米、闊 8 厘米的長方形，右上角剪去橫向 4 厘米、縱向 3 厘米的小長方形。求餘下圖形的面積。（以平方厘米為單位，只填數字。）",
      en: "The figure started as a 10 cm by 8 cm rectangle. A 4 cm by 3 cm rectangle was cut from the top-right corner. Find the area that remains. Give the number only, in square centimetres.",
    },
    answer: "68",
    explanation: {
      zh: "原長方形面積是 10 × 8 = 80，剪去 4 × 3 = 12，餘下 80 − 12 = 68。",
      en: "The original rectangle is 10 × 8 = 80. The cut-out is 4 × 3 = 12, so 80 − 12 = 68 remains.",
    },
    diagram: {
      kind: "composite-area",
      template: "l-shape",
      unit: "cm",
      width: 10,
      height: 8,
      cutWidth: 4,
      cutHeight: 3,
      cutCorner: "top-right",
    },
  },
  {
    id: "ex-area-metres",
    type: "number",
    prompt: {
      zh: "下圖的單位是米。求圖形的面積。（以平方米為單位，只填數字。）",
      en: "The lengths below are in m. Find the area of the figure. Give the number only, in square metres.",
    },
    answer: "48",
    explanation: {
      zh: "外圍是 10 × 6 的長方形，右上角缺去 4 × 3。10 × 6 − 4 × 3 = 60 − 12 = 48。",
      en: "The outer rectangle is 10 × 6 and the top-right gap is 4 × 3. 10 × 6 − 4 × 3 = 60 − 12 = 48.",
    },
    diagram: {
      kind: "composite-area",
      template: "l-shape",
      unit: "m",
      width: 10,
      height: 6,
      cutWidth: 4,
      cutHeight: 3,
      cutCorner: "top-right",
    },
  },
];

function checkedExample(question: QuizQuestion): QuizQuestion {
  const diagram = diagramForQuestion(question.diagram, question);
  if (!diagram) {
    throw new Error(`Diagram example ${question.id} does not match its stem and answer`);
  }
  return { ...question, diagram };
}

export const DIAGRAM_EXAMPLES: QuizQuestion[] = RAW_EXAMPLES.map(checkedExample);

export function diagramPreviewQuiz(): Quiz {
  return {
    id: "preview-diagrams",
    subject: "maths",
    topic: "fractions",
    year: "P5",
    seed: 1,
    questions: DIAGRAM_EXAMPLES,
  };
}
