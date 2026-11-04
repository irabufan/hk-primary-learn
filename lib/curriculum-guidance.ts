import { YEARS, type SubjectSlug, type Year } from "@/lib/curriculum";
import { mulberry32, shuffle } from "@/lib/rng";

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
      "Measure words: as listed in the year LIMIT lines. Traditional Chinese throughout.",
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
      vocabulary: [
        "VOCABULARY item = word meaning / word choice in a short context. Choices are DIFFERENT words of the same word class — never forms of one word (tense, -s, -ing): that is grammar, not vocabulary.",
      ],
      reading: ["2–4 sentence stories; literal who/what/where MC."],
      grammar: [
        "GRAMMAR item = choose the right form or function word (am/is/are, a/an, plural -s, pronouns, can, verb forms the year allows). Choices are forms of one word or function words — never different content words (that is vocabulary). Themes only set the context.",
      ],
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
      vocabulary: [
        "VOCABULARY item = meaning, synonyms/antonyms, word choice in context, collocations or word families. Choices are DIFFERENT words — never tense, agreement or other grammar forms of one word. No grammar items in a vocabulary quiz.",
      ],
      reading: ["Short passage + inference or detail MC."],
      grammar: [
        "GRAMMAR item = tenses, agreement, articles, comparatives, connectives as the year allows. Choices are forms of one word or function words — never different content words (that is vocabulary).",
      ],
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
      numbers: ["Counting, reading/writing numbers, place value, odd/even, comparing with > and < (P2) — answers are numbers."],
      "add-subtract": ["Bare calculations or one-line stories; vary carrying/borrowing within the year's number range."],
      "multiply-divide": ["P2: times tables 0–10 and sharing/grouping within them; P3: 2-digit × or ÷ 1-digit."],
      "money-time": ["HK coins/notes, price tags, change; clock times; length/weight/capacity units allowed for the year."],
      shapes: ["Name or count features of shapes (sides, faces, corners) and positions/directions; numeric answers where possible."],
      fractions: ["P3 only within KS1: part of a whole/set, compare, same-denominator ± with result ≤ 1."],
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
      "Band: KS2 (P4–P6). Fractions, decimals, multi-step word problems.",
      "HK flavour: $ amounts, bus/ferry, school shopping.",
    ],
    topics: {
      "multiply-divide": ["P4: × ÷ by 2-digit numbers, multiples/factors, common multiples/factors by listing."],
      fractions: ["P4: improper/mixed numbers and lowest terms only; P5: different-denominator ±, × and ÷; P6: fraction ↔ decimal and mixed operations."],
      percentages: ["P6: % of a quantity, A as a % of B, % increase/decrease, discounts (八折 = 80%)."],
    },
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
      "nature-science": ["Science as allowed by the year LIMIT lines: P4 names concepts, P5 explains causes, P6 compares and evaluates."],
    },
  },
];

type YearSpec = {
  /** One-line summary, also quoted to the neighbouring years as their boundary. */
  focus: string;
  /** Hard limits for this year (lengths, number ranges, grammar, word sets). */
  limits: string[];
  /** Year-specific topic notes; replace the key-stage topic notes when present. */
  topics?: Record<string, string[]>;
  /**
   * Per-topic one-line focus. Replaces `focus` in this year's Focus line and in the
   * neighbouring years' boundary lines, so a topic quiz never sees other units' lists.
   */
  topicFocus?: Record<string, string>;
  /**
   * Themes rotated by seed (key = topic slug, or "*" for every topic) so
   * different seeds lean on different parts of the year's content.
   */
  rotate?: Record<string, string[]>;
};

/**
 * Per-year limits P1–P6. Maths follows the EDB 2017 Supplement learning units
 * (1N1–6N4, 1M–6M, 1S–6S); languages and 常識 follow the KS1/KS2 learning
 * objectives split into a gentle year-by-year progression.
 */
