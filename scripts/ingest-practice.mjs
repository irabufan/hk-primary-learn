#!/usr/bin/env node
/**
 * Practice-material ingest for hk-primary-learn.
 *
 * Adds distilled *practice pattern* chunks (item stems / skill descriptors)
 * from verified-open sources into data/curriculum/*.json.
 * Does NOT dump commercial textbooks or HKEAA past papers.
 *
 * Sources (see LICENSE notes in README):
 *  - Illustrative Mathematics tasks — CC BY-NC-SA 4.0
 *  - Chinese Grammar Wiki (AllSet Learning) — CC BY-NC-SA 3.0
 *  - EDB "Enhancing English Vocabulary Learning and Teaching at Primary Level"
 *    — duplication for non-profit educational purposes with acknowledgement
 *  - Earthwatch / ProBleu "Pollution in our Rivers" — CC BY 4.0
 *
 * Usage:
 *   node scripts/ingest-practice.mjs
 *   node scripts/ingest-practice.mjs --fetch   # refresh _raw/practice snapshots
 *
 * Chunks use kind: "practice" and source: "practice: <url>" or
 * "paraphrase-practice: <url>". Content is short distilled patterns + attribution,
 * not verbatim worksheet dumps.
 */

import { createHash } from "node:crypto";
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "data", "curriculum");
const RAW_DIR = join(OUT_DIR, "_raw", "practice");
const DO_FETCH = process.argv.includes("--fetch");

const UA = "hk-primary-learn-ingest/0.1 (+https://github.com/irabufan/hk-primary-learn)";

const FETCH_SOURCES = [
  {
    key: "im-sharing-lunches",
    url: "https://tasks.illustrativemathematics.org/content-standards/NF/5/B/3/tasks/2074",
    file: "im-sharing-lunches.html",
  },
  {
    key: "im-tenths-hundredths",
    url: "https://tasks.illustrativemathematics.org/content-standards/NF/4/C/6/tasks/103",
    file: "im-tenths-hundredths.html",
  },
  {
    key: "im-running-laps",
    url: "https://tasks.illustrativemathematics.org/content-standards/4/NF/A/tasks/971",
    file: "im-running-laps.html",
  },
  {
    key: "im-unlike-add",
    url: "https://tasks.illustrativemathematics.org/content-standards/NF/5/A/1/tasks/855",
    file: "im-unlike-add.html",
  },
  {
    key: "cgw-measure-words",
    url: "https://resources.allsetlearning.com/chinese/grammar/Measure_words",
    file: "cgw-measure-words.html",
  },
  {
    key: "cgw-sentence-order",
    url: "https://resources.allsetlearning.com/chinese/grammar/Basic_sentence_order",
    file: "cgw-sentence-order.html",
  },
  {
    key: "cgw-comparing",
    url: "https://resources.allsetlearning.com/chinese/grammar/Comparing",
    file: "cgw-comparing.html",
  },
  {
    key: "cgw-copyrights",
    url: "https://resources.allsetlearning.com/chinese/grammar/Chinese_Grammar_Wiki:Copyrights",
    file: "cgw-copyrights.html",
  },
  {
    key: "pollution-rivers",
    url: "https://probleu.pml.space/en/content/worksheet/1335/",
    file: "pollution-rivers.html",
  },
  {
    key: "edb-eng-vocab-handbook",
    url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/eng-edu/Enhancing%20Vocab%20Primary/Handbook.pdf",
    file: "edb-eng-vocab-handbook.pdf",
  },
];

const PRACTICE_SOURCES_META = [
  {
    key: "illustrative-mathematics",
    license: "CC BY-NC-SA 4.0",
    url: "https://tasks.illustrativemathematics.org/",
    note: "Distilled task patterns; attribution required; non-commercial / share-alike.",
  },
  {
    key: "chinese-grammar-wiki",
    license: "CC BY-NC-SA 3.0",
    url: "https://resources.allsetlearning.com/chinese/grammar/",
    note: "Paraphrased grammar patterns with AllSet Learning Chinese Grammar Wiki attribution; NC + SA.",
  },
  {
    key: "edb-eng-vocab-primary",
    license: "EDB non-profit educational duplication (with acknowledgement)",
    url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/eng-edu/Enhancing%20Vocab%20Primary/Handbook.pdf",
    note: "Handbook states materials may be duplicated freely for non-profit educational purposes with proper acknowledgements.",
  },
  {
    key: "probleu-pollution-rivers",
    license: "CC BY 4.0",
    url: "https://probleu.pml.space/en/content/worksheet/1335/",
    note: "Earthwatch river-pollution worksheet metadata / topic stems; attribution required.",
  },
];

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: "utf8", ...opts });
}

