export type Year = "P4" | "P5" | "P6";
export type SubjectId = "chinese" | "english" | "maths";

export const YEARS: Year[] = ["P4", "P5", "P6"];

export type Topic = {
  id: string;
  nameZh: string;
  nameEn: string;
  blurbZh: string;
  blurbEn: string;
  exerciseType: "match" | "fill" | "mc" | "number";
  emoji: string;
};

export type Subject = {
  id: SubjectId;
  nameZh: string;
  nameEn: string;
  color: string;
  emoji: string;
  topics: Topic[];
};

export const SUBJECTS: Subject[] = [
  {
    id: "chinese",
    nameZh: "中文",
    nameEn: "Chinese",
    color: "coral",
    emoji: "📚",
    topics: [
      {
        id: "vocab",
        nameZh: "詞語",
        nameEn: "Vocabulary",
        blurbZh: "配對詞義、認識常用詞語",
        blurbEn: "Match meanings and learn common words",
        exerciseType: "match",
        emoji: "🔤",
      },
      {
        id: "reading",
        nameZh: "閱讀理解",
        nameEn: "Reading",
        blurbZh: "短文閱讀與理解題",
        blurbEn: "Short passages and comprehension",
        exerciseType: "mc",
        emoji: "📖",
      },
      {
        id: "sentences",
        nameZh: "病句／造句",
        nameEn: "Sentences",
        blurbZh: "找出病句、練習造句",
        blurbEn: "Spot errors and build sentences",
        exerciseType: "fill",
        emoji: "✏️",
      },
    ],
  },
  {
    id: "english",
    nameZh: "English",
    nameEn: "English",
    color: "sky",
    emoji: "🌟",
    topics: [
      {
        id: "vocab",
        nameZh: "詞彙",
        nameEn: "Vocabulary",
        blurbZh: "Fill in the blank with the right word",
        blurbEn: "Fill in the blank with the right word",
        exerciseType: "fill",
        emoji: "💬",
      },
      {
        id: "reading",
        nameZh: "閱讀理解",
        nameEn: "Reading",
        blurbZh: "Comprehension questions",
        blurbEn: "Comprehension questions",
        exerciseType: "mc",
        emoji: "📰",
      },
      {
        id: "grammar",
        nameZh: "文法",
        nameEn: "Grammar",
        blurbZh: "Tenses, articles, and agreement",
        blurbEn: "Tenses, articles, and agreement",
        exerciseType: "mc",
        emoji: "🧩",
      },
    ],
  },
  {
    id: "maths",
    nameZh: "數學",
    nameEn: "Maths",
    color: "indigo",
    emoji: "🔢",
    topics: [
      {
        id: "fractions",
        nameZh: "分數",
        nameEn: "Fractions",
        blurbZh: "加減乘除分數練習",
        blurbEn: "Add, subtract, multiply fractions",
        exerciseType: "number",
        emoji: "🍕",
      },
      {
        id: "decimals",
        nameZh: "小數",
        nameEn: "Decimals",
        blurbZh: "小數運算與比較",
        blurbEn: "Decimal operations and comparison",
        exerciseType: "number",
        emoji: "📏",
      },
      {
        id: "word-problems",
        nameZh: "應用題",
        nameEn: "Word problems",
        blurbZh: "生活情境數學題",
        blurbEn: "Real-life maths stories",
        exerciseType: "mc",
        emoji: "🧮",
      },
    ],
  },
];

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getTopic(subjectId: string, topicId: string): Topic | undefined {
  return getSubject(subjectId)?.topics.find((t) => t.id === topicId);
}

export function isSubjectId(id: string): id is SubjectId {
  return id === "chinese" || id === "english" || id === "maths";
}
