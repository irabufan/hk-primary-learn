import type { SubjectId, Year } from "@/lib/curriculum";
import { mulberry32, pick, randomSeed, shuffle } from "@/lib/rng";
import type { GenerateOpts, Quiz, QuizGenerator, QuizQuestion } from "@/lib/quiz/types";

type Template = {
  build: (rng: () => number, year: Year) => QuizQuestion;
};

function id(rng: () => number): string {
  return `q-${Math.floor(rng() * 1e9).toString(36)}`;
}

/* ---- Chinese templates ---- */
const chineseVocab: Template[] = [
  {
    build: (rng) => {
      const pairs: [string, string, string[]][] = [
        ["愉快", "開心、快樂", ["傷心", "忙碌", "安靜"]],
        ["勤奮", "努力不懈", ["懶惰", "匆忙", "驕傲"]],
        ["猶豫", "拿不定主意", ["果斷", "興奮", "冷淡"]],
        ["燦爛", "光彩耀目", ["昏暗", "平凡", "細小"]],
        ["珍惜", "愛惜、重視", ["浪費", "忘記", "討厭"]],
        ["勇敢", "有膽量", ["膽小", "害羞", "粗心"]],
      ];
      const [word, meaning, wrong] = pick(rng, pairs);
      const choices = shuffle(rng, [meaning, ...wrong]);
      return {
        id: id(rng),
        type: "mc",
        prompt: `「${word}」的意思最接近：`,
        choices,
        answer: meaning,
        explanation: `「${word}」意思是${meaning}。`,
      };
    },
  },
  {
    build: (rng) => {
      const items: [string, string][] = [
        ["春暖花____", "開"],
        ["書山有路勤為____", "徑"],
        ["一分耕耘，一分____", "收穫"],
        ["滴水穿____", "石"],
      ];
      const [prompt, answer] = pick(rng, items);
      return {
        id: id(rng),
        type: "fill",
        prompt: `補上適當的字：${prompt}`,
        answer,
        explanation: `正確答案是「${answer}」。`,
      };
    },
  },
];

const chineseReading: Template[] = [
  {
    build: (rng) => {
      const passages = [
        {
          text: "小明每天早上都會到公園跑步。他覺得運動能令身體更健康，頭腦更清醒。",
          q: "小明為什麼跑步？",
          a: "為了健康和清醒",
          wrong: ["因為生氣", "為了買東西", "因為上學遲到"],
        },
        {
          text: "圖書館裏十分安靜。同學們專心閱讀，有的做筆記，有的查找資料。",
          q: "圖書館裏的氣氛怎樣？",
          a: "安靜",
          wrong: ["熱鬧", "嘈雜", "混亂"],
        },
        {
          text: "颱風臨近，學校宣布明天停課。同學們既擔心又有點興奮。",
          q: "學校為什麼停課？",
          a: "因為颱風臨近",
          wrong: ["因為考試", "因為假期", "因為裝修"],
        },
      ];
      const p = pick(rng, passages);
      return {
        id: id(rng),
        type: "mc",
        prompt: `${p.text}\n\n${p.q}`,
        choices: shuffle(rng, [p.a, ...p.wrong]),
        answer: p.a,
      };
    },
  },
];

const chineseSentences: Template[] = [
  {
    build: (rng) => {
      const items: [string, string, string][] = [
        ["下列哪句沒有語病？", "他認真地完成了功課。", "他認真完成了很功課。"],
        ["選出意思通順的句子：", "媽媽買了新鮮的水果。", "媽媽買了水果的新鮮。"],
        ["哪句用詞恰當？", "同學們興高采烈地慶祝。", "同學們興高采烈地睡覺。"],
      ];
      const [q, good, bad] = pick(rng, items);
      const extra = shuffle(rng, [
        bad,
        "因為所以他去了學校。",
        "非常很好的天氣。",
      ]).slice(0, 3);
      return {
        id: id(rng),
        type: "mc",
        prompt: q,
        choices: shuffle(rng, [good, ...extra]),
        answer: good,
      };
    },
  },
  {
    build: (rng) => {
      const items: [string, string][] = [
        ["把「高興」填入：同學們____地鼓掌。", "高興"],
        ["把「仔細」填入：請____檢查答案。", "仔細"],
        ["把「忽然」填入：天空____下起雨來。", "忽然"],
      ];
      const [prompt, answer] = pick(rng, items);
      return { id: id(rng), type: "fill", prompt, answer };
    },
  },
];

