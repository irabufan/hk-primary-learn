/**
 * Validate shaded-fraction and composite-area diagrams, and lay out
 * Chinese dimension labels so they stay inside the picture and clear of each other.
 *
 * A diagram is attached to a question only when the picture, the lengths written
 * on it, the stem and the keyed answer all describe the same quantity.
 * Anything else is dropped and the question stays text-only.
 */

import { parseNumericAnswer } from "./answers";
import {
  FRACTION_PARTS_MAX,
  FRACTION_PARTS_MIN,
  GRID_COLS_MAX,
  GRID_ROWS_MAX,
  LABELLED_SPAN_MIN,
  LENGTH_MAX,
  LENGTH_MIN,
  type CompositeAreaDiagram,
  type LShapeDiagram,
  type LengthUnit,
  type QuizDiagram,
  type ShadedFractionDiagram,
  type StepDiagram,
} from "./diagram-types";

export type DiagramQuestion = {
  type: string;
  answer: string;
  prompt: { zh?: string; en?: string };
};

const CN_ALT = "十二|十一|十|九|八|七|六|五|四|三|兩|二|一";
const CN_VALUE: Record<string, number> = {
  一: 1,
  二: 2,
  兩: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  十一: 11,
  十二: 12,
};

const FONT = 14;
const TEXT_H = 18;
/** ViewBox units per centimetre or metre. */
const UNIT = 18;
const DIM_OFFSET = 16;
const TEXT_GAP = 12;
const PAD = 14;

export type LabelBox = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

export type GuideLine = { x1: number; y1: number; x2: number; y2: number };

export type CompositeLayout = {
  viewBox: string;
  width: number;
  height: number;
  polygon: string;
  guides: GuideLine[];
  labels: LabelBox[];
};

type Placed = { box: LabelBox; guides: GuideLine[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) return Number(value.trim());
  return undefined;
}

function keysAre(obj: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(obj).every((key) => allowed.includes(key));
}

function bareNumber(raw: string): string {
  return String(raw)
    .trim()
    .replace(/\s*(cm\s*[²2]|m\s*[²2]|平方厘米|平方公分|平方米|sq\.?\s*c?m)\s*$/i, "")
    .trim();
}

function hkPrompt(text: string): string {
  return text.replace(/著/g, "着");
}

function promptText(question: DiagramQuestion): string {
  return hkPrompt(`${question.prompt.zh ?? ""}\n${question.prompt.en ?? ""}`);
}

export function compositeArea(diagram: CompositeAreaDiagram): number {
  switch (diagram.template) {
    case "l-shape":
      return diagram.width * diagram.height - diagram.cutWidth * diagram.cutHeight;
    case "step":
      return diagram.leftWidth * diagram.height + diagram.rightWidth * diagram.rightHeight;
    default: {
      const never: never = diagram;
      return never;
    }
  }
}

export function fractionRegionValue(diagram: ShadedFractionDiagram): number {
  const count = diagram.target === "shaded" ? diagram.shaded : diagram.parts - diagram.shaded;
  return count / diagram.parts;
}

/** Lengths actually written next to the figure, including a split edge. */
export function labelledLengths(diagram: CompositeAreaDiagram): number[] {
  switch (diagram.template) {
    case "l-shape":
      return [
        diagram.width,
        diagram.height,
        diagram.cutWidth,
        diagram.cutHeight,
        diagram.width - diagram.cutWidth,
      ];
    case "step":
      return [diagram.leftWidth, diagram.rightWidth, diagram.height, diagram.rightHeight];
    default: {
      const never: never = diagram;
      return never;
    }
  }
}

function lengthOk(value: number | undefined): value is number {
  return value !== undefined && value >= LENGTH_MIN && value <= LENGTH_MAX;
}

