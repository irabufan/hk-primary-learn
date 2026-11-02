import { YEARS, type SubjectSlug, type Year } from "@/lib/curriculum";

/** HK primary key-stage bands (CDC primary curriculum flavour). */
export type YearBand = "KS1" | "KS2";

export function yearBand(year: Year): YearBand {
  return year === "P1" || year === "P2" || year === "P3" ? "KS1" : "KS2";
}

type GuidanceBlock = {
  band: YearBand;
  subject: SubjectSlug;
  /** Short lines injected into the quiz LLM prompt. */
  lines: string[];
  /** Optional topic-specific extras keyed by topic slug. */
  topics?: Record<string, string[]>;
};

/**
 * Thin HK primary curriculum map for LLM quiz prompts.
 * Keep short — injected as 3–6 lines, not a full syllabus.
 */
const GUIDANCE: GuidanceBlock[] = [
  {
    band: "KS1",
    subject: "chinese",
    lines: [
      "Band: KS1 (P1–P3). Keep stems short and picture/everyday-life friendly.",
      "Focus: basic Traditional Chinese vocab, simple sentences, short passages (1–3 sentences).",
      "Measure words: common ones only (個、本、隻、條、支、張). Traditional Chinese throughout.",
      "Avoid: 病句 analysis, long idioms, abstract literary language.",
    ],
    topics: {
      vocab: ["High-frequency school/home words; match word → simple meaning."],
      reading: ["Very short passage; one blank that copies a word/phrase from the text."],
      sentences: ["Simple cloze / common collocations — not formal 病句 correction yet."],
    },
  },
  {
    band: "KS2",
    subject: "chinese",
    lines: [
      "Band: KS2 (P4–P6). Richer Traditional Chinese vocab; longer reading (3–6 sentences).",
      "Include 病句 / collocation fixes and slightly more complex measure words where apt.",
      "P4 easier within KS2; P6 closer to upper-primary challenge.",
    ],
    topics: {
      vocab: ["Idiomatic / character-education words with precise Traditional Chinese meanings."],
      reading: ["Short passage comprehension; blank needs inference or key phrase."],
      sentences: ["病句修正、連詞、常用配搭."],
    },
  },
  {
    band: "KS1",
    subject: "english",
    lines: [
      "Band: KS1 (P1–P3). High-frequency words; present simple; short cloze.",
      "Stems: short English sentences (≈6–12 words). One blank; clear word bank hints.",
      "Avoid: complex tenses, long comprehension, multi-clause grammar.",
    ],
    topics: {
      vocabulary: ["Everyday adjectives/verbs (happy, big, like, go, have)."],
      reading: ["2–4 sentence stories; literal who/what/where MC."],
      grammar: ["Present simple / a-an / plurals / basic pronouns — not past perfect."],
    },
  },
  {
    band: "KS2",
    subject: "english",
    lines: [
      "Band: KS2 (P4–P6). Grammar focus: tenses, subject–verb agreement, longer comprehension.",
      "P4: present/past simple; P5–P6: richer vocab and multi-sentence passages.",
    ],
    topics: {
      vocabulary: ["Topic words (school, transport, feelings) with precise synonyms."],
      reading: ["Short passage + inference or detail MC."],
      grammar: ["Tenses, agreement, articles, comparatives as appropriate for the year."],
    },
  },
  {
    band: "KS1",
    subject: "maths",
    lines: [
      "Band: KS1 (P1–P3). Whole numbers; simple +, −; × intro; basic money / length.",
      "P1–P2: keep numbers small (typically ≤ 100); avoid complex fractions and multi-step decimals.",
      "P3: may introduce simple unit fractions (½, ⅓, ¼) carefully with small totals.",
      "HK flavour: dollars, MTR/bus, school stationery — keep realistic primary contexts.",
    ],
    topics: {
      fractions: [
        "P1: no fractions at all (whole numbers only). P2: equal sharing with whole-number answers only — no fraction notation.",
        "P3: simple unit fractions of a small total only.",
      ],
      decimals: [
        "P1–P2: treat as money in whole dollars or simple tenths if needed; avoid ×÷ of two decimals.",
        "P3: simple add/subtract of one-decimal numbers with small values.",
      ],
      "word-problems": [
        "Shopping / length / time contexts with small whole numbers; number of steps and operations as allowed by the year LIMIT lines.",
        "Money: bilingual stems OK, but MC choices must be bare numbers (or $N under EN / N元 under ZH) — never English stem with Chinese-only 元 choice labels.",
      ],
    },
  },
  {
    band: "KS2",
    subject: "maths",
    lines: [
      "Band: KS2 (P4–P6). Fractions, decimals, multi-step word problems (existing topic set).",
      "P4: unit fractions of a total, one-decimal ops; P5–P6: simplify, convert, multi-step.",
      "HK flavour: $ amounts, bus/ferry, school shopping.",
    ],
  },

  {
    band: "KS1",
    subject: "gs",
    lines: [
      "Band: KS1 (P1–P3). 常識: everyday healthy habits, community helpers, simple nature.",
      "Keep stems short Traditional Chinese; picture/everyday HK life (handwashing, MTR, wet market, plants/weather).",
      "Avoid: abstract civic theory, dense science jargon, national-identity essays.",
    ],
    topics: {
      "healthy-living": ["Hygiene, food, exercise, road safety — concrete yes/no or match."],
      community: ["Helpers, transport (MTR), library/market rules, simple recycling."],
      "nature-science": ["Plants need sun/water; animals; rain/clouds — literal MC."],
    },
  },
  {
    band: "KS2",
    subject: "gs",
    lines: [
      "Band: KS2 (P4–P6). Richer 常識: prevention, environment, simple science concepts.",
      "Traditional Chinese stems; HK examples (recycling, magnets, water cycle, renewable energy lightly).",
      "Keep national-identity content light or skip for this POC.",
    ],
    topics: {
      "healthy-living": ["Balanced diet, sleep, disease prevention, traffic safety."],
      community: ["Recycling, caring for public spaces, community roles."],
      "nature-science": ["States of water, magnets, moon reflection, solar energy — year-appropriate."],
    },
  },
];

