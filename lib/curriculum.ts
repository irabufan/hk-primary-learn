import type { Localized } from "@/lib/i18n/types";

export type Year = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export const YEARS: readonly Year[] = ["P1", "P2", "P3", "P4", "P5", "P6"];

export const DEFAULT_YEAR: Year = "P4";

export type SubjectSlug = "chinese" | "english" | "maths";

export const SUBJECT_SLUGS: readonly SubjectSlug[] = ["chinese", "english", "maths"];

export type ExerciseKind = "match" | "fill" | "mc" | "number";

export type Topic = {
  slug: string;
  name: Localized;
  blurb: Localized;
  icon: string;
  exerciseKind: ExerciseKind;
};

export type Subject = {
  slug: SubjectSlug;
  name: Localized;
  icon: string;
  tagline: Localized;
  /** Tailwind gradient classes for the subject tile. */
  gradient: string;
  /** Soft chip classes for small subject labels. */
  soft: string;
  /** Border colour on hover for cards in this subject. */
  ring: string;
  topics: Topic[];
};

export const SUBJECTS: Subject[] = [
  {
    slug: "chinese",
    icon: "🐼",
    name: { zh: "中文", en: "Chinese" },
    tagline: { zh: "詞語、閱讀、造句", en: "Vocab, reading, sentences" },
    gradient: "from-orange-400 via-rose-400 to-red-400",
    soft: "bg-orange-100 text-orange-700",
    ring: "hover:border-orange-300",
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
    gradient: "from-sky-400 via-cyan-400 to-blue-500",
    soft: "bg-sky-100 text-sky-700",
    ring: "hover:border-sky-300",
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
    tagline: { zh: "分數、小數、應用題", en: "Fractions, decimals, word problems" },
    gradient: "from-indigo-400 via-violet-400 to-purple-400",
    soft: "bg-indigo-100 text-indigo-700",
    ring: "hover:border-indigo-300",
    topics: [
      {
        slug: "fractions",
        icon: "🍕",
        name: { zh: "分數", en: "Fractions" },
        blurb: { zh: "約分、化小數、求幾分之幾。", en: "Simplify, convert and work out fractions of quantities." },
        exerciseKind: "number",
      },
      {
        slug: "decimals",
        icon: "🧮",
        name: { zh: "小數", en: "Decimals" },
        blurb: { zh: "小數加減乘除，與分數互化。", en: "Add, subtract, multiply and divide decimals." },
        exerciseKind: "number",
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

export function quizPath(subject: SubjectSlug, topic?: string, year?: Year): string {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (year) params.set("year", year);
  const query = params.toString();
  return `/quiz?subject=${subject}${query ? `&${query}` : ""}`;
}