function parseFractionDiagram(row: Record<string, unknown>): ShadedFractionDiagram | undefined {
  if (!keysAre(row, ["kind", "shape", "parts", "shaded", "target", "rows", "cols"])) return undefined;
  if (row.kind !== "shaded-fraction") return undefined;
  if (row.shape !== "bar" && row.shape !== "circle" && row.shape !== "grid") return undefined;
  if (row.target !== "shaded" && row.target !== "unshaded") return undefined;
  const parts = asInt(row.parts);
  const shaded = asInt(row.shaded);
  if (parts === undefined || shaded === undefined) return undefined;
  if (parts < FRACTION_PARTS_MIN || parts > FRACTION_PARTS_MAX) return undefined;
  if (shaded < 1 || shaded > parts - 1) return undefined;

  if (row.shape === "grid") {
    const rows = asInt(row.rows);
    const cols = asInt(row.cols);
    if (rows === undefined || cols === undefined) return undefined;
    if (rows < 1 || rows > GRID_ROWS_MAX || cols < 1 || cols > GRID_COLS_MAX) return undefined;
    if (rows * cols !== parts) return undefined;
    return { kind: "shaded-fraction", shape: "grid", parts, shaded, target: row.target, rows, cols };
  }

  if (row.rows !== undefined || row.cols !== undefined) return undefined;
  return { kind: "shaded-fraction", shape: row.shape, parts, shaded, target: row.target };
}

function parseLShape(row: Record<string, unknown>): LShapeDiagram | undefined {
  if (
    !keysAre(row, ["kind", "template", "unit", "width", "height", "cutWidth", "cutHeight", "cutCorner"])
  ) {
    return undefined;
  }
  if (row.unit !== "cm" && row.unit !== "m") return undefined;
  if (
    row.cutCorner !== "top-right" &&
    row.cutCorner !== "top-left" &&
    row.cutCorner !== "bottom-right" &&
    row.cutCorner !== "bottom-left"
  ) {
    return undefined;
  }
  const width = asInt(row.width);
  const height = asInt(row.height);
  const cutWidth = asInt(row.cutWidth);
  const cutHeight = asInt(row.cutHeight);
  if (!lengthOk(width) || !lengthOk(height) || !lengthOk(cutWidth) || !lengthOk(cutHeight)) return undefined;
  if (cutWidth < LABELLED_SPAN_MIN || width - cutWidth < LABELLED_SPAN_MIN) return undefined;
  if (height - cutHeight < LENGTH_MIN) return undefined;
  return {
    kind: "composite-area",
    template: "l-shape",
    unit: row.unit,
    width,
    height,
    cutWidth,
    cutHeight,
    cutCorner: row.cutCorner,
  };
}

function parseStep(row: Record<string, unknown>): StepDiagram | undefined {
  if (!keysAre(row, ["kind", "template", "unit", "leftWidth", "rightWidth", "height", "rightHeight"])) {
    return undefined;
  }
  if (row.unit !== "cm" && row.unit !== "m") return undefined;
  const leftWidth = asInt(row.leftWidth);
  const rightWidth = asInt(row.rightWidth);
  const height = asInt(row.height);
  const rightHeight = asInt(row.rightHeight);
  if (!lengthOk(leftWidth) || !lengthOk(rightWidth) || !lengthOk(height) || !lengthOk(rightHeight)) {
    return undefined;
  }
  if (leftWidth < LABELLED_SPAN_MIN || rightWidth < LABELLED_SPAN_MIN) return undefined;
  if (leftWidth + rightWidth > 16) return undefined;
  if (height - rightHeight < LENGTH_MIN) return undefined;
  return {
    kind: "composite-area",
    template: "step",
    unit: row.unit,
    leftWidth,
    rightWidth,
    height,
    rightHeight,
  };
}

/** Structural parse only. Returns undefined for missing, foreign, or out-of-range data. */
export function parseDiagram(raw: unknown): QuizDiagram | undefined {
  if (!isRecord(raw)) return undefined;
  if (raw.kind === "shaded-fraction") return parseFractionDiagram(raw);
  if (raw.kind === "composite-area" && raw.template === "l-shape") return parseLShape(raw);
  if (raw.kind === "composite-area" && raw.template === "step") return parseStep(raw);
  return undefined;
}

function regionCues(prompt: string): { shaded: boolean; unshaded: boolean } {
  const unshaded =
    /沒有着色|未着色|未塗色|沒有塗色|空白部分|unshaded|not shaded/i.test(prompt);
  const stripped = prompt.replace(/沒有着色|未着色|未塗色|沒有塗色|空白部分|unshaded|not shaded/gi, "");
  const shaded = /着色|塗色|塗上|陰影|shaded/i.test(stripped);
  return { shaded, unshaded };
}

