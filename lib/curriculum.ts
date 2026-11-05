import type { Localized } from "@/lib/i18n/types";

export type Year = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export const YEARS: readonly Year[] = ["P1", "P2", "P3", "P4", "P5", "P6"];

export const DEFAULT_YEAR: Year = "P4";

export type SubjectSlug = "chinese" | "english" | "maths" | "gs";

export const SUBJECT_SLUGS: readonly SubjectSlug[] = ["chinese", "english", "maths", "gs"];

export type ExerciseKind = "match" | "fill" | "mc" | "number";

export type Topic = {
  slug: string;
  name: Localized;
  blurb: Localized;
  icon: string;
  exerciseKind: ExerciseKind;
  /** Years this topic is taught in; omitted = every year. */
  years?: Year[];
};

export type Subject = {
  slug: SubjectSlug;
  name: Localized;
  icon: string;
  tagline: Localized;
  /** Flat solid Tailwind bg class for subject accent (icon tile, CTAs). */
  accent: string;
  /** Soft chip classes for small subject labels. */
  soft: string;
  /** Border colour on hover for cards in this subject. */
  ring: string;
  /** Left-border / header accent border class. */
  border: string;
  /** Text accent class for headings/progress. */
  text: string;
  /** @deprecated alias — same as accent (kept for gradual call-site updates). */
  gradient: string;
  topics: Topic[];
};

export const SUBJECTS: Subject[] = [
  {
    slug: "chinese",
    icon: "🐼",
    name: { zh: "中文", en: "Chinese" },
    tagline: { zh: "詞語、閱讀、造句", en: "Vocab, reading, sentences" },
    accent: "bg-red-600",
    soft: "bg-red-100 text-red-800",
    ring: "hover:border-red-400",
    border: "border-red-500",
    text: "text-red-700",
    gradient: "bg-red-600",
    topics: [
      {
        slug: "vocab",
        icon: "📝",
        name: { zh: "詞語", en: "Vocabulary" },
        blurb: { zh: "配對詞語與意思，擴充詞彙量。", en: "Match words to their meanings and grow your vocabulary." },
        exerciseKind: "match",
      },
      {
        slug: "reading",
        icon: "📖",
        name: { zh: "閱讀理解", en: "Reading" },
        blurb: { zh: "讀短文，填出關鍵詞語。", en: "Read short passages and fill in the key words." },
        exerciseKind: "fill",
      },
      {
        slug: "sentences",
        icon: "✏️",
        name: { zh: "病句與造句", en: "Sentences" },
        blurb: { zh: "修正病句，填上合適的詞語。", en: "Fix broken sentences and choose the right words." },
        exerciseKind: "fill",
      },
    ],
  },
  {
    slug: "english",
    icon: "🔤",
    name: { zh: "英文", en: "English" },
    tagline: { zh: "詞彙、閱讀、文法", en: "Vocabulary, reading, grammar" },
    accent: "bg-blue-600",
    soft: "bg-blue-100 text-blue-800",
    ring: "hover:border-blue-400",
    border: "border-blue-500",
    text: "text-blue-700",
    gradient: "bg-blue-600",
    topics: [
      {
        slug: "vocabulary",
        icon: "💬",
        name: { zh: "英文詞彙", en: "Vocabulary" },
        blurb: { zh: "用詞語庫完成句子。", en: "Complete the sentences with the right word." },
        exerciseKind: "fill",
      },
      {
        slug: "reading",
        icon: "📚",
        name: { zh: "英文閱讀", en: "Reading" },
        blurb: { zh: "讀短文，答理解題。", en: "Read short passages and answer comprehension questions." },
        exerciseKind: "mc",
      },
      {
        slug: "grammar",
        icon: "🧩",
        name: { zh: "文法", en: "Grammar" },
        blurb: { zh: "選出正確的文法答案。", en: "Pick the grammatically correct option." },
        exerciseKind: "mc",
      },
    ],
  },
  {
    slug: "maths",
    icon: "🔢",
    name: { zh: "數學", en: "Maths" },
    tagline: { zh: "數與計算、圖形、應用題", en: "Numbers, shapes, word problems" },
    accent: "bg-orange-600",
    soft: "bg-orange-100 text-orange-900",
    ring: "hover:border-orange-400",
    border: "border-orange-500",
    text: "text-orange-700",
    gradient: "bg-orange-600",
    topics: [
      {
        slug: "numbers",
        icon: "🔟",
        name: { zh: "數的認識", en: "Numbers" },
        blurb: { zh: "數數、讀寫和比較數的大小。", en: "Count, read, write and compare numbers." },
        exerciseKind: "number",
        years: ["P1", "P2"],
      },
      {
        slug: "add-subtract",
        icon: "➕",
        name: { zh: "加與減", en: "Add & subtract" },
        blurb: { zh: "加法和減法計算。", en: "Practise adding and subtracting." },
        exerciseKind: "number",
        years: ["P1", "P2", "P3"],
      },
      {
        slug: "multiply-divide",
        icon: "✖️",
        name: { zh: "乘與除", en: "Multiply & divide" },
        blurb: { zh: "乘法表、乘法和除法。", en: "Times tables, multiplication and division." },
        exerciseKind: "number",
        years: ["P2", "P3", "P4"],
      },
      {
        slug: "money-time",
        icon: "🕒",
        name: { zh: "錢幣、時間與量度", en: "Money, time & measures" },
        blurb: { zh: "香港錢幣、看鐘、長度和重量。", en: "HK money, telling time, length and weight." },
        exerciseKind: "number",
        years: ["P1", "P2", "P3"],
      },
      {
        slug: "shapes",
        icon: "🔺",
        name: { zh: "圖形與方向", en: "Shapes & position" },
        blurb: { zh: "立體、平面圖形、位置和方向。", en: "3-D and 2-D shapes, position and direction." },
        exerciseKind: "number",
        years: ["P1", "P2", "P3"],
      },
      {
        slug: "fractions",
        icon: "🍕",
        name: { zh: "分數", en: "Fractions" },
        blurb: { zh: "認識分數、約分、求幾分之幾。", en: "Understand, simplify and work out fractions of quantities." },
        exerciseKind: "number",
        years: ["P3", "P4", "P5", "P6"],
      },
      {
        slug: "decimals",
        icon: "🧮",
        name: { zh: "小數", en: "Decimals" },
        blurb: { zh: "小數加減乘除，與分數互化。", en: "Add, subtract, multiply and divide decimals." },
        exerciseKind: "number",
        years: ["P4", "P5", "P6"],
      },
      {
        slug: "percentages",
        icon: "💯",
        name: { zh: "百分數", en: "Percentages" },
        blurb: { zh: "百分數、折扣和增減。", en: "Percentages, discounts and percentage change." },
        exerciseKind: "number",
        years: ["P6"],
      },
      {
        slug: "word-problems",
        icon: "🛒",
        name: { zh: "應用題", en: "Word problems" },
        blurb: { zh: "讀題目，選出正確答案。", en: "Read the problem and pick the right answer." },
        exerciseKind: "mc",
      },
    ],
  },
  {
    slug: "gs",
    icon: "🌍",
    name: { zh: "常識", en: "General Studies" },
    tagline: { zh: "健康、社區、自然科學", en: "Health, community, nature & science" },
    accent: "bg-emerald-600",
    soft: "bg-emerald-100 text-emerald-900",
    ring: "hover:border-emerald-400",
    border: "border-emerald-500",
    text: "text-emerald-700",
    gradient: "bg-emerald-600",
    topics: [
      {
        slug: "healthy-living",
        icon: "💪",
        name: { zh: "健康生活", en: "Healthy living" },
        blurb: {
          zh: "衛生、飲食、運動與安全。",
          en: "Hygiene, food, exercise and safety.",
        },
        exerciseKind: "match",
      },
      {
        slug: "community",
        icon: "🏘️",
        name: { zh: "社區與生活", en: "Community" },
        blurb: {
          zh: "社區工作者、交通、規則與環保（港鐵、街市、回收）。",
          en: "Helpers, transport, rules and the environment (MTR, wet market, recycling).",
        },
        exerciseKind: "mc",
      },
      {
        slug: "nature-science",
        icon: "🔬",
        name: { zh: "自然與科學", en: "Nature & science" },
        blurb: {
          zh: "動植物、天氣與簡易科學，按年級調適難度。",
          en: "Plants, animals, weather and simple science — year-appropriate.",
        },
        exerciseKind: "mc",
      },
    ],
  },
];

