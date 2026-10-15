import type { SubjectId } from "@/lib/curriculum";

export type MatchItem = { id: string; left: string; right: string };
export type FillItem = { id: string; prompt: string; answer: string; hint?: string };
export type McItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  passage?: string;
};
export type NumberItem = {
  id: string;
  prompt: string;
  answer: number;
  tolerance?: number;
  unit?: string;
};

export type ExerciseSet =
  | { type: "match"; titleZh: string; titleEn: string; items: MatchItem[] }
  | { type: "fill"; titleZh: string; titleEn: string; items: FillItem[] }
  | { type: "mc"; titleZh: string; titleEn: string; items: McItem[] }
  | { type: "number"; titleZh: string; titleEn: string; items: NumberItem[] };

const exercises: Record<string, ExerciseSet> = {
  "chinese:vocab": {
    type: "match",
    titleZh: "詞語配對",
    titleEn: "Word matching",
    items: [
      { id: "1", left: "勤奮", right: "努力不懈" },
      { id: "2", left: "猶豫", right: "拿不定主意" },
      { id: "3", left: "燦爛", right: "光彩耀目" },
      { id: "4", left: "珍惜", right: "愛惜重視" },
      { id: "5", left: "勇敢", right: "有膽量" },
      { id: "6", left: "安靜", right: "沒有聲響" },
    ],
  },
  "chinese:reading": {
    type: "mc",
    titleZh: "閱讀理解",
    titleEn: "Reading comprehension",
    items: [
      {
        id: "1",
        passage: "週末，媽媽帶小美到郊外遠足。路上小鳥歌唱，野花盛開。小美開心極了。",
        prompt: "小美週末做了什麼？",
        choices: ["到郊外遠足", "去圖書館", "在家睡覺", "去游泳"],
        answer: "到郊外遠足",
      },
      {
        id: "2",
        passage: "週末，媽媽帶小美到郊外遠足。路上小鳥歌唱，野花盛開。小美開心極了。",
        prompt: "路上的氣氛怎樣？",
        choices: ["愉快優美", "可怕", "沉悶", "嘈雜混亂"],
        answer: "愉快優美",
      },
      {
        id: "3",
        passage: "老師提醒同學考試前要溫習，但不要熬夜。充足睡眠同樣重要。",
        prompt: "老師認為什麼同樣重要？",
        choices: ["充足睡眠", "通宵溫習", "不溫習", "只吃糖"],
        answer: "充足睡眠",
      },
      {
        id: "4",
        passage: "雨過天晴，彩虹掛在天空。孩子們指著彩虹大聲驚嘆。",
        prompt: "孩子們為什麼驚嘆？",
        choices: ["因為看見彩虹", "因為下雨", "因為考試", "因為肚子餓"],
        answer: "因為看見彩虹",
      },
    ],
  },
  "chinese:sentences": {
    type: "fill",
    titleZh: "造句／填空",
    titleEn: "Sentence fill-in",
    items: [
      { id: "1", prompt: "春天來了，百花____。", answer: "盛開" },
      { id: "2", prompt: "他做事十分____，從不馬虎。", answer: "認真" },
      { id: "3", prompt: "請____把門關上。", answer: "輕輕" },
      { id: "4", prompt: "我們應該____時間，不要浪費。", answer: "珍惜" },
      { id: "5", prompt: "聽到好消息，大家____起來。", answer: "歡呼" },
    ],
  },
  "english:vocab": {
    type: "fill",
    titleZh: "Vocabulary",
    titleEn: "Vocabulary",
    items: [
      { id: "1", prompt: "I brush my ____ every morning.", answer: "teeth" },
      { id: "2", prompt: "The sky is ____ and clear today.", answer: "blue" },
      { id: "3", prompt: "Please ____ the door when you leave.", answer: "close" },
      { id: "4", prompt: "A baby cat is called a ____.", answer: "kitten" },
      { id: "5", prompt: "We write with a ____.", answer: "pen" },
    ],
  },
  "english:reading": {
    type: "mc",
    titleZh: "Reading",
    titleEn: "Reading",
    items: [
      {
        id: "1",
        passage:
          "Amy loves Saturday mornings. She reads comics, then helps Dad make pancakes.",
        prompt: "What does Amy do first on Saturday mornings?",
        choices: ["Reads comics", "Goes to school", "Plays football", "Sleeps all day"],
        answer: "Reads comics",
      },
      {
        id: "2",
        passage:
          "Amy loves Saturday mornings. She reads comics, then helps Dad make pancakes.",
        prompt: "Who makes pancakes with Amy?",
        choices: ["Dad", "Mum", "Her teacher", "Her brother"],
        answer: "Dad",
      },
      {
        id: "3",
        passage: "The museum opens at 10 a.m. Children under 12 enter free on Sundays.",
        prompt: "When do children under 12 enter free?",
        choices: ["Sundays", "Mondays", "Every day", "Never"],
        answer: "Sundays",
      },
      {
        id: "4",
        passage: "Ken packed a map, water and a snack for the hike.",
        prompt: "What did Ken NOT pack?",
        choices: ["A laptop", "Water", "A snack", "A map"],
        answer: "A laptop",
      },
    ],
  },
  "english:grammar": {
    type: "mc",
    titleZh: "Grammar",
    titleEn: "Grammar",
    items: [
      {
        id: "1",
        prompt: "She ____ her bag on the bus yesterday.",
        choices: ["left", "leave", "leaves", "leaving"],
        answer: "left",
      },
      {
        id: "2",
        prompt: "There ____ a lot of books on the shelf.",
        choices: ["are", "is", "be", "was"],
        answer: "are",
      },
      {
        id: "3",
        prompt: "He is ____ honest boy.",
        choices: ["an", "a", "the", "—"],
        answer: "an",
      },
      {
        id: "4",
        prompt: "They ____ football every weekend.",
        choices: ["play", "plays", "playing", "played"],
        answer: "play",
      },
      {
        id: "5",
        prompt: "I have ____ apple in my bag.",
        choices: ["an", "a", "two", "any"],
        answer: "an",
      },
    ],
  },
  "maths:fractions": {
    type: "number",
    titleZh: "分數",
    titleEn: "Fractions",
    items: [
      { id: "1", prompt: "1/4 + 2/4 = ?（填分子，分母為 4 的假分數分子，或等值小數）\nWhat is 1/4 + 2/4 as a single fraction numerator over 4? Enter the numerator.", answer: 3 },
      { id: "2", prompt: "3/5 + 1/5 = ? 填分子（分母 5）\nNumerator of 3/5 + 1/5 over 5:", answer: 4 },
      { id: "3", prompt: "2/8 + 4/8 = ? 填分子（分母 8）\nNumerator:", answer: 6 },
      { id: "4", prompt: "一半是多少個 1/4？\nHow many quarters in one half?", answer: 2 },
      { id: "5", prompt: "5/6 − 2/6 = ? 填分子（分母 6）\nNumerator:", answer: 3 },
    ],
  },
  "maths:decimals": {
    type: "number",
    titleZh: "小數",
    titleEn: "Decimals",
    items: [
      { id: "1", prompt: "1.5 + 2.3 = ?", answer: 3.8, tolerance: 0.01 },
      { id: "2", prompt: "4.6 − 1.2 = ?", answer: 3.4, tolerance: 0.01 },
      { id: "3", prompt: "0.5 × 8 = ?", answer: 4, tolerance: 0.01 },
      { id: "4", prompt: "7.25 + 0.75 = ?", answer: 8, tolerance: 0.01 },
      { id: "5", prompt: "9.9 − 3.3 = ?", answer: 6.6, tolerance: 0.01 },
    ],
  },
  "maths:word-problems": {
    type: "mc",
    titleZh: "應用題",
    titleEn: "Word problems",
    items: [
      {
        id: "1",
        prompt: "鉛筆每支 $4，買 3 支要多少？\nPencils cost $4 each. Cost of 3?",
        choices: ["$12", "$7", "$4", "$16"],
        answer: "$12",
      },
      {
        id: "2",
        prompt: "巴士有 40 個座位，已坐 28 人。還剩多少空位？\n40 seats, 28 taken. Empty?",
        choices: ["12", "18", "8", "22"],
        answer: "12",
      },
      {
        id: "3",
        prompt: "繩長 2 米，剪成每段 50 厘米。可剪幾段？\n2 m rope into 50 cm pieces. How many?",
        choices: ["4", "2", "5", "3"],
        answer: "4",
      },
      {
        id: "4",
        prompt: "一本書 96 頁，小華每天看 12 頁。幾天看完？\n96 pages, 12/day. Days?",
        choices: ["8", "6", "10", "12"],
        answer: "8",
      },
    ],
  },
};

export function getExercise(subject: SubjectId, topic: string): ExerciseSet | null {
  return exercises[`${subject}:${topic}`] ?? null;
}
