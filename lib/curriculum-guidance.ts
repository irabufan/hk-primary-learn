import type { SubjectSlug, Year } from "@/lib/curriculum";

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
        "P1–P2: prefer sharing / half-of / equal groups as whole numbers — not simplify-to-lowest-terms.",
        "P3: simple unit fractions of a small total only.",
      ],
      decimals: [
        "P1–P2: treat as money in whole dollars or simple tenths if needed; avoid ×÷ of two decimals.",
        "P3: simple add/subtract of one-decimal numbers with small values.",
      ],
      "word-problems": [
        "One- or two-step shopping / sharing / length with small integers.",
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

/**
 * 3–6 short lines for the quiz LLM, keyed by year + subject (+ optional topic).
 */
export function curriculumGuidanceLines(
  year: Year,
  subject: SubjectSlug,
  topic?: string,
): string[] {
  const band = yearBand(year);
  const block = GUIDANCE.find((g) => g.band === band && g.subject === subject);
  if (!block) {
    return [`Year ${year}: keep difficulty suitable for Hong Kong primary ${year}.`];
  }

  const out: string[] = [`Year: ${year} (${band}).`, ...block.lines];
  if (topic && block.topics?.[topic]) {
    out.push(...block.topics[topic]);
  }
  // Cap roughly to “thin map” size for the prompt.
  return out.slice(0, 6);
}

/** Single paragraph for prompts that want one blob. */
export function curriculumGuidanceBlock(
  year: Year,
  subject: SubjectSlug,
  topic?: string,
): string {
  return [
    "CURRICULUM / DIFFICULTY (HK primary — follow closely):",
    ...curriculumGuidanceLines(year, subject, topic).map((line) => `- ${line}`),
  ].join("\n");
}