const YEAR_SPECS: Record<SubjectSlug, Record<Year, YearSpec>> = {
  chinese: {
    P1: {
      focus: "一年級：常見字詞、量詞、配詞、反義詞、分類、極短句子",
      limits: [
        "Stem ≤ 15 Chinese characters (excluding choices); passage ≤ 2 short sentences (≤ 30 字); MC choices 1–3 字.",
        "Words from a 6-year-old's world: 家人、學校與文具、動物、食物與水果、身體、顏色、數字、天氣、玩具、交通工具、常用動作（跑、跳、吃、喝、看、聽、寫、畫）.",
        "量詞 only from 個、本、隻、條、支、張、把、朵、件、位、杯、架 — no 輪、座、匹、幅 etc.",
        "Question types (mix at least 3 per quiz): 量詞填充、動詞配詞（動作＋東西）、反義詞（大/小、多/少、長/短、高/矮、開/關、來/去、冷/熱、快/慢、前/後、黑/白）、分類（哪一個是水果/動物/文具）、選字填句、疊詞（AA的）、簡單部首（口、木、氵、扌、亻）.",
        "Variety: at most 2 量詞 items and 1 反義詞 item per quiz; never reuse the same noun or word pair in two items.",
        "Not allowed: 四字詞、成語、病句、修辭、近義詞細分、推論題.",
      ],
      rotate: {
        "*": ["家人", "學校與文具", "動物", "食物與水果", "身體", "顏色", "數字", "天氣", "玩具與遊戲", "交通工具", "常用動作", "衣服"],
      },
    },
    P2: {
      focus: "二年級：常用詞語、量詞擴展、2–3 句短文",
      limits: [
        "Stem ≤ 20 字; passage 2–3 sentences (≤ 50 字); MC choices ≤ 4 字.",
        "量詞 may add 輛、棵、間、雙、對、頂、塊、粒、盒 on top of the P1 set.",
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
        "Every stem is a complete short sentence with a subject and a verb — never a bare noun phrase or a blank plus one word.",
      ],
      rotate: {
        "*": ["family", "colours", "numbers 1–10", "animals", "toys", "food", "school things", "body parts", "feelings", "actions (can)"],
      },
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
        "Fractions: part of a whole/set, equivalent-fraction idea, compare same denominator/numerator, ± same denominator with result ≤ 1. No simplifying, improper/mixed numbers or decimals — so pick numbers whose answers are already in lowest terms.",
        "Measures: km, g/kg, mL/L, 24-hour time; shapes: triangles, parallel lines.",
        "Word problems: up to two steps.",
      ],
    },
    P4: {
      focus: "P4: multi-digit × ÷, multiples/factors; improper & mixed numbers, simplifying; decimals (1–2 d.p.) ±; perimeter/area",
      limits: [
        "× ÷ by 2-digit numbers; multiples, factors, common multiples/factors by listing. (EDB 4N1–4N8)",
        "Fractions: proper/improper/mixed, expand/reduce to lowest terms, compare same denominator. No fraction × ÷, no different-denominator ±, and NO decimal ↔ fraction conversion questions (EDB 6N2, P6) — fractions items contain no decimals.",
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
      focus: "P1：我的身體與衞生、我的家、我的學校、家居安全、白天與黑夜、簡單天氣",
      limits: [
        "Stem ≤ 15 字; each MC choice ≤ 6 字 (prefer 2–4 字 single things).",
        "P1 themes ONLY: 身體與五官、個人衞生、早睡早起、家居安全、家人與家務、學校地方與課室規則、禮貌與排隊、白天與黑夜、晴天/雨天/颳風/冷熱與衣著.",
        "NOT P1 (these are P2): 動植物的需要和居所、生物與非生物、物料、社區幫手和社區設施、交通與乘車、四季、節日.",
        "No science terms (蒸發、凝結、磁極、細菌名稱), no calculations, no long sentence choices.",
      ],
      topicFocus: {
        "healthy-living": "P1 健康生活：身體與五官、個人衞生、早睡早起、家居安全",
        community: "P1 社區與生活：我的家、我的學校、課室規則、禮貌",
        "nature-science": "P1 自然：白天與黑夜、簡單天氣與衣著",
      },
      topics: {
        "healthy-living": ["P1 健康生活: 身體部位與五官的用處、洗手刷牙剪指甲、早睡早起、家居安全（熱水、刀、電插頭、不給陌生人開門）."],
        community: ["P1 社區與生活 = 我的家和我的學校: 家人稱呼、幫忙做家務、校園地方（課室、操場、禮堂、校務處）、課室規則、有禮貌、排隊. Not community helpers or facilities (P2)."],
        "nature-science": ["P1 自然: 白天與黑夜（太陽、月亮、星星、日間/晚上做的事）、天氣（晴、雨、風、冷熱）與應穿/帶甚麼. Not plants, animals or materials (P2)."],
      },
      rotate: {
        "healthy-living": ["五官", "身體部位", "洗手", "刷牙與剪指甲", "早睡早起", "熱水與利器", "電的安全", "陌生人"],
        community: ["家人稱呼", "幫忙做家務", "課室", "校園地方", "課室規則", "禮貌用語", "排隊與輪候"],
        "nature-science": ["白天", "黑夜", "晴天", "雨天", "颳風", "冷天", "熱天"],
      },
    },
    P2: {
      focus: "P2：生物與非生物、動植物的需要與居所、常見物料、社區幫手與設施、道路安全、四季、節日",
      limits: [
        "Stem ≤ 20 字; each MC choice ≤ 8 字.",
        "P2 themes: 生物與非生物、動植物生長的需要（水、空氣、陽光、食物）、動物的居所、常見物料及用途、社區幫手和他們的工作、社區設施及規則、道路及乘車安全、四季特徵、傳統節日習俗.",
        "Do NOT repeat P1 themes (身體與五官、洗手刷牙、白天黑夜、晴天雨天帶傘、家人稱呼、課室規則).",
        "No science terms beyond everyday words; no multi-step reasoning.",
      ],
      topicFocus: {
        "healthy-living": "P2 健康生活：道路及乘車安全、健康小食、運動與休息、看醫生與用藥",
        community: "P2 社區：社區幫手與設施、港鐵/巴士禮儀、傳統節日",
        "nature-science": "P2 自然：生物與非生物、動植物的需要與居所、四季、常見物料",
      },
      topics: {
        "healthy-living": ["P2 健康生活: 道路及乘車安全（燈號、斑馬線、安全帶）、健康小食與零食、運動與休息、生病看醫生和用藥要聽大人指示."],
        community: ["P2 社區: 社區幫手和他們的工作、社區設施（圖書館、街市、公園、診所）及規則、港鐵/巴士禮儀、農曆新年/端午節/中秋節的習俗."],
        "nature-science": ["P2 自然: 生物與非生物、動植物的需要、動物的居所（海洋、池塘、樹林）、四季特徵、常見物料（紙、木、塑膠、金屬、布）及用途."],
      },
      rotate: {
        "healthy-living": ["過馬路", "乘車安全", "健康小食", "運動與休息", "看醫生與用藥"],
        community: ["社區幫手", "社區設施", "港鐵與巴士禮儀", "農曆新年", "端午節", "中秋節"],
        "nature-science": ["生物與非生物", "植物的需要", "動物的居所", "動物吃甚麼", "四季", "常見物料"],
      },
    },
    P3: {
      focus: "P3：光與影、物料特性、疾病預防初步、香港交通與地區、節約資源",
      limits: [
        "Stem ≤ 30 字; each MC choice ≤ 12 字.",
        "Not yet: 蒸發/凝結 terms, 磁極, 電路, 青春期.",
      ],
      topicFocus: {
        "healthy-living": "P3 健康生活：預防傷風感冒、均衡飲食初步、作息與運動、家居/遊樂場/防火安全、與人相處",
        community: "P3 社區與生活：香港地區與地標、香港交通、社區設施與規則、節約用水用電",
        "nature-science": "P3 自然與科學：光與影、物料特性、冰/水/水蒸氣 (observation only)、推和拉、動植物生長",
      },
      topics: {
        "healthy-living": ["P3 健康生活 only: 預防傷風感冒（洗手、掩口鼻、按天氣添衣）、均衡飲食與食物種類初步、作息與運動、家居/遊樂場/防火安全、與人相處和情緒."],
        community: ["P3 社區與生活 only: 香港的地區與地標、交通工具和網絡（港鐵、輕鐵、渡輪、巴士）、社區設施和公共規則、節約用水用電的好習慣、家庭和學校的責任."],
        "nature-science": ["P3 自然與科學 only: 光與影（影子的形成、長短、方向）、物料特性（透明、防水、吸水、軟硬）、冰/水/水蒸氣的觀察、推和拉、動植物的生長."],
      },
    },
    P4: {
      focus: "P4：水的三態變化名稱、磁鐵、簡單電路、傳染病預防、健康飲食金字塔、回收",
      limits: [
        "Stem ≤ 40 字; ask to name or identify concepts.",
      ],
      topicFocus: {
        "healthy-living": "P4 健康生活：健康飲食金字塔、傳染病預防、牙齒護理、作息與運動、正確用藥與急救、安全習慣",
        community: "P4 社區與生活：社區回收、愛護公共設施、社區服務與義工、公共服務、鄰里",
        "nature-science": "P4 自然與科學：水的三態變化名稱、磁鐵與磁極、簡單電路與導電體、動植物分類",
      },
      topics: {
        "healthy-living": ["P4 健康生活 only: 健康飲食金字塔及食物類別、預防傳染病（病菌傳播、洗手、口罩、疫苗、環境衞生）、牙齒護理、作息睡眠與運動、正確用藥及簡單急救、交通及家居安全習慣."],
        community: ["P4 社區與生活 only: 社區回收（三色回收箱、減廢）、愛護公共設施和環境、社區服務及義工、公共服務（醫院、消防、警察、圖書館）、鄰里關係和屋苑規則."],
        "nature-science": ["P4 自然與科學 only: 蒸發/凝結/凝固/熔化, 磁鐵吸引與磁極, 簡單電路、導電體與絕緣體, 動植物分類."],
      },
    },
    P5: {
      focus: "P5：光的反射與聲音、能量轉換、污染與保育、青春期初步 — 要求解釋因果",
      limits: [
        "Stem ≤ 50 字; at least half of the items ask WHY / WHAT WOULD HAPPEN (cause → effect), not just naming a term.",
        "Avoid repeating P4 naming questions (e.g. 'this process is called 蒸發').",
        "Every item tests a DIFFERENT idea.",
      ],
      topicFocus: {
        "healthy-living": "P5 健康生活：青春期初步、身體系統的功能、情緒與壓力、拒絕煙酒毒品、健康使用電子產品 — 解釋原因",
        community: "P5 社區與生活：社區及環保行動的原因與影響、公民權利與責任、香港經濟與職業、社區問題的成因 — 解釋原因",
        "nature-science": "P5 自然與科學：光的反射與聲音、能量轉換、摩擦力、污染與保育、生物適應、日月地球 — 解釋因果",
      },
      topics: {
        "healthy-living": ["P5 健康生活 only: 青春期初步變化與個人衞生、身體系統（消化、呼吸、血液循環）、情緒與壓力處理、拒絕吸煙/酗酒/毒品、健康使用電子產品、均衡生活習慣的原因."],
        community: ["P5 社區與生活 only: 社區及環保行動的原因與影響、公民的權利與責任初步、香港的經濟活動與職業、香港與內地的聯繫 (light)、社區問題（噪音、衞生、交通擠塞）的成因和解決方法."],
        "nature-science": [
          "P5 自然與科學 only: 光的反射、聲音的產生和傳播、能量轉換、摩擦力、水污染與保育、生物適應環境、日月地球的運行.",
          "At most ONE pollution item per quiz, and not fertiliser → algae (藻華) unless the seed rotation names water pollution.",
        ],
      },
      rotate: {
        "nature-science": ["光的反射", "聲音的傳播", "能量轉換", "摩擦力", "水污染與保育", "生物適應環境", "日、月、地球的運行"],
      },
    },
    P6: {
      focus: "P6：可再生能源、簡單機械、青春期與情緒、公民責任、科技與生活 — 比較與評鑑",
      limits: [
        "Stem ≤ 60 字; include comparing/evaluating options or reading simple data (no plain arithmetic items).",
        "Every item tests a DIFFERENT idea.",
      ],
      topicFocus: {
        "healthy-living": "P6 健康生活：青春期與情緒管理、拒絕誘惑、評估生活習慣、社區健康與急救 — 比較與評鑑",
        community: "P6 社區與生活：公民責任、科技對社會的影響、可持續發展與減廢、社會議題的不同觀點 — 比較與評鑑",
        "nature-science": "P6 自然與科學：可再生能源、簡單機械、太陽系、氣候變化與減碳、電的使用 — 比較與評鑑",
      },
      topics: {
        "healthy-living": ["P6 健康生活 only: 青春期與情緒管理、拒絕誘惑（吸煙、酗酒、毒品、賭博）、評估生活時間表/飲食/上網習慣、社區健康與急救."],
        community: ["P6 社區與生活 only: 公民責任和參與、科技對社會生活的影響、可持續發展與減廢選擇、香港社會議題的不同觀點、國際交流 (light)."],
        "nature-science": [
          "P6 自然與科學 only: 可再生/不可再生能源、槓桿/滑輪/斜面、太陽系、氣候變化與減碳、電的使用與節約.",
          "At most ONE environment item per quiz; water pollution only as a for/against evaluation — never the P5 cause→effect question (fertiliser → algae / 藻華).",
        ],
      },
      rotate: {
        "nature-science": ["可再生與不可再生能源", "槓桿", "滑輪與斜面", "能源效益", "太陽系", "氣候變化與減碳", "電的安全與節約"],
      },
    },
  },
};