export function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}

export function isYear(value: string): value is Year {
  return (YEARS as readonly string[]).includes(value);
}

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getTopic(subject: Subject | string, topicSlug: string): Topic | undefined {
  const resolved = typeof subject === "string" ? getSubject(subject) : subject;
  return resolved?.topics.find((t) => t.slug === topicSlug);
}

export function topicSuitsYear(topic: Topic, year: Year): boolean {
  return !topic.years || topic.years.includes(year);
}

/** Topics taught in a given year (maths varies by grade; others are all-year). */
export function topicsForYear(subject: Subject | string, year: Year): Topic[] {
  const resolved = typeof subject === "string" ? getSubject(subject) : subject;
  return resolved?.topics.filter((topic) => topicSuitsYear(topic, year)) ?? [];
}

/** The requested topic if it is taught in this year, else the year's first topic. */
export function resolveTopicForYear(
  subject: Subject | string,
  year: Year,
  topicSlug?: string,
): string | undefined {
  const topics = topicsForYear(subject, year);
  return topics.find((topic) => topic.slug === topicSlug)?.slug ?? topics[0]?.slug;
}

/** Alias kept for older call sites during the refactor. */
export type SubjectId = SubjectSlug;

/** Alias kept for older call sites during the refactor. */
export const isSubjectId = isSubjectSlug;

export function subjectPath(slug: SubjectSlug, year?: Year): string {
  return `/subject/${slug}${year ? `?year=${year}` : ""}`;
}

export function exercisePath(subject: SubjectSlug, topic: string, year?: Year): string {
  return `/exercise/${subject}/${topic}${year ? `?year=${year}` : ""}`;
}

export function quizPath(
  subject: SubjectSlug,
  topic?: string,
  year?: Year,
  count?: number,
): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (topic) params.set("topic", topic);
  if (year) params.set("year", year);
  if (count != null) params.set("count", String(count));
  return `/quiz?${params.toString()}`;
}