function mentionedPartCounts(prompt: string): number[] {
  const found: number[] = [];
  for (const match of prompt.matchAll(/(?:分成|分為|divided into|split into)\s*(\d+)/gi)) {
    found.push(Number(match[1]));
  }
  const cn = new RegExp(`(?:分成|分為)\\s*(${CN_ALT})\\s*(?:個)?等份`, "g");
  for (const match of prompt.matchAll(cn)) {
    const value = CN_VALUE[match[1] ?? ""];
    if (value !== undefined) found.push(value);
  }
  return found;
}

function fractionValuesInPrompt(prompt: string): number[] {
  const found: number[] = [];
  for (const match of prompt.matchAll(/(\d+)\s*\/\s*(\d+)/g)) {
    const denom = Number(match[2]);
    if (denom !== 0) found.push(Number(match[1]) / denom);
  }
  const cn = new RegExp(`(${CN_ALT})分之(${CN_ALT})`, "g");
  for (const match of prompt.matchAll(cn)) {
    const denom = CN_VALUE[match[1] ?? ""];
    const numer = CN_VALUE[match[2] ?? ""];
    if (denom && numer) found.push(numer / denom);
  }
  return found;
}

function explicitRegionCounts(prompt: string): { shaded: number[]; blank: number[] } {
  const shaded: number[] = [];
  const blank: number[] = [];
  const shadedRe =
    /(\d+)\s*(?:個)?(?:等份|份|格|扇形|parts?)?\s*(?:已)?(?:着色|塗色|shaded)|(?:着色|塗色|shaded)\s*(?:了|parts?)?\s*(\d+)/gi;
  for (const match of prompt.matchAll(shadedRe)) {
    shaded.push(Number(match[1] ?? match[2]));
  }
  const blankRe =
    /(\d+)\s*(?:個)?(?:等份|份|格|扇形|parts?)?\s*(?:沒有着色|未着色|空白)|(?:沒有着色|未着色|空白(?:部分)?)\s*(?:有|了|的)?\s*(\d+)/gi;
  for (const match of prompt.matchAll(blankRe)) {
    blank.push(Number(match[1] ?? match[2]));
  }
  return { shaded, blank };
}

function close(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

function fractionAgrees(diagram: ShadedFractionDiagram, question: DiagramQuestion): boolean {
  const answer = parseNumericAnswer(bareNumber(question.answer));
  if (answer === null || !close(answer, fractionRegionValue(diagram))) return false;

  const prompt = promptText(question);
  const cues = regionCues(prompt);
  if (diagram.target === "shaded" && (!cues.shaded || cues.unshaded)) return false;
  if (diagram.target === "unshaded" && (!cues.unshaded || cues.shaded)) return false;

  if (mentionedPartCounts(prompt).some((count) => count !== diagram.parts)) return false;

  const shadedRatio = diagram.shaded / diagram.parts;
  const blankRatio = (diagram.parts - diagram.shaded) / diagram.parts;
  if (fractionValuesInPrompt(prompt).some((value) => !close(value, shadedRatio) && !close(value, blankRatio))) {
    return false;
  }

  const counts = explicitRegionCounts(prompt);
  if (counts.shaded.some((count) => count !== diagram.shaded)) return false;
  if (counts.blank.some((count) => count !== diagram.parts - diagram.shaded)) return false;
  return true;
}

const CM_WORD = /厘米|平方厘米|\bcm\b|centimetres?/i;
const CM_WORD_G = /厘米|平方厘米|\bcm\b|centimetres?/gi;

function unitCue(prompt: string): LengthUnit | "both" | "none" {
  const hasCm = CM_WORD.test(prompt);
  const withoutCm = prompt.replace(CM_WORD_G, "");
  const hasM = /平方米|(?<![厘平])米|(?<![a-z])metres?|(?<![a-z])m(?![a-z])/i.test(withoutCm);
  if (hasCm && hasM) return "both";
  if (hasCm) return "cm";
  if (hasM) return "m";
  return "none";
}

function lengthNumbers(prompt: string, unit: LengthUnit): number[] {
  const source = unit === "cm" ? prompt : prompt.replace(CM_WORD_G, "");
  const pattern =
    unit === "cm"
      ? /(\d+(?:\.\d+)?)\s*(?:厘米|cm|centimetres?)(?![a-z²2])/gi
      : /(\d+(?:\.\d+)?)\s*(?:米|m|metres?)(?![a-z²2])/gi;
  const found: number[] = [];
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    const before = source.slice(Math.max(0, index - 6), index);
    if (/平方\s*$/.test(before)) continue;
    found.push(Number(match[1]));
  }
  return found;
}