/* ---- English templates ---- */
const englishVocab: Template[] = [
  {
    build: (rng) => {
      const items: [string, string, string[]][] = [
        ["The opposite of 'hot' is ____.", "cold", ["warm", "cool", "heat"]],
        ["A place where you borrow books is a ____.", "library", ["market", "station", "garden"]],
        ["She is very ____ — she always helps others.", "kind", ["rude", "lazy", "noisy"]],
        ["We use an ____ to draw a straight line.", "ruler", ["eraser", "pencil case", "glue"]],
      ];
      const [prompt, answer, distractors] = pick(rng, items);
      return {
        id: id(rng),
        type: "mc",
        prompt,
        choices: shuffle(rng, [answer, ...distractors]),
        answer,
      };
    },
  },
  {
    build: (rng) => {
      const items: [string, string][] = [
        ["Complete: Good ____! (morning greeting)", "morning"],
        ["Plural of 'child' is ____.", "children"],
        ["Past tense of 'go' is ____.", "went"],
      ];
      const [prompt, answer] = pick(rng, items);
      return { id: id(rng), type: "fill", prompt, answer };
    },
  },
];

const englishReading: Template[] = [
  {
    build: (rng) => {
      const passages = [
        {
          text: "Tom has a pet rabbit named Snow. Every evening he feeds Snow carrots and lettuce.",
          q: "What does Tom feed Snow?",
          a: "Carrots and lettuce",
          wrong: ["Fish and chips", "Only water", "Bread and jam"],
        },
        {
          text: "The school fair is on Saturday. There will be games, food stalls and a magic show.",
          q: "When is the school fair?",
          a: "Saturday",
          wrong: ["Sunday", "Friday", "Monday"],
        },
        {
          text: "Maya forgot her umbrella. When it started to rain, she ran under a big tree.",
          q: "Why did Maya run under a tree?",
          a: "It started to rain",
          wrong: ["She saw a bird", "She was late", "She lost her bag"],
        },
      ];
      const p = pick(rng, passages);
      return {
        id: id(rng),
        type: "mc",
        prompt: `${p.text}\n\n${p.q}`,
        choices: shuffle(rng, [p.a, ...p.wrong]),
        answer: p.a,
      };
    },
  },
];

const englishGrammar: Template[] = [
  {
    build: (rng) => {
      const items: [string, string, string[]][] = [
        ["She ____ to school every day.", "goes", ["go", "going", "gone"]],
        ["There ____ three apples on the table.", "are", ["is", "be", "was"]],
        ["I ____ my homework yesterday.", "finished", ["finish", "finishing", "finishes"]],
        ["He is ____ tallest boy in the class.", "the", ["a", "an", "this"]],
      ];
      const [prompt, answer, wrong] = pick(rng, items);
      return {
        id: id(rng),
        type: "mc",
        prompt,
        choices: shuffle(rng, [answer, ...wrong]),
        answer,
      };
    },
  },
];

/* ---- Maths templates ---- */
function yearFactor(year: Year): number {
  return year === "P4" ? 1 : year === "P5" ? 2 : 3;
}

const mathsFractions: Template[] = [
  {
    build: (rng, year) => {
      const f = yearFactor(year);
      const den = 2 + Math.floor(rng() * (4 + f));
      const n1 = 1 + Math.floor(rng() * (den - 1));
      const n2 = 1 + Math.floor(rng() * (den - 1));
      const sum = n1 + n2;
      const whole = Math.floor(sum / den);
      const rem = sum % den;
      const answer = rem === 0 ? String(whole) : whole > 0 ? `${whole} ${rem}/${den}` : `${sum}/${den}`;
      // Simplify answer as improper / mixed accepted as sum/den
      return {
        id: id(rng),
        type: "fill",
        prompt: `計算：${n1}/${den} + ${n2}/${den} = ?（可用假分數，如 ${sum}/${den}）\nCalculate: ${n1}/${den} + ${n2}/${den} = ?`,
        answer: `${sum}/${den}`,
        explanation: `${n1}/${den} + ${n2}/${den} = ${sum}/${den}${whole > 0 && rem ? ` = ${answer}` : ""}`,
      };
    },
  },
  {
    build: (rng, year) => {
      const f = yearFactor(year);
      const den = [2, 4, 5, 8, 10][Math.floor(rng() * (3 + Math.min(f, 2)))]!;
      const num = 1 + Math.floor(rng() * (den - 1));
      const choices = shuffle(rng, [
        `${num}/${den}`,
        `${den}/${num}`,
        `${num + 1}/${den}`,
        `${num}/${den + 1}`,
      ]);
      return {
        id: id(rng),
        type: "mc",
        prompt: `哪一個分數等於把 1 分成 ${den} 等份後取 ${num} 份？\nWhich fraction is ${num} out of ${den} equal parts?`,
        choices,
        answer: `${num}/${den}`,
      };
    },
  },
];