type YearSpec = {
  /** One-line summary, also quoted to the neighbouring years as their boundary. */
  focus: string;
  /** Hard limits for this year (lengths, number ranges, grammar, word sets). */
  limits: string[];
};

/**
 * Per-year limits P1–P6. Maths follows the EDB 2017 Supplement learning units
 * (1N1–6N4, 1M–6M, 1S–6S); languages and 常識 follow the KS1/KS2 learning
 * objectives split into a gentle year-by-year progression.
 */
const YEAR_SPECS: Record<SubjectSlug, Record<Year, YearSpec>> = {
  chinese: {
    P1: {
      focus: "一年級：常見字詞、量詞配對、極短句子",
      limits: [
        "Stem ≤ 15 Chinese characters (excluding choices); passage ≤ 2 short sentences (≤ 30 字).",
        "Only everyday P1 words (家人、學校、動物、顏色、數字、身體、食物); MC choices 1–3 字.",
        "量詞 only from 個、本、隻、條、支、張、把 — no 輪、座、匹、幅 etc.",
        "Allowed: 配詞、量詞填充、very common 反義詞 (大/小、上/下)、找出短句中的人物/東西.",
        "Not allowed: 四字詞、成語、病句、修辭、近義詞細分、推論題.",
      ],
    },
    P2: {
      focus: "二年級：常用詞語、量詞擴展、2–3 句短文",
      limits: [
        "Stem ≤ 20 字; passage 2–3 sentences (≤ 50 字); MC choices ≤ 4 字.",
        "量詞 may add 輛、件、朵、棵、間、雙、對、把 on top of the P1 set.",
        "Allowed: 近義詞/反義詞 of common words, 連詞 和/也/還/然後, 標點 (，。？！).",
        "Not allowed: 成語、病句術語、修辭術語、推論作者意圖.",
      ],
    },
    P3: {
      focus: "三年級：短文 3–4 句、簡單連詞、常見四字詞",
      limits: [
        "Stem ≤ 30 字; passage 3–4 sentences (≤ 90 字).",
        "Allowed: 因為…所以、雖然…但是; a few very common 四字詞; 量詞 like 輪、座、匹、幅、首; simple 寓意 questions.",
        "Not allowed: formal 病句分析、修辭手法名稱、說明方法.",
      ],
    },
    P4: {
      focus: "四年級：段落理解、簡單病句（搭配不當）、四字詞、褒貶初步",
      limits: [
        "Passage 4–6 sentences (≤ 130 字); stems may be 1–2 sentences.",
        "Allowed: 病句 (搭配不當、成分殘缺), 四字詞, 記敘/描寫的分別, 褒義/貶義 basics.",
        "Avoid rare 成語 and 文言.",
      ],
    },
    P5: {
      focus: "五年級：較長篇章、關聯詞、修辭（比喻、擬人）、推論",
      limits: [
        "Passage ≤ 200 字; at least one question per quiz needs inference, not copying.",
        "Allowed: 關聯詞配搭, 比喻/擬人, 褒貶義辨析, 說明方法 basics, 常見成語.",
      ],
    },
    P6: {
      focus: "六年級：實用文（通告、書信）、作者意圖、事實與意見、成語",
      limits: [
        "Passage ≤ 260 字, including practical texts (通告、書信、啟事).",
        "Allowed: 作者意圖/主旨, 事實與意見, 排比/設問/反問, 成語運用 — upper-primary challenge, not secondary.",
      ],
    },
  },
  english: {
    P1: {
      focus: "P1: single words and 3–6 word sentences (I am / This is / I like / I can)",
      limits: [
        "Stem ≤ 6 words (instruction ≤ 4 words, or none); passages ≤ 2 sentences.",
        "Vocabulary: colours, numbers 1–10, family, animals, toys, food, school things, body parts.",
        "Grammar: a/an, this/that, simple plurals with -s, I/you/he/she/it, am/is/are, can.",
        "Not allowed: third-person -s verbs (goes, does), past tense, -ing/-ed adjectives, comparatives.",
      ],
    },
    P2: {
      focus: "P2: present simple with he/she -s, there is/are, prepositions, short 2–3 sentence texts",
      limits: [
        "Stem ≤ 8 words; passages 2–3 sentences.",
        "Grammar: present simple incl. he/she -s, there is/are, in/on/under, my/your/his/her, common irregular plurals (children).",
        "Not allowed: past tense, comparatives, -ing/-ed adjectives.",
      ],
    },
    P3: {
      focus: "P3: present continuous, simple past of common verbs, wh-questions, 3–5 sentence texts",
      limits: [
        "Stem ≤ 10 words; passages 3–5 sentences.",
        "Grammar: present continuous, simple past (regular + went/had/saw), adverbs of frequency, wh-questions, some/any.",
        "Not allowed: present perfect, passive, relative clauses.",
      ],
    },
    P4: {
      focus: "P4: past vs present, future (will / going to), comparatives/superlatives, ~80-word passages",
      limits: [
        "Stem ≤ 12 words; passages ≈ 60–90 words with detail questions.",
        "Grammar: past simple vs present, will/going to, comparatives/superlatives, much/many, -ing/-ed adjectives.",
        "Not allowed: present perfect, passive.",
      ],
    },
    P5: {
      focus: "P5: past continuous, present perfect intro, modals, connectives, ~120-word passages with inference",
      limits: [
        "Stem ≤ 15 words; passages ≈ 100–130 words; include at least one inference question when reading.",
        "Grammar: past continuous, present perfect (ever/never/already), should/must, because/so/although, prepositions of time.",
      ],
    },
    P6: {
      focus: "P6: present perfect vs past, simple passive, relative clauses, conditionals, ~150-word texts",
      limits: [
        "Stem ≤ 20 words; passages ≈ 140–180 words incl. emails/notices; inference and opinion questions.",
        "Grammar: present perfect vs past simple, simple passive, who/which/that clauses, first conditional, reported statements (light).",
      ],
    },
  },
  maths: {
    P1: {
      focus: "P1: whole numbers to 100; + and − only; coins; o'clock/half past; 3-D shapes and positions",
      limits: [
        "Numbers 0–100 only; most sums/differences within 20; two-digit ± at most (e.g. 34 + 12). (EDB 1N1–1N4)",
        "Operations: + and − only. NO ×, ÷, sharing/grouping, halves, fractions or decimals.",
        "Money: HK coins, whole-dollar prices ≤ $20. Time: o'clock and half past only. Length: compare / cm. Shapes: name 3-D shapes, straight vs curved lines, left/right/above/below.",
        "Word problems: ONE step, ≤ 2 short sentences, small familiar objects.",
      ],
    },
    P2: {
      focus: "P2: 3-digit ± with carry/borrow; times tables 0–10; basic ÷ (remainders ok); notes; m/cm; time to the minute",
      limits: [
        "Numbers up to 1000 (4-digit read/write only); ± of up to three 3-digit numbers. (EDB 2N1–2N6)",
        "× within the 0–10 tables; ÷ within the tables (remainder allowed). No fractions, decimals or halves-as-fractions.",
        "Money: notes and coins ≤ $100; length m/cm; time to the nearest minute; angles and four directions.",
        "Word problems: one step or a simple two-step.",
      ],
    },
    P3: {
      focus: "P3: 2-digit × / ÷ 1-digit, brackets; first fractions (part of a whole/set, same-denominator ±); km, g/kg, L/mL, 24-hour time",
      limits: [
        "Numbers up to 5 digits; 2-digit × 1-digit, 2-digit ÷ 1-digit; mixed operations with brackets. (EDB 3N1–3N5)",
        "Fractions: part of a whole/set, equivalent-fraction idea, compare same denominator/numerator, ± same denominator with result ≤ 1. No simplifying, improper/mixed numbers or decimals.",
        "Measures: km, g/kg, mL/L, 24-hour time; shapes: triangles, parallel lines.",
        "Word problems: up to two steps.",
      ],
    },
    P4: {
      focus: "P4: multi-digit × ÷, multiples/factors; improper & mixed numbers, simplifying; decimals (1–2 d.p.) ±; perimeter/area",
      limits: [
        "× ÷ by 2-digit numbers; multiples, factors, common multiples/factors by listing. (EDB 4N1–4N8)",
        "Fractions: proper/improper/mixed, expand/reduce to lowest terms, compare same denominator. No fraction × ÷, no different-denominator ±.",
        "Decimals: meaning and ± with 1–2 decimal places only (no × ÷ of decimals). No percentages.",
        "Measures: perimeter, area of rectangles/squares (cm², m²).",
      ],
    },
    P5: {
      focus: "P5: different-denominator fraction ±, fraction × and ÷; decimal ×; area of triangles/parallelograms; volume",
      limits: [
        "Fractions: ± with different denominators (≤ 3 fractions, friendly denominators), × and ÷ of fractions, fraction as quotient. (EDB 5N1–5N5)",
        "Decimals: × by whole numbers, 10/100/1000 and 0.1/0.01. No percentages yet.",
        "Measures: area of triangles/parallelograms/trapeziums, volume of cuboids; simple algebra with letters.",
        "Word problems: multi-step allowed.",
      ],
    },
    P6: {
      focus: "P6: decimal ÷, fraction↔decimal, percentages (of a quantity, % change, discount), averages, circles",
      limits: [
        "Decimals: ÷ involving decimals, fraction↔decimal conversion. (EDB 6N1–6N4)",
        "Percentages: % of a quantity, what % A is of B, increase/decrease by %, discounts.",
        "Averages, circles (π), speed/volume problems; multi-step problems expected — still primary, not secondary.",
      ],
    },
  },
  gs: {
    P1: {
      focus: "P1：身體與衞生、家庭與學校、社區幫手、天氣、動植物最基本需要",
      limits: [
        "Stem ≤ 15 字; each MC choice ≤ 6 字 (prefer 2–4 字 single things, e.g. 肥皂、雨傘、陽光和水).",
        "Only things a 6-year-old sees daily: 洗手、刷牙、食物、上學、家人、警察/消防員、晴天/雨天、白天/黑夜、植物要水和陽光、常見動物.",
        "No science terms (蒸發、凝結、磁極、細菌名稱), no calculations, no long sentence choices.",
      ],
    },
    P2: {
      focus: "P2：家居/道路安全、社區設施、天氣與衣著、動植物生長、常見物料",
      limits: [
        "Stem ≤ 20 字; each MC choice ≤ 8 字.",
        "Topics: 過馬路與乘車安全、圖書館/街市/公園規則、天氣與衣著、動物的居所與食物、紙/木/膠/金屬等物料.",
        "No science terms beyond everyday words; no multi-step reasoning.",
      ],
    },
    P3: {
      focus: "P3：光與影、物料特性、疾病預防初步、香港交通與地區、節約資源",
      limits: [
        "Stem ≤ 30 字; each MC choice ≤ 12 字.",
        "Allowed: 影子、透明/防水等物料特性、冰/水/水蒸氣 (observation only)、預防傷風感冒、香港地區與交通、節約用水用電.",
        "Not yet: 蒸發/凝結 terms, 磁極, 電路, 青春期.",
      ],
    },
    P4: {
      focus: "P4：水的三態變化名稱、磁鐵、簡單電路、傳染病預防、健康飲食金字塔、回收",
      limits: [
        "Stem ≤ 40 字; ask to name or identify concepts.",
        "Allowed: 蒸發/凝結/凝固/熔化, 磁鐵吸引與磁極, 簡單電路與導電體, 健康飲食金字塔, 傳染病預防, 社區回收.",
      ],
    },
    P5: {
      focus: "P5：光的反射與聲音、能量轉換、污染與保育、青春期初步 — 要求解釋因果",
      limits: [
        "Stem ≤ 50 字; at least half of the items ask WHY / WHAT WOULD HAPPEN (cause → effect), not just naming a term.",
        "Allowed: 光的反射、聲音、能量轉換、摩擦力、水污染與保育、青春期初步、香港與內地的聯繫 (light).",
        "Avoid repeating P4 naming questions (e.g. 'this process is called 蒸發').",
      ],
    },
    P6: {
      focus: "P6：可再生能源、簡單機械、青春期與情緒、公民責任、科技與生活 — 比較與評鑑",
      limits: [
        "Stem ≤ 60 字; include comparing/evaluating options or reading simple data.",
        "Allowed: 可再生/不可再生能源、槓桿/滑輪/斜面、青春期與情緒、拒絕誘惑、公民責任、科技對生活的影響.",
      ],
    },
  },
};