function focusOf(spec: YearSpec, topic: string | undefined): string {
  return (topic && spec.topicFocus?.[topic]) || spec.focus;
}

function neighbourLines(subject: SubjectSlug, year: Year, topic?: string): string[] {
  const index = YEARS.indexOf(year);
  const prev = YEARS[index - 1];
  const next = YEARS[index + 1];
  const out: string[] = [];
  if (prev) {
    out.push(
      `Must be clearly HARDER than ${prev} (${focusOf(YEAR_SPECS[subject][prev], topic)}) — do not just repeat ${prev} items.`,
    );
  } else {
    out.push("This is the EASIEST primary level — first weeks of school; a 6-year-old must be able to read and answer alone.");
  }
  if (next) {
    out.push(
      `Must be clearly EASIER than ${next} (${focusOf(YEAR_SPECS[subject][next], topic)}) — do not use ${next} content.`,
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
  seed?: number,
): string[] {
  const band = yearBand(year);
  const spec = YEAR_SPECS[subject][year];
  const block = GUIDANCE.find((g) => g.band === band && g.subject === subject);

  const out: string[] = [
    `Year: ${year} (${band}). Focus: ${focusOf(spec, topic)}.`,
    ...spec.limits.map((line) => `${year} LIMIT: ${line}`),
    ...neighbourLines(subject, year, topic),
  ];
  const topicNotes = topic ? (spec.topics?.[topic] ?? block?.topics?.[topic]) : undefined;
  if (topicNotes) out.push(...topicNotes);
  const rotation = rotationLine(spec, topic, seed);
  if (rotation) out.push(rotation);
  return out;
}

/** Seeded pick of 3 themes from the year's rotation list (same seed → same themes). */
function rotationLine(spec: YearSpec, topic: string | undefined, seed: number | undefined): string | undefined {
  const themes = (topic && spec.rotate?.[topic]) || spec.rotate?.["*"];
  if (!themes?.length || seed === undefined) return undefined;
  const picked = shuffle(mulberry32(seed), themes).slice(0, 3);
  return `This quiz's themes (rotated by seed): ${picked.join(" / ")} — draw most items from these, one idea per question.`;
}

/** Single block for the quiz prompt. */
export function curriculumGuidanceBlock(
  year: Year,
  subject: SubjectSlug,
  topic?: string,
  seed?: number,
): string {
  return [
    `CURRICULUM / DIFFICULTY for ${year} (HK primary — these limits override the chunks above):`,
    ...curriculumGuidanceLines(year, subject, topic, seed).map((line) => `- ${line}`),
  ].join("\n");
}

/** One-line in-scope description of a topic for a year (per-topic focus, else empty). */
export function topicScope(year: Year, subject: SubjectSlug, topic: string): string | undefined {
  return YEAR_SPECS[subject][year].topicFocus?.[topic];
}