const mathsDecimals: Template[] = [
  {
    build: (rng, year) => {
      const f = yearFactor(year);
      const a = Math.round((1 + rng() * (5 + f)) * 10) / 10;
      const b = Math.round((0.5 + rng() * (3 + f)) * 10) / 10;
      const sum = Math.round((a + b) * 10) / 10;
      return {
        id: id(rng),
        type: "number",
        prompt: `計算 Calculate: ${a} + ${b} = ?`,
        answer: sum,
        explanation: `${a} + ${b} = ${sum}`,
      };
    },
  },
  {
    build: (rng, year) => {
      const f = yearFactor(year);
      const a = Math.round((2 + rng() * (6 + f)) * 10) / 10;
      const b = Math.round((0.2 + rng() * (2 + f * 0.5)) * 10) / 10;
      const diff = Math.round((a - b) * 10) / 10;
      return {
        id: id(rng),
        type: "number",
        prompt: `計算 Calculate: ${a} − ${b} = ?`,
        answer: diff,
      };
    },
  },
];

const mathsWord: Template[] = [
  {
    build: (rng, year) => {
      const f = yearFactor(year);
      const price = 5 + Math.floor(rng() * (5 + f * 3));
      const n = 2 + Math.floor(rng() * (3 + f));
      const total = price * n;
      const paid = total + 5 + Math.floor(rng() * 20);
      const change = paid - total;
      return {
        id: id(rng),
        type: "mc",
        prompt: `貼紙每張 $${price}，小華買了 ${n} 張，付了 $${paid}。找回多少？\nStickers cost $${price} each. Wah buys ${n} and pays $${paid}. Change?`,
        choices: shuffle(rng, [
          `$${change}`,
          `$${change + 5}`,
          `$${total}`,
          `$${paid - price}`,
        ]),
        answer: `$${change}`,
        explanation: `${n} × $${price} = $${total}；$${paid} − $${total} = $${change}`,
      };
    },
  },
  {
    build: (rng, year) => {
      const f = yearFactor(year);
      const rows = 3 + Math.floor(rng() * (2 + f));
      const cols = 4 + Math.floor(rng() * (2 + f));
      const total = rows * cols;
      return {
        id: id(rng),
        type: "number",
        prompt: `課室有 ${rows} 行，每行 ${cols} 張椅。一共多少張椅？\n${rows} rows × ${cols} chairs each. Total chairs?`,
        answer: total,
        explanation: `${rows} × ${cols} = ${total}`,
      };
    },
  },
];

const BANKS: Record<SubjectId, Record<string, Template[]>> = {
  chinese: {
    vocab: chineseVocab,
    reading: chineseReading,
    sentences: chineseSentences,
  },
  english: {
    vocab: englishVocab,
    reading: englishReading,
    grammar: englishGrammar,
  },
  maths: {
    fractions: mathsFractions,
    decimals: mathsDecimals,
    "word-problems": mathsWord,
  },
};

function fallbackBank(subject: SubjectId): Template[] {
  const first = Object.values(BANKS[subject])[0];
  return first ?? englishVocab;
}

export function generateQuiz(opts: GenerateOpts): Quiz {
  const seed = opts.seed ?? randomSeed();
  const rng = mulberry32(seed);
  const bank = BANKS[opts.subject][opts.topic] ?? fallbackBank(opts.subject);
  const count = Math.max(1, Math.min(20, opts.count));
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const tmpl = pick(rng, bank);
    questions.push(tmpl.build(rng, opts.year));
  }
  return {
    id: `quiz-${seed.toString(36)}`,
    subject: opts.subject,
    topic: opts.topic,
    year: opts.year,
    questions,
    seed,
  };
}

export class MockQuizGenerator implements QuizGenerator {
  async generate(opts: GenerateOpts): Promise<Quiz> {
    // Simulate a tiny async boundary so UI can show "generating"
    await new Promise((r) => setTimeout(r, 180 + Math.random() * 220));
    return generateQuiz(opts);
  }
}