function statedAreas(prompt: string): number[] {
  const found: number[] = [];
  const pattern = /面積(?:是|為|等於)?\s*(\d+(?:\.\d+)?)|area\s+is\s*(\d+(?:\.\d+)?)/gi;
  for (const match of prompt.matchAll(pattern)) {
    found.push(Number(match[1] ?? match[2]));
  }
  return found;
}

function multisetCovers(labels: number[], mentioned: number[]): boolean {
  const have = new Map<number, number>();
  for (const value of labels) have.set(value, (have.get(value) ?? 0) + 1);
  for (const value of mentioned) {
    const left = have.get(value) ?? 0;
    if (left < 1) return false;
    have.set(value, left - 1);
  }
  return true;
}

function areaAgrees(diagram: CompositeAreaDiagram, question: DiagramQuestion): boolean {
  const answer = parseNumericAnswer(bareNumber(question.answer));
  const area = compositeArea(diagram);
  if (answer === null || !close(answer, area)) return false;

  // Check each language on its own so a bilingual stem does not count every length twice.
  const texts = [question.prompt.zh, question.prompt.en]
    .filter((text): text is string => Boolean(text?.trim()))
    .map(hkPrompt);
  const labels = labelledLengths(diagram);
  for (const text of texts) {
    const cue = unitCue(text);
    if (cue === "both" || (cue !== "none" && cue !== diagram.unit)) return false;
    if (cue !== "none" && !multisetCovers(labels, lengthNumbers(text, diagram.unit))) return false;
    if (statedAreas(text).some((value) => !close(value, area))) return false;
  }
  return true;
}

function agrees(diagram: QuizDiagram, question: DiagramQuestion): boolean {
  switch (diagram.kind) {
    case "shaded-fraction":
      return fractionAgrees(diagram, question);
    case "composite-area":
      return areaAgrees(diagram, question);
    default: {
      const never: never = diagram;
      return never;
    }
  }
}

/**
 * Diagram to render for this question, or undefined when the payload is
 * missing, out of bounds, or disagrees with the stem or answer.
 */
export function diagramForQuestion(raw: unknown, question: DiagramQuestion): QuizDiagram | undefined {
  if (question.type !== "mc" && question.type !== "fill" && question.type !== "number") return undefined;
  const diagram = parseDiagram(raw);
  if (!diagram || !agrees(diagram, question)) return undefined;
  const area = diagram.kind === "composite-area" ? compositeArea(diagram) : null;
  const text = `${diagramAccessibleText(diagram, "zh-HK")}\n${diagramAccessibleText(diagram, "en")}`;
  if (accessibleTextLeaksAnswer(text, question.answer, area)) return undefined;
  return diagram;
}

export function withValidatedDiagram<Q extends DiagramQuestion>(question: Q, raw: unknown): Q & { diagram?: QuizDiagram } {
  const diagram = diagramForQuestion(raw, question);
  if (!diagram) return question;
  return { ...question, diagram };
}

function unitWord(unit: LengthUnit, locale: "en" | "zh-HK"): string {
  if (locale === "en") return unit === "cm" ? "cm" : "m";
  return unit === "cm" ? "厘米" : "米";
}

function dimensionPhrase(value: number, unit: LengthUnit, locale: "en" | "zh-HK"): string {
  return `${value} ${unitWord(unit, locale)}`;
}

export function diagramAccessibleText(diagram: QuizDiagram, locale: "en" | "zh-HK"): string {
  switch (diagram.kind) {
    case "shaded-fraction":
      return fractionAccessibleText(diagram, locale);
    case "composite-area":
      return compositeAccessibleText(diagram, locale);
    default: {
      const never: never = diagram;
      return never;
    }
  }
}