function neighbourLines(subject: SubjectSlug, year: Year): string[] {
  const index = YEARS.indexOf(year);
  const prev = YEARS[index - 1];
  const next = YEARS[index + 1];
  const out: string[] = [];
  if (prev) {
    out.push(
      `Must be clearly HARDER than ${prev} (${YEAR_SPECS[subject][prev].focus}) — do not just repeat ${prev} items.`,
    );
  } else {
    out.push("This is the EASIEST primary level — first weeks of school; a 6-year-old must be able to read and answer alone.");
  }
  if (next) {
    out.push(
      `Must be clearly EASIER than ${next} (${YEAR_SPECS[subject][next].focus}) — do not use ${next} content.`,
    );
  } else {
    out.push("Top of primary — challenging, but never secondary-school content.");
  }
  return out;
}

/**
 * Per-year limits + topic notes for the quiz LLM, keyed by year + subject
 * (+ optional topic). Always injected (alongside any retrieved chunks).
 */
export function curriculumGuidanceLines(
  year: Year,
  subject: SubjectSlug,
  topic?: string,
): string[] {
  const band = yearBand(year);
  const spec = YEAR_SPECS[subject][year];
  const block = GUIDANCE.find((g) => g.band === band && g.subject === subject);

  const out: string[] = [
    `Year: ${year} (${band}). Focus: ${spec.focus}.`,
    ...spec.limits.map((line) => `${year} LIMIT: ${line}`),
    ...neighbourLines(subject, year),
  ];
  if (topic && block?.topics?.[topic]) out.push(...block.topics[topic]);
  return out;
}

/** Single block for the quiz prompt. */
export function curriculumGuidanceBlock(
  year: Year,
  subject: SubjectSlug,
  topic?: string,
): string {
  return [
    `CURRICULUM / DIFFICULTY for ${year} (HK primary — these limits override the chunks above):`,
    ...curriculumGuidanceLines(year, subject, topic).map((line) => `- ${line}`),
  ].join("\n");
}