function download(url, dest) {
  console.log(`fetch ${url}`);
  const r = sh("curl", ["-fsSL", "-A", UA, "-o", dest, url]);
  if (r.status !== 0) {
    throw new Error(`curl failed for ${url}: ${r.stderr || r.stdout || r.status}`);
  }
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

/**
 * Distilled practice patterns — short skill descriptors / item stems.
 * Prefer paraphrase-practice when not quoting a short stem verbatim.
 */
function buildPracticeChunks() {
  const IM = "https://tasks.illustrativemathematics.org";
  const CGW = "https://resources.allsetlearning.com/chinese/grammar";
  const EDB_VOCAB =
    "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/eng-edu/Enhancing%20Vocab%20Primary/Handbook.pdf";
  const POLLUTION = "https://probleu.pml.space/en/content/worksheet/1335/";

  /** @type {import('../lib/curriculum-retrieve').CurriculumChunk[]} */
  const chunks = [
    // ——— Chinese (Chinese Grammar Wiki, CC BY-NC-SA) ———
    {
      id: "prac-chi-mw-cloze-ks1",
      subject: "chinese",
      kind: "practice",
      topics: ["vocab"],
      band: "KS1",
      years: ["P1", "P2", "P3"],
      text_zh:
        "練習模式（量詞填空）：數字／指示代詞 + ____ + 名詞。例：一___書；這___人；兩___狗。考查常見量詞（個、本、只）配對，而非默寫整課生字表。",
      text_en:
        "Practice pattern (measure-word cloze): numeral/demonstrative + ____ + noun. Stems like 一___書 / 這___人 / 兩___狗 probe classifier choice (個/本/只), not whole vocabulary lists.",
      source: `paraphrase-practice: ${CGW}/Measure_words`,
      sourceUrl: `${CGW}/Measure_words`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },
    {
      id: "prac-chi-mw-pairs-ks1",
      subject: "chinese",
      kind: "practice",
      topics: ["vocab"],
      band: "KS1",
      text_zh:
        "量詞－名詞配對模式：只→動物／鞋；條→魚／路／腿；輛→車；台→電腦／電視；塊→糕／肉／錢。練習以配對卡或選詞完成短語為主。",
      text_en:
        "Classifier–noun pairing pattern: 只→animals/shoes; 條→fish/roads/legs; 輛→vehicles; 台→computers/TVs; 塊→cake/meat/money. Drill as match cards or phrase completion.",
      source: `paraphrase-practice: ${CGW}/Measure_words`,
      sourceUrl: `${CGW}/Measure_words`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },
    {
      id: "prac-chi-svo-sentences-ks1",
      subject: "chinese",
      kind: "practice",
      topics: ["sentences"],
      band: "KS1",
      text_zh:
        "基本語序練習：主語＋動詞＋賓語（SVO）。短句重組／判斷：我／去／學校；他／說／中文。病句焦點：缺賓語或主謂顛倒。",
      text_en:
        "Basic word-order practice: Subj + Verb + Obj (SVO). Reorder/judge short stems (我／去／學校; 他／說／中文). Broken-sentence focus: missing object or inverted S–V.",
      source: `paraphrase-practice: ${CGW}/Basic_sentence_order`,
      sourceUrl: `${CGW}/Basic_sentence_order`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },
    {
      id: "prac-chi-sv-predicate-ks1",
      subject: "chinese",
      kind: "practice",
      topics: ["sentences", "vocab"],
      band: "KS1",
      text_zh:
        "主謂短句模式：主語＋動詞（你們吃；孩子哭）。可加疑問：誰想玩？適合填充／看圖寫句。",
      text_en:
        "Subject–predicate mini stems: Subj + Verb (你們吃; 孩子哭). Optional question form 誰想玩？ Useful for fill-blank or picture writing.",
      source: `paraphrase-practice: ${CGW}/Basic_sentence_order`,
      sourceUrl: `${CGW}/Basic_sentence_order`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },
    {
      id: "prac-chi-bi-compare-ks2",
      subject: "chinese",
      kind: "practice",
      topics: ["sentences"],
      band: "KS2",
      years: ["P4", "P5", "P6"],
      text_zh:
        "比較句模式：A 比 B + 形容詞；A 沒有 B + 形容詞；A 跟／和 B 一樣 + 形容詞。填充／改錯：你___我高。",
      text_en:
        "Comparison sentence patterns: A 比 B + Adj; A 沒有 B + Adj; A 跟/和 B 一樣 + Adj. Cloze/error-fix stems such as 你___我高.",
      source: `paraphrase-practice: ${CGW}/Comparing`,
      sourceUrl: `${CGW}/Comparing`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },
    {
      id: "prac-chi-zui-geng-ks2",
      subject: "chinese",
      kind: "practice",
      topics: ["vocab", "sentences"],
      band: "KS2",
      text_zh:
        "程度比較詞：最＋形容詞（誰最有錢？）；更＋形容詞（更簡單）。閱讀／選擇題可用來辨認比較焦點。",
      text_en:
        "Degree markers: 最+Adj (誰最有錢？); 更+Adj (更簡單). Reading/MC can ask which option carries the comparison focus.",
      source: `paraphrase-practice: ${CGW}/Comparing`,
      sourceUrl: `${CGW}/Comparing`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },
    {
      id: "prac-chi-mw-reading-ks1",
      subject: "chinese",
      kind: "practice",
      topics: ["reading"],
      band: "KS1",
      text_zh:
        "閱讀理解小題模式：短文含數個「數詞＋量詞＋名詞」短語，題目問「共有幾___？」或圈出正確量詞。勿抄長篇課文。",
      text_en:
        "Reading mini-stem: a short paragraph with several numeral+classifier+noun phrases; ask 「共有幾___？」 or circle the correct classifier. Keep passages short.",
      source: `paraphrase-practice: ${CGW}/Measure_words`,
      sourceUrl: `${CGW}/Measure_words`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },
    {
      id: "prac-chi-compare-reading-ks2",
      subject: "chinese",
      kind: "practice",
      topics: ["reading", "sentences"],
      band: "KS2",
      text_zh:
        "閱讀比較資訊：文中出現「比／沒有／一樣／最」，題目問誰較高／哪個最……考查抓比較關係，非全文默寫。",
      text_en:
        "Reading for comparison cues (比/沒有/一樣/最): ask who is taller / which is 最…. Probe relation tracking, not verbatim recall.",
      source: `paraphrase-practice: ${CGW}/Comparing`,
      sourceUrl: `${CGW}/Comparing`,
      license: "CC BY-NC-SA 3.0 (AllSet Learning Chinese Grammar Wiki)",
    },

    // ——— English (EDB vocab package — non-profit educational duplication) ———
    {
      id: "prac-eng-paradigmatic-sports",
      subject: "english",
      kind: "practice",
      topics: ["vocabulary"],
      band: "KS1",
      years: ["P1", "P2", "P3"],
      text_en:
        "Paradigmatic vocab tree pattern (EDB Sports unit): sports → water sports / ball games / track and field → specific items (swimming, football, running). Item type: sort words into a tree or match hypernym→hyponym.",
      text_zh:
        "詞彙樹狀分類模式（EDB 運動單元）：sports → water sports／ball games／track and field → 具體項目。題型：分類或上位詞→下位詞配對。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-ing-ed-adj",
      subject: "english",
      kind: "practice",
      topics: ["grammar", "vocabulary"],
      band: "KS1",
      text_en:
        "Adjective form cloze: use -ing adjectives for activities (exciting, tiring, boring) and -ed for feelings (excited, tired, bored). Stem: 'I am ___ as I won the race' / 'Basketball is ___'.",
      text_zh:
        "形容詞形式填空：-ing 形容活動，-ed 形容感受。例：I am ___ as I won the race／Basketball is ___。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-make-me-collocation",
      subject: "english",
      kind: "practice",
      topics: ["vocabulary", "grammar"],
      band: "KS1",
      text_en:
        "Collocation stem: make me + adjective (fit / strong / healthy / tall). Complete: 'Swimming can ___.' Probe fixed phrase, not free translation.",
      text_zh:
        "固定搭配：make me + adjective（fit／strong／healthy）。完成句：Swimming can ___。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-compounding",
      subject: "english",
      kind: "practice",
      topics: ["vocabulary"],
      band: "KS1",
      text_en:
        "Word-formation pattern: compounding (foot+ball=football; basket+ball=basketball). Item: join two nouns or choose the compound that names a sport.",
      text_zh:
        "構詞模式：複合詞 foot+ball=football。題型：拼合兩詞或選出運動名稱。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-syntagmatic-place",
      subject: "english",
      kind: "practice",
      topics: ["vocabulary", "grammar"],
      band: "KS1",
      text_en:
        "Syntagmatic table: Who + What + Where — 'We play tennis on a tennis court'; 'He plays football on a football field.' Cloze one column or match activity↔facility.",
      text_zh:
        "橫向搭配表：人物＋活動＋地點（play tennis on a tennis court）。填一欄或活動↔場地配對。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-reading-letter",
      subject: "english",
      kind: "practice",
      topics: ["reading"],
      band: "KS1",
      years: ["P2", "P3"],
      text_en:
        "Reading pattern: short suggestion letter (Dear… / I suggest building… / Best regards). MC or short answer: who wrote it, what facility is suggested, why (healthy/popular/missing facility).",
      text_zh:
        "閱讀模式：簡短信函（建議興建設施）。題目：作者、建議設施、原因（健康／受歡迎／學校欠缺）。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-shapes-instructions",
      subject: "english",
      kind: "practice",
      topics: ["vocabulary", "grammar"],
      band: "KS1",
      text_en:
        "Shapes + imperatives pattern (We Can Make Things): triangle/rectangle/oval/heart; First,/Then,/Next,/Lastly, + verb (fold, glue, decorate). Order-the-steps or fill connective.",
      text_zh:
        "形狀＋祈使句步驟（手工單元）：First/Then/Next/Lastly + fold/glue/decorate。排序或填連接詞。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-hk-itinerary-ks2",
      subject: "english",
      kind: "practice",
      topics: ["vocabulary", "reading"],
      band: "KS2",
      years: ["P4", "P5", "P6"],
      text_en:
        "KS2 itinerary pattern (We Love Hong Kong): place + activity + transport columns (Ocean Park → watch the dolphin show → by bus). Future tense 'We will…'; sequence First/Then/After that. Reading: match spot↔activity.",
      text_zh:
        "KS2 行程表模式：地點＋活動＋交通；將來式 We will…；順序連接詞。閱讀：景點↔活動配對。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-eng-synonym-adj-ks2",
      subject: "english",
      kind: "practice",
      topics: ["vocabulary", "grammar"],
      band: "KS2",
      text_en:
        "Synonym adjective sets for places/activities: wonderful≈attractive≈fantastic; well-known≈famous; giant≈big. Cloze or 'which word has a similar meaning' MC in a short diary/itinerary text.",
      text_zh:
        "近義形容詞組：wonderful≈fantastic；well-known≈famous。短日記／行程文中選近義詞。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },

    // ——— Maths (Illustrative Mathematics, CC BY-NC-SA 4.0) ———
    {
      id: "prac-maths-share-lunches",
      subject: "maths",
      kind: "practice",
      topics: ["fractions", "word-problems"],
      band: "KS2",
      years: ["P5", "P6"],
      text_en:
        "Equal-sharing stem (IM Sharing Lunches): n people share m wholes equally → each gets m/n. Ask for a diagram, then write both addition (a/b+a/b+…=m) and multiplication (k×a/b=m) equations for the same situation.",
      text_zh:
        "平均分配題幹：n 人平分 m 個整體 → 每人 m/n。先畫圖，再用加法式與乘法式表示同一情境。",
      source: `paraphrase-practice: ${IM}/content-standards/NF/5/B/3/tasks/2074`,
      sourceUrl: `${IM}/content-standards/NF/5/B/3/tasks/2074`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },
    {
      id: "prac-maths-fraction-as-division",
      subject: "maths",
      kind: "practice",
      topics: ["fractions", "word-problems"],
      band: "KS2",
      years: ["P5", "P6"],
      text_en:
        "Fraction-as-division pattern: whole ÷ people = fraction share (e.g. 2÷3=2/3). Pair with 'of each whole' view (2×1/3=2/3). One stem, two equation forms.",
      text_zh:
        "分數即除法：整數÷人數＝每份分數（2÷3=2/3），並對應 2×1/3=2/3。同一題幹兩種算式。",
      source: `paraphrase-practice: ${IM}/content-standards/NF/5/B/3/tasks/2074`,
      sourceUrl: `${IM}/content-standards/NF/5/B/3/tasks/2074`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },
    {
      id: "prac-maths-tenths-hundredths",
      subject: "maths",
      kind: "practice",
      topics: ["decimals"],
      band: "KS2",
      years: ["P4", "P5"],
      text_en:
        "Decimal place-value stem (IM How Many Tenths and Hundredths?): finish equations like '1 tenth + 4 hundredths = ___ hundredths' and '80 hundredths = ___ tenths'. Emphasise bundling and order of addends.",
      text_zh:
        "小數位值填空：1 tenth + 4 hundredths = ___ hundredths；80 hundredths = ___ tenths。強調單位換算與加數次序。",
      source: `practice: ${IM}/content-standards/NF/4/C/6/tasks/103`,
      sourceUrl: `${IM}/content-standards/NF/4/C/6/tasks/103`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },
    {
      id: "prac-maths-equiv-laps",
      subject: "maths",
      kind: "practice",
      topics: ["fractions"],
      band: "KS2",
      years: ["P4", "P5"],
      text_en:
        "Equivalent-fraction comparison stem (IM Running Laps style): compare distances like 1/4 mile and 3/12 mile; justify equality via common denominators or simplifying. MC or short reason.",
      text_zh:
        "等值分數比較：如 1/4 與 3/12 哩；用通分或約分說明相等。選擇或簡述理由。",
      source: `paraphrase-practice: ${IM}/content-standards/4/NF/A/tasks/971`,
      sourceUrl: `${IM}/content-standards/4/NF/A/tasks/971`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },
    {
      id: "prac-maths-unlike-add",
      subject: "maths",
      kind: "practice",
      topics: ["fractions"],
      band: "KS2",
      years: ["P5", "P6"],
      text_en:
        "Unlike-denominator addition pattern: rewrite with a common denominator before adding; keep answers in simplest form. Stem can be pure computation or a short story needing a/b + c/d.",
      text_zh:
        "異分母加法模式：先通分再加，答案約至最簡。可純計算或短應用題需 a/b+c/d。",
      source: `paraphrase-practice: ${IM}/content-standards/NF/5/A/1/tasks/855`,
      sourceUrl: `${IM}/content-standards/NF/5/A/1/tasks/855`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },
    {
      id: "prac-maths-fraction-of-quantity",
      subject: "maths",
      kind: "practice",
      topics: ["fractions", "word-problems"],
      band: "KS2",
      years: ["P4", "P5", "P6"],
      text_en:
        "Fraction-of-a-quantity word-problem pattern: 'find a/b of N' (of operator). Prefer HK-flavoured everyday units (pages, dollars, minutes) but keep numbers small; ask for working.",
      text_zh:
        "求幾分之幾應用題：求 N 的 a/b。宜用日常單位（頁、元、分鐘），數字宜小，要求列式。",
      source: `paraphrase-practice: ${IM}/content-standards/NF/5/B/3/tasks/2074`,
      sourceUrl: `${IM}/content-standards/NF/5/B/3/tasks/2074`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },
    {
      id: "prac-maths-decimal-order",
      subject: "maths",
      kind: "practice",
      topics: ["decimals"],
      band: "KS2",
      years: ["P4", "P5"],
      text_en:
        "Decimal comparison/ordering pattern tied to tenths–hundredths: rewrite 0.6 and 0.62 as hundredths before comparing; warn that digit position matters (5 tenths+2 hundredths ≠ 5 hundredths+2 tenths).",
      text_zh:
        "小數比較／排序：先化成百分之一再比；提醒數位重要（5 tenths+2 hundredths ≠ 5 hundredths+2 tenths）。",
      source: `paraphrase-practice: ${IM}/content-standards/NF/4/C/6/tasks/103`,
      sourceUrl: `${IM}/content-standards/NF/4/C/6/tasks/103`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },
    {
      id: "prac-maths-multi-rep-wp",
      subject: "maths",
      kind: "practice",
      topics: ["word-problems", "fractions"],
      band: "KS2",
      text_en:
        "Multi-representation word-problem pattern: one everyday share/join situation → (1) diagram, (2) addition equation, (3) multiplication or division equation. Mark partial credit if only one form is correct.",
      text_zh:
        "多元表征應用題：同一分配／合併情境 → 圖示＋加法式＋乘／除法式。只對一種形式可給部分分。",
      source: `paraphrase-practice: ${IM}/content-standards/NF/5/B/3/tasks/2074`,
      sourceUrl: `${IM}/content-standards/NF/5/B/3/tasks/2074`,
      license: "CC BY-NC-SA 4.0 (Illustrative Mathematics)",
    },

    // ——— GS: nature-science (CC BY pollution worksheet) + community/health from EDB vocab themes ———
    {
      id: "prac-gs-river-pollution-sources",
      subject: "gs",
      kind: "practice",
      topics: ["nature-science"],
      band: "KS2",
      years: ["P4", "P5", "P6"],
      text_en:
        "Nature–science practice stem (CC BY river pollution resource): classify pollution sources — sewage/wastewater, urban runoff, farming chemicals/fertilisers. Item: match source→effect on freshwater / sort cards into human-impact categories.",
      text_zh:
        "自然科練習模式（河流污染 CC BY）：分類污染來源——污水、市區徑流、農藥／肥料。配對來源→淡水影響或卡片分類。",
      source: `paraphrase-practice: ${POLLUTION}`,
      sourceUrl: POLLUTION,
      license: "CC BY 4.0 (Earthwatch / ProBleu worksheet)",
    },
    {
      id: "prac-gs-water-quality-debate",
      subject: "gs",
      kind: "practice",
      topics: ["nature-science", "community"],
      band: "KS2",
      text_en:
        "Issue-discussion stem: for/against chemical fertiliser use near rivers — list one benefit (crop yield) and one risk (nutrient pollution, algal blooms). Short written or MC justification.",
      text_zh:
        "議題討論：贊成／反對河邊使用化肥——各列一項好處（產量）與風險（營養污染、藻華）。短答或選擇理由。",
      source: `paraphrase-practice: ${POLLUTION}`,
      sourceUrl: POLLUTION,
      license: "CC BY 4.0 (Earthwatch / ProBleu worksheet)",
    },
    {
      id: "prac-gs-freshwater-keywords",
      subject: "gs",
      kind: "practice",
      topics: ["nature-science"],
      band: "KS1",
      years: ["P2", "P3"],
      text_en:
        "Keyword matching (ages ~7–11 freshwater OER): river / water quality / pollution / plastic / protection. Picture–word or 'which action protects rivers' (reduce litter, care with chemicals).",
      text_zh:
        "關鍵詞配對：河流／水質／污染／塑膠／保護。圖詞配對或選出護河行動（少丟垃圾、慎用化學品）。",
      source: `paraphrase-practice: ${POLLUTION}`,
      sourceUrl: POLLUTION,
      license: "CC BY 4.0 (Earthwatch / ProBleu worksheet)",
    },
    {
      id: "prac-gs-community-scenic",
      subject: "gs",
      kind: "practice",
      topics: ["community"],
      band: "KS2",
      years: ["P4", "P5"],
      text_en:
        "Community places pattern (from EDB HK itinerary L&T theme): match local facilities/scenic categories — heritage/museum tour, nature tour, shopping/dining — to example spots and what people do there. Probe community services, not tourist trivia alone.",
      text_zh:
        "社區／本地地方模式（EDB 行程主題）：文化古蹟／自然／購物餐飲類行程與活動配對。著重社區設施功能。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-gs-transport-community",
      subject: "gs",
      kind: "practice",
      topics: ["community"],
      band: "KS1",
      text_en:
        "Community transport pattern: group public transport (bus, MTR, tram, ferry, Peak Tram) and link to everyday journeys (home→school, park visit). Item: choose suitable transport for a short scenario.",
      text_zh:
        "社區交通模式：巴士／港鐵／電車／渡輪等，連繫日常出行。情境題選合適交通工具。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-gs-healthy-sport-adj",
      subject: "gs",
      kind: "practice",
      topics: ["healthy-living"],
      band: "KS1",
      years: ["P1", "P2", "P3"],
      text_en:
        "Healthy-living vocab pattern (EDB Sports L&T): link activities to health adjectives (healthy, safe, tiring) and reasons ('I like swimming because it is healthy / makes me fit'). Sort safe vs dangerous practices.",
      text_zh:
        "健康生活詞彙（EDB 運動主題）：活動↔健康形容詞；陳述原因（because it is healthy／makes me fit）。分辨安全／危險做法。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-gs-school-facilities-health",
      subject: "gs",
      kind: "practice",
      topics: ["healthy-living", "community"],
      band: "KS1",
      text_en:
        "School facilities & health stem: survey-style items — which facilities support exercise (basketball court, swimming pool); suggest one facility the school needs and give a health reason. Ties personal health to school community.",
      text_zh:
        "校園設施與健康：哪些設施有助運動；建議新增一項並給健康理由。連結個人健康與學校社區。",
      source: `paraphrase-practice: ${EDB_VOCAB}`,
      sourceUrl: EDB_VOCAB,
      license: "EDB non-profit educational duplication with acknowledgement",
    },
    {
      id: "prac-gs-human-impact-ks2",
      subject: "gs",
      kind: "practice",
      topics: ["nature-science", "community"],
      band: "KS2",
      text_en:
        "Human-impact chain: everyday action → pollutant pathway → freshwater effect (e.g. litter→plastic pollution→harm to river life; fertiliser→nutrients→algal blooms). Complete a 3-box cause–effect diagram.",
      text_zh:
        "人為影響鏈：日常行為→污染物路徑→淡水後果（垃圾→塑膠污染；肥料→藻華）。完成三格因果圖。",
      source: `paraphrase-practice: ${POLLUTION}`,
      sourceUrl: POLLUTION,
      license: "CC BY 4.0 (Earthwatch / ProBleu worksheet)",
    },
  ];

  return chunks;
}

function loadExistingChunks() {
  const allPath = join(OUT_DIR, "all.json");
  if (!existsSync(allPath)) {
    throw new Error("Missing data/curriculum/all.json — run curriculum ingest first.");
  }
  const existing = JSON.parse(readFileSync(allPath, "utf8"));
  if (!Array.isArray(existing) || existing.length < 40) {
    throw new Error(`Unexpected all.json size: ${existing?.length}`);
  }
  return existing;
}

function writeChunks(chunks) {
  mkdirSync(OUT_DIR, { recursive: true });
  const bySubject = { chinese: [], english: [], maths: [], gs: [] };
  for (const c of chunks) {
    if (!bySubject[c.subject]) throw new Error(`Unknown subject ${c.subject}`);
    bySubject[c.subject].push(c);
  }
  for (const [subject, list] of Object.entries(bySubject)) {
    const path = join(OUT_DIR, `${subject}.json`);
    writeFileSync(path, JSON.stringify(list, null, 2) + "\n", "utf8");
    console.log(`wrote ${path} (${list.length})`);
  }
  const practice = chunks.filter((c) => c.kind === "practice");
  writeFileSync(
    join(OUT_DIR, "practice.json"),
    JSON.stringify(practice, null, 2) + "\n",
    "utf8",
  );
  console.log(`wrote practice.json (${practice.length})`);

  const allPath = join(OUT_DIR, "all.json");
  writeFileSync(allPath, JSON.stringify(chunks, null, 2) + "\n", "utf8");
  console.log(`wrote ${allPath} (${chunks.length})`);

  const objectiveCount = chunks.filter((c) => c.kind !== "practice").length;
  const manifest = {
    generatedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    objectiveChunkCount: objectiveCount,
    practiceChunkCount: practice.length,
    subjects: Object.fromEntries(
      Object.entries(bySubject).map(([k, v]) => [k, v.length]),
    ),
    sources: {
      curriculumGuides: [
        {
          key: "maths-annex1",
          url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/ma/curr/annex%201.pdf",
        },
        {
          key: "maths-ch4",
          url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/ma/curr/chapter%204_1.pdf",
        },
        {
          key: "chi-lo-2023",
          url: "https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/curriculum-documents/Pri_Chin_Lang_LO_2023.pdf",
        },
        {
          key: "eng-elcg-2025",
          url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/eng-edu/Curriculum%20Document/Pri_ELCG_Primary_1-6_2025.pdf",
        },
        {
          key: "gs-2017",
          url: "https://www.edb.gov.hk/attachment/en/curriculum-development/cross-kla-studies/gs-primary/GSCG_2017_Eng.pdf",
        },
      ],
      practice: PRACTICE_SOURCES_META,
    },
    note: "Objectives/guides + open practice patterns only; no commercial textbooks or HKEAA past papers.",
    skippedCandidates: [
      {
        name: "MathCat printable worksheets (mathcat.fun)",
        reason: "Terms allow personal non-commercial use only; no redistribution / CC licence stated.",
      },
      {
        name: "HappyFree HK maths packs",
        reason: "Licence / third-party rights unclear.",
      },
      {
        name: "EDB Addenda Series worksheets (general edb.gov.hk terms)",
        reason:
          "Site copyright limits redistribution/public dissemination without written authorisation; unlike the English vocab handbook these pages lack an explicit educational-duplication clause we could rely on for repo excerpts.",
      },
      {
        name: "HKEAA past papers / commercial drill books",
        reason: "Explicitly disallowed.",
      },
    ],
  };
  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

function validate(chunks) {
  const ids = new Set();
  for (const c of chunks) {
    if (!c.id || !c.subject || !Array.isArray(c.topics)) {
      throw new Error(`Invalid chunk: ${JSON.stringify(c).slice(0, 120)}`);
    }
    if (ids.has(c.id)) throw new Error(`Duplicate id ${c.id}`);
    ids.add(c.id);
    if (!c.text_zh && !c.text_en) throw new Error(`Chunk ${c.id} has no text`);
    if (!c.source) throw new Error(`Chunk ${c.id} missing source`);
    if (c.kind === "practice") {
      if (!/^practice: |^paraphrase-practice: /.test(c.source)) {
        throw new Error(`Practice chunk ${c.id} bad source prefix: ${c.source}`);
      }
    }
  }
}

function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  if (DO_FETCH) {
    for (const src of FETCH_SOURCES) {
      const dest = join(RAW_DIR, src.file);
      try {
        download(src.url, dest);
        const buf = readFileSync(dest);
        console.log(`  saved ${src.file} (${buf.length} bytes, sha ${sha256(buf)})`);
        if (/\.pdf$/i.test(src.file)) {
          const txt = dest.replace(/\.pdf$/i, ".txt");
          const r = sh("pdftotext", ["-layout", dest, txt]);
          if (r.status === 0) {
            console.log(`  extracted ${txt} (${readFileSync(txt, "utf8").length} chars)`);
          }
        }
      } catch (err) {
        console.warn(`  WARN: ${err.message || err}`);
      }
    }
  } else {
    console.log("skip network fetch (pass --fetch to refresh _raw/practice)");
  }

  const existing = loadExistingChunks();
  // Drop any previous practice chunks so re-runs are idempotent.
  const objectives = existing
    .filter((c) => c.kind !== "practice")
    .map((c) => {
      // Normalise legacy chunks: default kind objective if missing.
      if (!c.kind) return { ...c, kind: "objective" };
      return c;
    });
  const practice = buildPracticeChunks();
  const merged = [...objectives, ...practice];
  validate(merged);
  writeChunks(merged);
  console.log(
    `done. objectives=${objectives.length} practice=${practice.length} total=${merged.length}`,
  );
}

main();