function fractionAccessibleText(diagram: ShadedFractionDiagram, locale: "en" | "zh-HK"): string {
  if (locale === "en") {
    switch (diagram.shape) {
      case "bar":
        return `A rectangle divided into ${diagram.parts} equal parts. The first ${diagram.shaded} parts from the left are shaded.`;
      case "circle":
        return `A circle divided into ${diagram.parts} equal sectors. Counting clockwise from the top, the first ${diagram.shaded} sectors are shaded.`;
      case "grid":
        return `A grid of ${diagram.rows} rows and ${diagram.cols} columns. Counting from left to right and top to bottom, the first ${diagram.shaded} cells are shaded.`;
      default: {
        const never: never = diagram.shape;
        return never;
      }
    }
  }
  switch (diagram.shape) {
    case "bar":
      return `長方形分成 ${diagram.parts} 個等份，由左至右首 ${diagram.shaded} 個等份已着色。`;
    case "circle":
      return `圓形分成 ${diagram.parts} 個相等扇形，由正上方順時針數，首 ${diagram.shaded} 個扇形已着色。`;
    case "grid":
      return `方格共 ${diagram.rows} 行 ${diagram.cols} 列，由左至右、由上至下首 ${diagram.shaded} 格已着色。`;
    default: {
      const never: never = diagram.shape;
      return never;
    }
  }
}

function compositeAccessibleText(diagram: CompositeAreaDiagram, locale: "en" | "zh-HK"): string {
  const unit = diagram.unit;
  if (diagram.template === "l-shape") {
    const corner =
      locale === "en"
        ? {
            "top-right": "top-right",
            "top-left": "top-left",
            "bottom-right": "bottom-right",
            "bottom-left": "bottom-left",
          }[diagram.cutCorner]
        : {
            "top-right": "右上角",
            "top-left": "左上角",
            "bottom-right": "右下角",
            "bottom-left": "左下角",
          }[diagram.cutCorner];
    if (locale === "en") {
      return `An L-shaped figure. The outer width is ${dimensionPhrase(diagram.width, unit, locale)} and the outer height is ${dimensionPhrase(diagram.height, unit, locale)}. A ${dimensionPhrase(diagram.cutWidth, unit, locale)} by ${dimensionPhrase(diagram.cutHeight, unit, locale)} rectangle is missing from the ${corner} corner.`;
    }
    return `L 形圖。外圍橫向 ${dimensionPhrase(diagram.width, unit, locale)}，外圍縱向 ${dimensionPhrase(diagram.height, unit, locale)}，${corner}缺去橫向 ${dimensionPhrase(diagram.cutWidth, unit, locale)}、縱向 ${dimensionPhrase(diagram.cutHeight, unit, locale)} 的長方形。`;
  }
  if (locale === "en") {
    return `A step made of two rectangles. The left rectangle is ${dimensionPhrase(diagram.leftWidth, unit, locale)} wide and ${dimensionPhrase(diagram.height, unit, locale)} tall. The right rectangle is ${dimensionPhrase(diagram.rightWidth, unit, locale)} wide and ${dimensionPhrase(diagram.rightHeight, unit, locale)} tall.`;
  }
  return `階梯形，由兩個長方形拼成。左面長方形闊 ${dimensionPhrase(diagram.leftWidth, unit, locale)}、高 ${dimensionPhrase(diagram.height, unit, locale)}；右面長方形闊 ${dimensionPhrase(diagram.rightWidth, unit, locale)}、高 ${dimensionPhrase(diagram.rightHeight, unit, locale)}。`;
}

/** True when the accessible text states the keyed fraction or the computed area. */
export function accessibleTextLeaksAnswer(text: string, answer: string, area: number | null): boolean {
  const compact = text.replace(/\s+/g, "");
  const keyed = answer.replace(/\s+/g, "");
  if (keyed.includes("/") && compact.includes(keyed)) return true;
  if (/答案|面積(?:是|為|等於)|area is/i.test(text)) return true;
  if (area !== null && new RegExp(`(?<![\\d.])${area}(?![\\d.])`).test(text)) return true;
  return false;
}

function textWidth(text: string): number {
  let width = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x2e80) width += FONT;
    else if (ch === " ") width += FONT * 0.35;
    else width += FONT * 0.62;
  }
  return Math.ceil(width + 4);
}

function labelText(value: number, unit: LengthUnit): string {
  return `${value} ${unit === "cm" ? "厘米" : "米"}`;
}

