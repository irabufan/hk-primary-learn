import { both } from "@/lib/i18n/types";
import { mathsBasicsBank } from "./maths-basics";
import type { ExerciseBank } from "./types";

/**
 * Maths content — bilingual labels (zh + en): prompts and explanations are
 * provided in both UI languages. Answers are plain numbers or bare number
 * strings so choices stay language-independent.
 */
export const mathsBank: ExerciseBank = {
  ...mathsBasicsBank,
  fractions: [

    {
      kind: "number",
      id: "m-f-ks1-1",
      prompt: { zh: "把 10 顆糖平均分給 2 人，每人得多少顆？", en: "Share 10 sweets equally between 2 children. How many each?" },
      answer: 5,
      explanation: { zh: "10 ÷ 2 = 5。", en: "10 ÷ 2 = 5." },
      years: ["P2", "P3"],
    },
    {
      kind: "number",
      id: "m-f-ks1-2",
      prompt: { zh: "8 的一半是多少？", en: "What is half of 8?" },
      answer: 4,
      explanation: { zh: "8 ÷ 2 = 4。", en: "8 ÷ 2 = 4." },
      years: ["P2", "P3"],
    },
    {
      kind: "number",
      id: "m-f-ks1-3",
      prompt: { zh: "12 的四分之一是多少？", en: "What is one quarter of 12?" },
      answer: 3,
      explanation: { zh: "12 ÷ 4 = 3。", en: "12 ÷ 4 = 3." },
      years: ["P2", "P3"],
    },
    {
      kind: "number",
      id: "m-f1",
      prompt: { zh: "20 的 1/2 是多少？", en: "What is 1/2 of 20?" },
      answer: 10,
      explanation: { zh: "20 ÷ 2 = 10，所以 20 的 1/2 是 10。", en: "20 ÷ 2 = 10, so 1/2 of 20 is 10." },
      years: ["P3", "P4"],
    },
    {
      kind: "number",
      id: "m-f2",
      prompt: { zh: "24 的 1/3 是多少？", en: "What is 1/3 of 24?" },
      answer: 8,
      explanation: { zh: "24 ÷ 3 = 8，所以 24 的 1/3 是 8。", en: "24 ÷ 3 = 8, so 1/3 of 24 is 8." },
      years: ["P3", "P4"],
    },
    {
      kind: "number",
      id: "m-f3",
      prompt: { zh: "35 的 1/5 是多少？", en: "What is 1/5 of 35?" },
      answer: 7,
      explanation: { zh: "35 ÷ 5 = 7，所以 35 的 1/5 是 7。", en: "35 ÷ 5 = 7, so 1/5 of 35 is 7." },
      years: ["P4"],
    },
    {
      kind: "fill",
      id: "m-f4",
      prompt: {
        zh: "把 4/8 約至最簡分數。",
        en: "Simplify 4/8 to lowest terms.",
      },
      accept: ["1/2", "1 / 2"],
      explanation: {
        zh: "4/8 分子分母同時除以 4，得 1/2。",
        en: "Divide top and bottom by 4: 4/8 = 1/2.",
      },
      years: ["P5"],
    },
    {
      kind: "fill",
      id: "m-f5",
      prompt: {
        zh: "把 6/9 約至最簡分數。",
        en: "Simplify 6/9 to lowest terms.",
      },
      accept: ["2/3", "2 / 3"],
      explanation: {
        zh: "6/9 分子分母同時除以 3，得 2/3。",
        en: "Divide top and bottom by 3: 6/9 = 2/3.",
      },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-f6",
      prompt: { zh: "把 3/4 化為小數。", en: "Write 3/4 as a decimal." },
      answer: 0.75,
      explanation: { zh: "3 ÷ 4 = 0.75，所以 3/4 = 0.75。", en: "3 ÷ 4 = 0.75, so 3/4 = 0.75." },
      years: ["P6"],
    },
    {
      kind: "number",
      id: "m-f7",
      prompt: { zh: "40 的 3/4 是多少？", en: "What is 3/4 of 40?" },
      answer: 30,
      explanation: { zh: "40 ÷ 4 = 10，再 × 3 = 30。", en: "40 ÷ 4 = 10, then × 3 = 30." },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-f8",
      prompt: { zh: "18 的 5/6 是多少？", en: "What is 5/6 of 18?" },
      answer: 15,
      explanation: { zh: "18 ÷ 6 = 3，再 × 5 = 15。", en: "18 ÷ 6 = 3, then × 5 = 15." },
      years: ["P6"],
    },
    {
      kind: "number",
      id: "m-f9",
      prompt: { zh: "把 2/5 化為小數。", en: "Write 2/5 as a decimal." },
      answer: 0.4,
      explanation: { zh: "2 ÷ 5 = 0.4，所以 2/5 = 0.4。", en: "2 ÷ 5 = 0.4, so 2/5 = 0.4." },
      years: ["P6"],
    },
    {
      kind: "number",
      id: "m-f10",
      prompt: {
        zh: "1/2 + 1/4 = ？（以小數作答）",
        en: "Work out 1/2 + 1/4. Give your answer as a decimal.",
      },
      answer: 0.75,
      explanation: {
        zh: "1/2 = 0.5，1/4 = 0.25，0.5 + 0.25 = 0.75。",
        en: "1/2 = 0.5 and 1/4 = 0.25, so 0.5 + 0.25 = 0.75.",
      },
      years: ["P6"],
    },

    {
      kind: "fill",
      id: "m-f-unlike-1",
      prompt: {
        zh: "比較 2/3 和 3/5，哪一個較大？寫出較大的分數。",
        en: "Compare 2/3 and 3/5. Write the larger fraction.",
      },
      accept: ["2/3", "2 / 3"],
      explanation: {
        zh: "通分：2/3 = 10/15，3/5 = 9/15，所以 2/3 較大。",
        en: "Common denominator: 2/3 = 10/15, 3/5 = 9/15, so 2/3 is larger.",
      },
      years: ["P5"],
    },
    {
      kind: "fill",
      id: "m-f-unlike-2",
      prompt: {
        zh: "計算 1/2 + 1/3，答案以最簡分數表示。",
        en: "Work out 1/2 + 1/3. Give the answer in lowest terms.",
      },
      accept: ["5/6", "5 / 6"],
      explanation: {
        zh: "通分：1/2 = 3/6，1/3 = 2/6，3/6 + 2/6 = 5/6。",
        en: "1/2 = 3/6 and 1/3 = 2/6, so 3/6 + 2/6 = 5/6.",
      },
      years: ["P5"],
    },
    {
      kind: "fill",
      id: "m-f-unlike-3",
      prompt: {
        zh: "計算 5/6 − 1/4，答案以最簡分數表示。",
        en: "Work out 5/6 − 1/4. Give the answer in lowest terms.",
      },
      accept: ["7/12", "7 / 12"],
      explanation: {
        zh: "通分：5/6 = 10/12，1/4 = 3/12，10/12 − 3/12 = 7/12。",
        en: "5/6 = 10/12 and 1/4 = 3/12, so 10/12 − 3/12 = 7/12.",
      },
      years: ["P5"],
    },
    {
      kind: "fill",
      id: "m-f-unlike-4",
      prompt: {
        zh: "計算 1/4 + 2/5，答案以最簡分數表示。",
        en: "Work out 1/4 + 2/5. Give the answer in lowest terms.",
      },
      accept: ["13/20", "13 / 20"],
      explanation: {
        zh: "通分：1/4 = 5/20，2/5 = 8/20，5/20 + 8/20 = 13/20。",
        en: "1/4 = 5/20 and 2/5 = 8/20, so 5/20 + 8/20 = 13/20.",
      },
      years: ["P5"],
    },
  ],

  decimals: [

    {
      kind: "number",
      id: "m-d1",
      prompt: both("0.5 + 0.25 = ?"),
      answer: 0.75,
      explanation: { zh: "對齊小數點：0.5 + 0.25 = 0.75。", en: "Line up the decimal points: 0.5 + 0.25 = 0.75." },
      years: ["P4"],
    },
    {
      kind: "number",
      id: "m-d2",
      prompt: both("1.6 − 0.8 = ?"),
      answer: 0.8,
      explanation: { zh: "1.6 − 0.8 = 0.8。", en: "1.6 − 0.8 = 0.8." },
      years: ["P4"],
    },
    {
      kind: "number",
      id: "m-d3",
      prompt: both("2.5 × 4 = ?"),
      answer: 10,
      explanation: { zh: "2.5 × 4 = 10。", en: "2.5 × 4 = 10." },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-d4",
      prompt: both("0.3 × 0.2 = ?"),
      answer: 0.06,
      explanation: {
        zh: "0.3 × 0.2 = 0.06（3 × 2 = 6，再點回兩個小數位）。",
        en: "0.3 × 0.2 = 0.06 (3 × 2 = 6, then count two decimal places).",
      },
      years: ["P6"],
    },
    {
      kind: "number",
      id: "m-d5",
      prompt: both("7.2 ÷ 9 = ?"),
      answer: 0.8,
      explanation: { zh: "7.2 ÷ 9 = 0.8。", en: "7.2 ÷ 9 = 0.8." },
      years: ["P5", "P6"],
    },
    {
      kind: "number",
      id: "m-d6",
      prompt: { zh: "把 3/5 化為小數。", en: "Write 3/5 as a decimal." },
      answer: 0.6,
      explanation: { zh: "3 ÷ 5 = 0.6，所以 3/5 = 0.6。", en: "3 ÷ 5 = 0.6, so 3/5 = 0.6." },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-d7",
      prompt: both("4.25 + 2.75 = ?"),
      answer: 7,
      explanation: { zh: "4.25 + 2.75 = 7。", en: "4.25 + 2.75 = 7." },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-d8",
      prompt: both("10 − 3.45 = ?"),
      answer: 6.55,
      explanation: { zh: "10 − 3.45 = 6.55。", en: "10 − 3.45 = 6.55." },
      years: ["P6"],
    },
    {
      kind: "number",
      id: "m-d9",
      prompt: both("0.1 + 0.02 = ?"),
      answer: 0.12,
      explanation: { zh: "0.1 + 0.02 = 0.12。", en: "0.1 + 0.02 = 0.12." },
      years: ["P3", "P4"],
    },
    {
      kind: "number",
      id: "m-d10",
      prompt: { zh: "把 25/100 化為小數。", en: "Write 25/100 as a decimal." },
      answer: 0.25,
      explanation: { zh: "25 ÷ 100 = 0.25，所以 25/100 = 0.25。", en: "25 ÷ 100 = 0.25, so 25/100 = 0.25." },
      years: ["P4", "P5"],
    },
  ],


  area: [
    {
      kind: "number",
      id: "m-a-rect-1",
      prompt: {
        zh: "長方形的長是 8 厘米，闊是 5 厘米，面積是多少平方厘米？",
        en: "A rectangle is 8 cm long and 5 cm wide. What is its area in square centimetres?",
      },
      answer: 40,
      explanation: { zh: "長 × 闊：8 × 5 = 40。", en: "Length × width: 8 × 5 = 40." },
      years: ["P4", "P5"],
    },
    {
      kind: "number",
      id: "m-a-para-1",
      prompt: {
        zh: "一個平行四邊形的底是 9 厘米，高是 4 厘米，面積是多少平方厘米？",
        en: "A parallelogram has base 9 cm and height 4 cm. What is its area in square centimetres?",
      },
      answer: 36,
      explanation: { zh: "平行四邊形面積 = 底 × 高：9 × 4 = 36。", en: "Area = base × height: 9 × 4 = 36." },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-a-tri-1",
      prompt: {
        zh: "一個三角形的底是 10 厘米，高是 6 厘米，面積是多少平方厘米？",
        en: "A triangle has base 10 cm and height 6 cm. What is its area in square centimetres?",
      },
      answer: 30,
      explanation: { zh: "三角形面積 = 底 × 高 ÷ 2：10 × 6 ÷ 2 = 30。", en: "Area = base × height ÷ 2: 10 × 6 ÷ 2 = 30." },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-a-trap-1",
      prompt: {
        zh: "一個梯形的上底是 5 厘米，下底是 9 厘米，高是 4 厘米，面積是多少平方厘米？",
        en: "A trapezium has parallel sides 5 cm and 9 cm, and height 4 cm. What is its area in square centimetres?",
      },
      answer: 28,
      explanation: {
        zh: "梯形面積 =（上底＋下底）× 高 ÷ 2：（5＋9）× 4 ÷ 2 = 28。",
        en: "Area = (a + b) × height ÷ 2: (5 + 9) × 4 ÷ 2 = 28.",
      },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-a-para-2",
      prompt: {
        zh: "一個平行四邊形的底是 12 厘米，高是 5 厘米，面積是多少平方厘米？",
        en: "A parallelogram has base 12 cm and height 5 cm. Area in cm²?",
      },
      answer: 60,
      explanation: { zh: "12 × 5 = 60。", en: "12 × 5 = 60." },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-a-tri-2",
      prompt: {
        zh: "一個三角形的底是 8 厘米，高是 7 厘米，面積是多少平方厘米？",
        en: "A triangle has base 8 cm and height 7 cm. Area in cm²?",
      },
      answer: 28,
      explanation: { zh: "8 × 7 ÷ 2 = 28。", en: "8 × 7 ÷ 2 = 28." },
      years: ["P5"],
    },
  ],

  "area-polygons": [
    {
      kind: "number",
      id: "m-ap-1",
      prompt: {
        zh: "一塊多邊形由一個底 8 厘米、高 5 厘米的平行四邊形和一個底 8 厘米、高 3 厘米的三角形拼成。整塊多邊形的面積是多少平方厘米？",
        en: "A polygon is made of a parallelogram (base 8 cm, height 5 cm) joined to a triangle (base 8 cm, height 3 cm). What is the total area in square centimetres?",
      },
      answer: 52,
      explanation: {
        zh: "分割：平行四邊形 8×5=40，三角形 8×3÷2=12，合共 40+12=52。",
        en: "Split: parallelogram 8×5=40, triangle 8×3÷2=12, total 52.",
      },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-ap-2",
      prompt: {
        zh: "一塊多邊形由一個長 10 厘米、闊 6 厘米的長方形和一個底 10 厘米、高 4 厘米的三角形拼成。面積是多少平方厘米？",
        en: "A polygon is a rectangle 10 cm by 6 cm joined to a triangle with base 10 cm and height 4 cm. Total area in cm²?",
      },
      answer: 80,
      explanation: {
        zh: "長方形 10×6=60，三角形 10×4÷2=20，合共 80。",
        en: "Rectangle 60 + triangle 20 = 80.",
      },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-ap-3",
      prompt: {
        zh: "一個大正方形邊長 10 厘米，從一角剪去一個底 4 厘米、高 3 厘米的直角三角形。剩下圖形的面積是多少平方厘米？",
        en: "A large square has side 10 cm. A right-angled triangle with base 4 cm and height 3 cm is cut from one corner. Area of the remaining shape in cm²?",
      },
      answer: 94,
      explanation: {
        zh: "填補／減去：正方形 10×10=100，三角形 4×3÷2=6，100−6=94。",
        en: "Square 100 − triangle 6 = 94.",
      },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-ap-4",
      prompt: {
        zh: "一塊多邊形由一個上底 3 厘米、下底 7 厘米、高 4 厘米的梯形和一個底 7 厘米、高 2 厘米的平行四邊形拼成。面積是多少平方厘米？",
        en: "A polygon is a trapezium (parallel sides 3 cm and 7 cm, height 4 cm) joined to a parallelogram (base 7 cm, height 2 cm). Total area in cm²?",
      },
      answer: 34,
      explanation: {
        zh: "梯形 (3+7)×4÷2=20，平行四邊形 7×2=14，合共 34。",
        en: "Trapezium 20 + parallelogram 14 = 34.",
      },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-ap-5",
      prompt: {
        zh: "一塊多邊形分割成兩個三角形：第一個底 6 厘米、高 4 厘米；第二個底 6 厘米、高 8 厘米。整塊面積是多少平方厘米？",
        en: "A polygon splits into two triangles: bases 6 cm and 6 cm, heights 4 cm and 8 cm. Total area in cm²?",
      },
      answer: 36,
      explanation: {
        zh: "6×4÷2=12，6×8÷2=24，合共 36。",
        en: "12 + 24 = 36.",
      },
      years: ["P5"],
    },
    {
      kind: "number",
      id: "m-ap-6",
      prompt: {
        zh: "一個長 12 厘米、闊 8 厘米的長方形，中間挖去一個底 4 厘米、高 3 厘米的平行四邊形孔。剩下部分面積是多少平方厘米？",
        en: "A 12 cm by 8 cm rectangle has a parallelogram hole (base 4 cm, height 3 cm) cut out. Remaining area in cm²?",
      },
      answer: 84,
      explanation: {
        zh: "長方形 12×8=96，孔 4×3=12，96−12=84。",
        en: "96 − 12 = 84.",
      },
      years: ["P5"],
    },
  ],

  "word-problems": [
    {
      kind: "mc",
      id: "m-w-p1-1",
      prompt: { zh: "樹上有 6 隻鳥，再飛來 3 隻，共有多少隻？", en: "6 birds are in a tree. 3 more come. How many birds now?" },
      choices: ["8", "9", "3", "10"],
      answerIndex: 1,
      explanation: { zh: "6 + 3 = 9。", en: "6 + 3 = 9." },
      years: ["P1"],
    },
    {
      kind: "mc",
      id: "m-w-p1-2",
      prompt: { zh: "小美有 10 粒波子，送了 4 粒給弟弟，還剩多少粒？", en: "May has 10 marbles and gives 4 to her brother. How many are left?" },
      choices: ["14", "5", "6", "4"],
      answerIndex: 2,
      explanation: { zh: "10 − 4 = 6。", en: "10 − 4 = 6." },
      years: ["P1"],
    },
    {
      kind: "mc",
      id: "m-w-p1-3",
      prompt: { zh: "籃子裏有 7 個蘋果和 5 個橙，共有多少個水果？", en: "A basket has 7 apples and 5 oranges. How many fruits altogether?" },
      choices: ["12", "2", "11", "13"],
      answerIndex: 0,
      explanation: { zh: "7 + 5 = 12。", en: "7 + 5 = 12." },
      years: ["P1"],
    },

    {
      kind: "mc",
      id: "m-w-ks1-1",
      prompt: {
        zh: "一支鉛筆售 3 元。小美買了 2 支，共要付多少元？",
        en: "A pencil costs $3. May buys 2. How much does she pay?",
      },
      choices: ["5", "6", "7", "3"],
      answerIndex: 1,
      explanation: { zh: "3 × 2 = 6（元）。", en: "3 × 2 = $6." },
      years: ["P2", "P3"],
    },
    {
      kind: "mc",
      id: "m-w-ks1-2",
      prompt: {
        zh: "小華有 12 顆朱古力，吃了 4 顆，還剩多少顆？",
        en: "Wah has 12 chocolates and eats 4. How many are left?",
      },
      choices: ["8", "16", "4", "10"],
      answerIndex: 0,
      explanation: { zh: "12 − 4 = 8。", en: "12 − 4 = 8." },
      years: ["P1", "P2", "P3"],
    },
    {
      kind: "mc",
      id: "m-w-ks1-3",
      prompt: {
        zh: "一盒有 5 支蠟筆，3 盒共有多少支？",
        en: "A box has 5 crayons. How many in 3 boxes?",
      },
      choices: ["8", "15", "10", "20"],
      answerIndex: 1,
      explanation: { zh: "5 × 3 = 15。", en: "5 × 3 = 15." },
      years: ["P2", "P3"],
    },
    {
      kind: "mc",
      id: "m-w1",
      prompt: {
        zh: "一本故事書售 48 元。媽媽買了 3 本，共要付多少元？",
        en: "A storybook costs $48. Mum buys 3 of them. How much does she pay altogether?",
      },
      choices: ["144", "96", "51", "132"],
      answerIndex: 0,
      explanation: { zh: "每本 48 元：48 × 3 = 144（元）。", en: "$48 each, 3 books: 48 × 3 = 144." },
      years: ["P4", "P5"],
    },
    {
      kind: "mc",
      id: "m-w2",
      prompt: {
        zh: "小明有 56 顆糖果，平均分給 7 位朋友，每人可得多少顆？",
        en: "Ming has 56 sweets and shares them equally among 7 friends. How many does each friend get?",
      },
      choices: ["9", "8", "7", "6"],
      answerIndex: 1,
      explanation: { zh: "56 ÷ 7 = 8，每人得 8 顆。", en: "56 ÷ 7 = 8 sweets each." },
      years: ["P2", "P3", "P4"],
    },
    {
      kind: "mc",
      id: "m-w3",
      prompt: {
        zh: "一盒筆有 12 支，5 盒共有多少支筆？",
        en: "A box holds 12 pens. How many pens are there in 5 boxes?",
      },
      choices: ["48", "72", "60", "17"],
      answerIndex: 2,
      explanation: { zh: "12 × 5 = 60（支）。", en: "12 × 5 = 60 pens." },
      years: ["P2", "P3", "P4"],
    },
    {
      kind: "mc",
      id: "m-w4",
      prompt: {
        zh: "巴士上有 45 人。到了下一站，18 人下車，12 人上車，現在車上有多少人？",
        en: "There are 45 people on a bus. At the next stop, 18 people get off and 12 people get on. How many people are on the bus now?",
      },
      choices: ["27", "39", "33", "51"],
      answerIndex: 1,
      explanation: { zh: "45 − 18 = 27，27 + 12 = 39。", en: "45 − 18 = 27, then 27 + 12 = 39." },
      years: ["P5"],
    },
    {
      kind: "mc",
      id: "m-w5",
      prompt: {
        zh: "長方形的長是 8 厘米，闊是 5 厘米，面積是多少平方厘米？",
        en: "A rectangle is 8 cm long and 5 cm wide. What is its area in square centimetres?",
      },
      choices: ["26", "13", "40", "24"],
      answerIndex: 2,
      explanation: {
        zh: "長方形面積 = 長 × 闊：8 × 5 = 40（平方厘米）。",
        en: "Area = length × width: 8 × 5 = 40 cm².",
      },
      years: ["P4", "P5"],
    },
    {
      kind: "mc",
      id: "m-w6",
      prompt: {
        zh: "一枝筆售 8.5 元，買 4 枝共要多少元？",
        en: "A pen costs $8.5. How much do 4 pens cost?",
      },
      choices: ["32", "34", "36", "30"],
      answerIndex: 1,
      explanation: { zh: "8.5 × 4 = 34（元）。", en: "8.5 × 4 = $34." },
      years: ["P5", "P6"],
    },
    {
      kind: "mc",
      id: "m-w7",
      prompt: {
        zh: "Jane 有 90 元，買了一個 27 元的文具盒後，還剩多少元？",
        en: "Jane has $90. After buying a pencil case for $27, how much money is left?",
      },
      choices: ["67", "73", "117", "63"],
      answerIndex: 3,
      explanation: { zh: "90 − 27 = 63（元）。", en: "90 − 27 = $63." },
      years: ["P2", "P3", "P4"],
    },
    {
      kind: "mc",
      id: "m-w8",
      prompt: {
        zh: "學校買了 6 排椅子，每排 14 張，共有多少張椅子？",
        en: "The school buys 6 rows of chairs with 14 chairs in each row. How many chairs are there?",
      },
      choices: ["78", "68", "84", "96"],
      answerIndex: 2,
      explanation: { zh: "6 × 14 = 84（張）。", en: "6 × 14 = 84 chairs." },
      years: ["P5"],
    },
    {
      kind: "mc",
      id: "m-w9",
      prompt: {
        zh: "水果店有 8 箱蘋果，每箱 15 個。賣出 30 個後，還剩多少個蘋果？",
        en: "A fruit shop has 8 boxes of apples with 15 apples in each box. After selling 30, how many apples are left?",
      },
      choices: ["120", "90", "60", "88"],
      answerIndex: 1,
      explanation: {
        zh: "先算總數：8 × 15 = 120，再減：120 − 30 = 90。",
        en: "First the total: 8 × 15 = 120, then 120 − 30 = 90.",
      },
      years: ["P6"],
    },
    {
      kind: "mc",
      id: "m-w10",
      prompt: {
        zh: "一包糖售 12.5 元，買 3 包共要多少元？",
        en: "A bag of sweets costs $12.5. How much do 3 bags cost?",
      },
      choices: ["37.5", "36.5", "40", "35.5"],
      answerIndex: 0,
      explanation: { zh: "12.5 × 3 = 37.5（元）。", en: "12.5 × 3 = $37.5." },
      years: ["P5", "P6"],
    },
  ],
};
