import type { Year } from "@/lib/curriculum";
import type { ExerciseBank, McItem, NumberItem } from "./types";

/**
 * Grade-specific maths banks for the P1–P3 topics (numbers, add/subtract,
 * multiply/divide, money/time, shapes) plus P6 percentages. Units follow the
 * EDB 2017 Supplement (1N1–3N5, 1M1–3M5, 1S1–3S2, 6N3–6N4).
 */

function num(id: string, years: Year[], zh: string, en: string, answer: number, why?: string): NumberItem {
  return {
    kind: "number",
    id,
    prompt: { zh, en },
    answer,
    ...(why ? { explanation: { zh: why, en: why } } : {}),
    years,
  };
}

function mc(id: string, years: Year[], zh: string, en: string, choices: string[], answerIndex: number): McItem {
  return { kind: "mc", id, prompt: { zh, en }, choices, answerIndex, years };
}

export const mathsBasicsBank: ExerciseBank = {
  numbers: [
    num("m-n-p1-1", ["P1"], "19 的下一個數是多少？", "What number comes after 19?", 20),
    num("m-n-p1-2", ["P1"], "10、20、30、＿＿，下一個是多少？", "10, 20, 30, __. What comes next?", 40),
    mc("m-n-p1-3", ["P1"], "哪一個數最大？", "Which number is the biggest?", ["38", "83", "58", "35"], 1),
    num("m-n-p1-4", ["P1"], "4 個十和 7 個一合起來是多少？", "4 tens and 7 ones make what number?", 47),
    mc("m-n-p1-5", ["P1"], "哪一個是雙數？", "Which one is an even number?", ["7", "12", "15", "9"], 1),
    num("m-n-p1-6", ["P1"], "比 50 少 1 的數是多少？", "What is 1 less than 50?", 49),
    num("m-n-p2-1", ["P2"], "3 個百、4 個十和 5 個一是多少？", "3 hundreds, 4 tens and 5 ones make what number?", 345),
    mc("m-n-p2-2", ["P2"], "哪一個數最大？", "Which number is the greatest?", ["456", "465", "546", "564"], 3),
    num("m-n-p2-3", ["P2"], "708 中的「7」代表多少？", "In 708, what is the value of the digit 7?", 700),
    num("m-n-p2-4", ["P2"], "250、300、350、＿＿，下一個是多少？", "250, 300, 350, __. What comes next?", 400),
    num("m-n-p2-5", ["P2"], "比 999 大 1 的數是多少？", "What is 1 more than 999?", 1000),
    mc("m-n-p2-6", ["P2"], "哪一個是正確的？", "Which one is correct?", ["302 > 320", "415 < 451", "690 > 960", "128 > 182"], 1),
  ],
  "add-subtract": [
    num("m-as-p1-1", ["P1"], "5 + 3 = ?", "5 + 3 = ?", 8),
    num("m-as-p1-2", ["P1"], "9 − 4 = ?", "9 − 4 = ?", 5),
    num("m-as-p1-3", ["P1"], "8 + 7 = ?", "8 + 7 = ?", 15),
    num("m-as-p1-4", ["P1"], "16 − 9 = ?", "16 − 9 = ?", 7),
    num("m-as-p1-5", ["P1"], "34 + 12 = ?", "34 + 12 = ?", 46),
    num("m-as-p1-6", ["P1"], "58 − 25 = ?", "58 − 25 = ?", 33),
    num("m-as-p1-7", ["P1"], "27 + 15 = ?", "27 + 15 = ?", 42),
    num("m-as-p2-1", ["P2"], "256 + 137 = ?", "256 + 137 = ?", 393),
    num("m-as-p2-2", ["P2"], "502 − 168 = ?", "502 − 168 = ?", 334),
    num("m-as-p2-3", ["P2"], "120 + 45 + 300 = ?", "120 + 45 + 300 = ?", 465),
    num("m-as-p2-4", ["P2"], "400 − 125 = ?", "400 − 125 = ?", 275),
    num("m-as-p2-5", ["P2"], "381 + 219 = ?", "381 + 219 = ?", 600),
    num("m-as-p3-1", ["P3"], "4682 + 1359 = ?", "4682 + 1359 = ?", 6041),
    num("m-as-p3-2", ["P3"], "7005 − 2348 = ?", "7005 − 2348 = ?", 4657),
    num("m-as-p3-3", ["P3"], "(36 − 12) + 18 = ?", "(36 − 12) + 18 = ?", 42),
    num("m-as-p3-4", ["P3"], "2500 + 1800 − 900 = ?", "2500 + 1800 − 900 = ?", 3400),
  ],
  "multiply-divide": [
    num("m-md-p2-1", ["P2"], "4 × 5 = ?", "4 × 5 = ?", 20),
    num("m-md-p2-2", ["P2"], "7 × 3 = ?", "7 × 3 = ?", 21),
    num("m-md-p2-3", ["P2"], "18 ÷ 3 = ?", "18 ÷ 3 = ?", 6),
    num("m-md-p2-4", ["P2"], "把 10 顆糖平均分給 2 人，每人得多少顆？", "Share 10 sweets equally between 2 children. How many each?", 5, "10 ÷ 2 = 5"),
    num("m-md-p2-5", ["P2"], "一盒有 6 個蛋，3 盒共有多少個？", "A box has 6 eggs. How many eggs in 3 boxes?", 18, "6 × 3 = 18"),
    num("m-md-p2-6", ["P2"], "20 個橙，每袋放 6 個，最多可放滿多少袋？", "20 oranges go into bags of 6. How many full bags?", 3, "20 ÷ 6 = 3 … 2"),
    num("m-md-p3-1", ["P3"], "23 × 4 = ?", "23 × 4 = ?", 92),
    num("m-md-p3-2", ["P3"], "96 ÷ 8 = ?", "96 ÷ 8 = ?", 12),
    num("m-md-p3-3", ["P3"], "(5 + 3) × 7 = ?", "(5 + 3) × 7 = ?", 56),
    num("m-md-p3-4", ["P3"], "84 ÷ 6 = ?", "84 ÷ 6 = ?", 14),
    num("m-md-p4-1", ["P4"], "36 × 25 = ?", "36 × 25 = ?", 900),
    num("m-md-p4-2", ["P4"], "432 ÷ 12 = ?", "432 ÷ 12 = ?", 36),
    mc("m-md-p4-3", ["P4"], "以下哪一個是 24 的因數？", "Which of these is a factor of 24?", ["5", "7", "8", "9"], 2),
    num("m-md-p4-4", ["P4"], "6 和 8 的最小公倍數是多少？", "What is the least common multiple of 6 and 8?", 24),
  ],
  "money-time": [
    num("m-mt-p1-1", ["P1"], "一個 $5 硬幣和兩個 $2 硬幣，共值多少元？", "One $5 coin and two $2 coins. How many dollars altogether?", 9),
    num("m-mt-p1-2", ["P1"], "一支筆 $3，一塊擦膠 $2，共要多少元？", "A pen is $3 and a rubber is $2. How many dollars altogether?", 5),
    num("m-mt-p1-3", ["P1"], "時針指着 3，分針指着 12。現在是幾時正？", "The hour hand points to 3 and the minute hand to 12. It is __ o'clock.", 3),
    num("m-mt-p1-4", ["P1"], "時針在 7 和 8 中間，分針指着 6。現在是幾時半？", "The hour hand is between 7 and 8, the minute hand points to 6. It is half past __.", 7),
    num("m-d-ks1-1", ["P1", "P2"], "樂樂有 15 元，花了 7 元，還剩多少元？", "Lucas has $15 and spends $7. How much is left?", 8, "15 − 7 = 8"),
    num("m-d-ks1-3", ["P1", "P2"], "媽媽給小明 10 元，爸爸再給他 5 元，一共有多少元？", "Mum gives Ming $10 and Dad gives him $5 more. How much altogether?", 15, "10 + 5 = 15"),
    num("m-mt-p2-1", ["P2"], "小明付了一張 $50 紙幣，買了一本 $36 的書，應找回多少元？", "Ming pays with a $50 note for a $36 book. How much change?", 14),
    num("m-mt-p2-2", ["P2"], "1 米等於多少厘米？", "1 metre = how many centimetres?", 100),
    num("m-mt-p2-3", ["P2"], "現在是 8:15，再過 30 分鐘是 8 時多少分？", "It is 8:15. In 30 minutes it will be 8:__.", 45),
    num("m-mt-p2-4", ["P2"], "一張 $20 紙幣和三個 $5 硬幣，共值多少元？", "One $20 note and three $5 coins. How many dollars altogether?", 35),
    num("m-mt-p3-1", ["P3"], "1 公里等於多少米？", "1 kilometre = how many metres?", 1000),
    num("m-mt-p3-2", ["P3"], "2 公斤等於多少克？", "2 kilograms = how many grams?", 2000),
    num("m-mt-p3-3", ["P3"], "下午 3 時，用 24 小時報時制是幾時？（只填數字）", "3 p.m. in 24-hour time is __:00.", 15),
    num("m-mt-p3-4", ["P3"], "一盒果汁有 250 毫升，4 盒共有多少毫升？", "A juice box holds 250 mL. How many mL in 4 boxes?", 1000),
  ],
  shapes: [
    num("m-sh-p1-1", ["P1"], "一個三角形有多少條邊？", "How many sides does a triangle have?", 3),
    num("m-sh-p1-2", ["P1"], "一個長方形有多少條邊？", "How many sides does a rectangle have?", 4),
    mc("m-sh-p1-3", ["P1"], "哪一個立體最容易滾動？", "Which solid rolls most easily?", ["球體 Sphere", "正方體 Cube", "角錐 Pyramid", "長方體 Cuboid"], 0),
    num("m-sh-p1-4", ["P1"], "一個圓形有多少條直的邊？", "How many straight sides does a circle have?", 0),
    mc("m-sh-p1-5", ["P1"], "汽水罐像哪一個立體？", "A drink can looks like which solid?", ["圓柱 Cylinder", "球體 Sphere", "圓錐 Cone", "正方體 Cube"], 0),
    num("m-sh-p2-1", ["P2"], "一個正方體有多少個面？", "How many faces does a cube have?", 6),
    num("m-sh-p2-2", ["P2"], "一個三角形有多少個角？", "How many angles does a triangle have?", 3),
    mc("m-sh-p2-3", ["P2"], "太陽在早上從哪個方向升起？", "In the morning the sun rises in the …", ["東 East", "南 South", "西 West", "北 North"], 0),
    num("m-sh-p2-4", ["P2"], "一個四邊形有多少條邊？", "How many sides does a quadrilateral have?", 4),
    num("m-sh-p3-1", ["P3"], "一個長方形有多少對平行線？", "How many pairs of parallel lines does a rectangle have?", 2),
    num("m-sh-p3-2", ["P3"], "等邊三角形每條邊長 5 厘米，三條邊共長多少厘米？", "Each side of an equilateral triangle is 5 cm. Total length of the 3 sides in cm?", 15),
    num("m-sh-p3-3", ["P3"], "一個直角三角形有多少個直角？", "How many right angles does a right-angled triangle have?", 1),
  ],
  percentages: [
    num("m-pc-p6-1", ["P6"], "0.35 = 百分之幾？（只填數字）", "0.35 = __ %", 35),
    num("m-pc-p6-2", ["P6"], "50 的 20% 是多少？", "What is 20% of 50?", 10),
    num("m-pc-p6-3", ["P6"], "30 是 50 的百分之幾？（只填數字）", "30 is what percentage of 50? (number only)", 60),
    num("m-pc-p6-4", ["P6"], "一個 $200 的書包打八折，售多少元？", "A $200 school bag is sold at 20% off. What is the price in dollars?", 160),
    num("m-pc-p6-5", ["P6"], "一件 $80 的 T 恤減價 25%，現售多少元？", "An $80 T-shirt is reduced by 25%. What is the new price in dollars?", 60),
    num("m-pc-p6-6", ["P6"], "3/4 = 百分之幾？（只填數字）", "3/4 = __ %", 75),
  ],
};