function horizontalLabel(
  text: string,
  x1: number,
  x2: number,
  edgeY: number,
  side: "top" | "bottom",
): Placed {
  const width = textWidth(text);
  const dir = side === "top" ? -1 : 1;
  const lineY = edgeY + dir * DIM_OFFSET;
  const cy = lineY + dir * (TEXT_GAP + TEXT_H / 2);
  const cx = (x1 + x2) / 2;
  return {
    box: { text, cx, cy, w: width, h: TEXT_H, x: cx - width / 2, y: cy - TEXT_H / 2 },
    guides: [
      { x1, y1: edgeY, x2: x1, y2: lineY },
      { x1: x2, y1: edgeY, x2, y2: lineY },
      { x1, y1: lineY, x2, y2: lineY },
    ],
  };
}

function verticalLabel(
  text: string,
  y1: number,
  y2: number,
  edgeX: number,
  side: "left" | "right",
): Placed {
  const width = textWidth(text);
  const dir = side === "left" ? -1 : 1;
  const lineX = edgeX + dir * DIM_OFFSET;
  const cx = lineX + dir * (TEXT_GAP + width / 2);
  const cy = (y1 + y2) / 2;
  return {
    box: { text, cx, cy, w: width, h: TEXT_H, x: cx - width / 2, y: cy - TEXT_H / 2 },
    guides: [
      { x1: edgeX, y1, x2: lineX, y2: y1 },
      { x1: edgeX, y1: y2, x2: lineX, y2 },
      { x1: lineX, y1, x2: lineX, y2 },
    ],
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function finalize(points: Array<[number, number]>, placed: Placed[]): CompositeLayout {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const consider = (x: number, y: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  for (const [x, y] of points) consider(x, y);
  for (const item of placed) {
    consider(item.box.x, item.box.y);
    consider(item.box.x + item.box.w, item.box.y + item.box.h);
    for (const guide of item.guides) {
      consider(guide.x1, guide.y1);
      consider(guide.x2, guide.y2);
    }
  }
  const dx = PAD - minX;
  const dy = PAD - minY;
  const shift = (x: number, y: number): [number, number] => [x + dx, y + dy];
  const moved = points.map(([x, y]) => shift(x, y));
  const labels = placed.map((item) => {
    const [x, y] = shift(item.box.x, item.box.y);
    const [cx, cy] = shift(item.box.cx, item.box.cy);
    return { ...item.box, x, y, cx, cy };
  });
  const guides = placed.flatMap((item) =>
    item.guides.map((guide) => {
      const [x1, y1] = shift(guide.x1, guide.y1);
      const [x2, y2] = shift(guide.x2, guide.y2);
      return { x1, y1, x2, y2 };
    }),
  );
  const width = round(maxX + dx + PAD);
  const height = round(maxY + dy + PAD);
  return {
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    polygon: moved.map(([x, y]) => `${round(x)},${round(y)}`).join(" "),
    guides: guides.map((guide) => ({
      x1: round(guide.x1),
      y1: round(guide.y1),
      x2: round(guide.x2),
      y2: round(guide.y2),
    })),
    labels: labels.map((label) => ({
      ...label,
      x: round(label.x),
      y: round(label.y),
      cx: round(label.cx),
      cy: round(label.cy),
      w: round(label.w),
      h: round(label.h),
    })),
  };
}

function lPoints(diagram: LShapeDiagram): Array<[number, number]> {
  const width = diagram.width * UNIT;
  const height = diagram.height * UNIT;
  const cutWidth = diagram.cutWidth * UNIT;
  const cutHeight = diagram.cutHeight * UNIT;
  switch (diagram.cutCorner) {
    case "top-right":
      return [
        [0, 0],
        [width - cutWidth, 0],
        [width - cutWidth, cutHeight],
        [width, cutHeight],
        [width, height],
        [0, height],
      ];
    case "top-left":
      return [
        [cutWidth, 0],
        [width, 0],
        [width, height],
        [0, height],
        [0, cutHeight],
        [cutWidth, cutHeight],
      ];
    case "bottom-right":
      return [
        [0, 0],
        [width, 0],
        [width, height - cutHeight],
        [width - cutWidth, height - cutHeight],
        [width - cutWidth, height],
        [0, height],
      ];
    case "bottom-left":
      return [
        [0, 0],
        [width, 0],
        [width, height],
        [cutWidth, height],
        [cutWidth, height - cutHeight],
        [0, height - cutHeight],
      ];
    default: {
      const never: never = diagram.cutCorner;
      return never;
    }
  }
}

function lPlaced(diagram: LShapeDiagram): Placed[] {
  const width = diagram.width * UNIT;
  const height = diagram.height * UNIT;
  const cutWidth = diagram.cutWidth * UNIT;
  const cutHeight = diagram.cutHeight * UNIT;
  const fullWidth = labelText(diagram.width, diagram.unit);
  const fullHeight = labelText(diagram.height, diagram.unit);
  const cutW = labelText(diagram.cutWidth, diagram.unit);
  const cutH = labelText(diagram.cutHeight, diagram.unit);
  const rest = labelText(diagram.width - diagram.cutWidth, diagram.unit);
  switch (diagram.cutCorner) {
    case "top-right":
      return [
        horizontalLabel(rest, 0, width - cutWidth, 0, "top"),
        horizontalLabel(cutW, width - cutWidth, width, 0, "top"),
        horizontalLabel(fullWidth, 0, width, height, "bottom"),
        verticalLabel(fullHeight, 0, height, 0, "left"),
        verticalLabel(cutH, 0, cutHeight, width, "right"),
      ];
    case "top-left":
      return [
        horizontalLabel(cutW, 0, cutWidth, 0, "top"),
        horizontalLabel(rest, cutWidth, width, 0, "top"),
        horizontalLabel(fullWidth, 0, width, height, "bottom"),
        verticalLabel(cutH, 0, cutHeight, 0, "left"),
        verticalLabel(fullHeight, 0, height, width, "right"),
      ];
    case "bottom-right":
      return [
        horizontalLabel(fullWidth, 0, width, 0, "top"),
        horizontalLabel(rest, 0, width - cutWidth, height, "bottom"),
        horizontalLabel(cutW, width - cutWidth, width, height, "bottom"),
        verticalLabel(fullHeight, 0, height, 0, "left"),
        verticalLabel(cutH, height - cutHeight, height, width, "right"),
      ];
    case "bottom-left":
      return [
        horizontalLabel(fullWidth, 0, width, 0, "top"),
        horizontalLabel(cutW, 0, cutWidth, height, "bottom"),
        horizontalLabel(rest, cutWidth, width, height, "bottom"),
        verticalLabel(cutH, height - cutHeight, height, 0, "left"),
        verticalLabel(fullHeight, 0, height, width, "right"),
      ];
    default: {
      const never: never = diagram.cutCorner;
      return never;
    }
  }
}

function stepPoints(diagram: StepDiagram): Array<[number, number]> {
  const left = diagram.leftWidth * UNIT;
  const right = diagram.rightWidth * UNIT;
  const height = diagram.height * UNIT;
  const rightHeight = diagram.rightHeight * UNIT;
  const width = left + right;
  return [
    [0, 0],
    [left, 0],
    [left, height - rightHeight],
    [width, height - rightHeight],
    [width, height],
    [0, height],
  ];
}

function stepPlaced(diagram: StepDiagram): Placed[] {
  const left = diagram.leftWidth * UNIT;
  const right = diagram.rightWidth * UNIT;
  const height = diagram.height * UNIT;
  const rightHeight = diagram.rightHeight * UNIT;
  const width = left + right;
  return [
    horizontalLabel(labelText(diagram.leftWidth, diagram.unit), 0, left, height, "bottom"),
    horizontalLabel(labelText(diagram.rightWidth, diagram.unit), left, width, height, "bottom"),
    verticalLabel(labelText(diagram.height, diagram.unit), 0, height, 0, "left"),
    verticalLabel(labelText(diagram.rightHeight, diagram.unit), height - rightHeight, height, width, "right"),
  ];
}

export function layoutComposite(diagram: CompositeAreaDiagram): CompositeLayout {
  switch (diagram.template) {
    case "l-shape":
      return finalize(lPoints(diagram), lPlaced(diagram));
    case "step":
      return finalize(stepPoints(diagram), stepPlaced(diagram));
    default: {
      const never: never = diagram;
      return never;
    }
  }
}

export function boxesOverlap(a: LabelBox, b: LabelBox, gap = 2): boolean {
  return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
}
