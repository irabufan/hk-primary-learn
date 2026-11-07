import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LABELLED_SPAN_MIN,
  LENGTH_MAX,
  LENGTH_MIN,
  type CompositeAreaDiagram,
  type LShapeDiagram,
  type ShadedFractionDiagram,
} from "./diagram-types";
import { DIAGRAM_EXAMPLES } from "./diagram-examples";
import {
  accessibleTextLeaksAnswer,
  boxesOverlap,
  compositeArea,
  diagramAccessibleText,
  diagramForQuestion,
  fractionRegionValue,
  withValidatedDiagram,
  labelledLengths,
  layoutComposite,
  parseDiagram,
  type CompositeLayout,
  type DiagramQuestion,
} from "./diagrams";

function question(partial: Partial<DiagramQuestion> & Pick<DiagramQuestion, "answer" | "prompt">): DiagramQuestion {
  return { type: "number", ...partial };
}

function fraction(over: Partial<ShadedFractionDiagram> = {}): ShadedFractionDiagram {
  return {
    kind: "shaded-fraction",
    shape: "bar",
    parts: 8,
    shaded: 3,
    target: "shaded",
    ...over,
  };
}

function lShape(over: Partial<LShapeDiagram> = {}): LShapeDiagram {
  return {
    kind: "composite-area",
    template: "l-shape",
    unit: "cm",
    width: 12,
    height: 8,
    cutWidth: 5,
    cutHeight: 3,
    cutCorner: "top-right",
    ...over,
  };
}

const shadedPrompt = {
  zh: "下圖的長方形分成相等的部分。着色部分佔全部的幾分之幾？",
  en: "What fraction of the rectangle is shaded?",
};

function assertLayoutClear(layout: CompositeLayout): void {
  const [, , width, height] = layout.viewBox.split(" ").map(Number);
  assert.ok(width > 0 && height > 0);
  for (const label of layout.labels) {
    assert.ok(label.x >= -0.05, `${label.text} clips on the left`);
    assert.ok(label.y >= -0.05, `${label.text} clips on the top`);
    assert.ok(label.x + label.w <= width + 0.05, `${label.text} clips on the right`);
    assert.ok(label.y + label.h <= height + 0.05, `${label.text} clips on the bottom`);
    assert.ok(label.text.includes("厘米") || label.text.includes("米"));
    assert.equal(label.text.includes("平方"), false);
  }
  for (const guide of layout.guides) {
    for (const x of [guide.x1, guide.x2]) {
      assert.ok(x >= -0.05 && x <= width + 0.05);
    }
    for (const y of [guide.y1, guide.y2]) {
      assert.ok(y >= -0.05 && y <= height + 0.05);
    }
  }
  for (let i = 0; i < layout.labels.length; i += 1) {
    for (let j = i + 1; j < layout.labels.length; j += 1) {
      const a = layout.labels[i]!;
      const b = layout.labels[j]!;
      assert.equal(boxesOverlap(a, b, 1), false, `${a.text} overlaps ${b.text}`);
    }
  }
}

test("fraction bounds reject empty, full, and out-of-range parts", () => {
  assert.equal(parseDiagram(fraction({ parts: 1, shaded: 1 })), undefined);
  assert.equal(parseDiagram(fraction({ parts: 13, shaded: 1 })), undefined);
  assert.equal(parseDiagram(fraction({ parts: 2.5 as unknown as number })), undefined);
  assert.equal(parseDiagram(fraction({ shaded: 0 })), undefined);
  assert.equal(parseDiagram(fraction({ shaded: 8 })), undefined);
  assert.equal(parseDiagram(fraction({ shaded: 9 })), undefined);
  assert.equal(parseDiagram(fraction({ shape: "grid", rows: 3, cols: 3, parts: 8 })), undefined);
  const grid = parseDiagram(fraction({ shape: "grid", rows: 3, cols: 4, parts: 12, shaded: 5 }));
  assert.equal(grid?.kind, "shaded-fraction");
  if (grid?.kind === "shaded-fraction") assert.equal(grid.shape, "grid");
  assert.equal(parseDiagram(fraction({ rows: 2, cols: 4 })), undefined);
  assert.equal(parseDiagram("<svg></svg>"), undefined);
  assert.equal(parseDiagram({ kind: "shaded-fraction", shape: "bar", parts: 4, shaded: 1, target: "shaded", html: "<b>x</b>" }), undefined);
  assert.equal(parseDiagram(undefined), undefined);
});

test("a valid shaded fraction must equal the keyed answer and the stem", () => {
  const diagram = fraction();
  const ok = question({ answer: "3/8", prompt: shadedPrompt });
  const kept = diagramForQuestion(diagram, ok);
  assert.equal(kept?.kind, "shaded-fraction");
  if (kept?.kind === "shaded-fraction") assert.equal(kept.parts, 8);
  assert.equal(diagramForQuestion(diagram, question({ answer: "1/2", prompt: shadedPrompt })), undefined);
  assert.equal(
    diagramForQuestion(diagram, question({ answer: "5/8", prompt: { zh: "沒有着色的部分佔全部的幾分之幾？", en: "What fraction is not shaded?" } })),
    undefined,
  );
  const blank = fraction({ target: "unshaded" });
  const blankKept = diagramForQuestion(blank, question({ answer: "5/8", prompt: { zh: "沒有着色的部分佔全部的幾分之幾？", en: "What fraction is not shaded?" } }));
  assert.equal(blankKept?.kind, "shaded-fraction");
  if (blankKept?.kind === "shaded-fraction") assert.equal(blankKept.target, "unshaded");
  const simplified = diagramForQuestion(fraction({ parts: 6, shaded: 2 }), question({ answer: "1/3", prompt: shadedPrompt }));
  assert.equal(simplified?.kind, "shaded-fraction");
  if (simplified?.kind === "shaded-fraction") assert.equal(simplified.shaded, 2);
  assert.ok(Math.abs(fractionRegionValue(fraction({ parts: 6, shaded: 2 })) - 1 / 3) < 1e-9);
});

test("fraction stems cannot name a different part count or a different fraction", () => {
  const diagram = fraction();
  assert.equal(
    diagramForQuestion(diagram, question({ answer: "3/8", prompt: { zh: "圖中分成 6 等份。着色部分是多少？", en: "Shaded?" } })),
    undefined,
  );
  assert.equal(
    diagramForQuestion(diagram, question({ answer: "3/8", prompt: { zh: "着色部分是 1/2。它是多少？", en: "The shaded part is 1/2." } })),
    undefined,
  );
  assert.equal(
    diagramForQuestion(
      diagram,
      question({ answer: "3/8", prompt: { zh: "着色了 5 份。着色部分是多少？", en: "5 parts are shaded." } }),
    ),
    undefined,
  );
  const kept = diagramForQuestion(
    diagram,
    question({ answer: "3/8", prompt: { zh: "分成 8 等份，着色部分是八分之三。着色部分是多少？", en: "Shaded fraction is 3/8." } }),
  );
  assert.equal(kept?.kind, "shaded-fraction");
  if (kept?.kind === "shaded-fraction") assert.equal(kept.shaded, 3);
});

test("composite area arithmetic and label bounds", () => {
  const shape = lShape();
  assert.equal(compositeArea(shape), 12 * 8 - 5 * 3);
  assert.equal(compositeArea(shape), 81);
  const step: CompositeAreaDiagram = {
    kind: "composite-area",
    template: "step",
    unit: "cm",
    leftWidth: 6,
    rightWidth: 8,
    height: 9,
    rightHeight: 4,
  };
  assert.equal(compositeArea(step), 6 * 9 + 8 * 4);
  assert.equal(parseDiagram(lShape({ cutWidth: 12 })), undefined);
  assert.equal(parseDiagram(lShape({ cutHeight: 8 })), undefined);
  assert.equal(parseDiagram(lShape({ width: 0 })), undefined);
  assert.equal(parseDiagram(lShape({ cutWidth: 3 })), undefined);
  assert.equal(parseDiagram({ ...step, rightHeight: 9 }), undefined);
  assert.equal(parseDiagram({ ...step, leftWidth: LENGTH_MAX, rightWidth: LENGTH_MAX }), undefined);
  assert.ok(LABELLED_SPAN_MIN >= LENGTH_MIN);
});

test("area diagrams drop when the answer, unit, or stem lengths disagree", () => {
  const shape = lShape();
  const prompt = {
    zh: "下圖的單位是厘米。求圖形的面積。（以平方厘米為單位，只填數字。）",
    en: "Lengths are in cm. Find the area in square centimetres.",
  };
  const keptArea = diagramForQuestion(shape, question({ answer: "81", prompt }));
  assert.equal(keptArea?.kind, "composite-area");
  if (keptArea?.kind === "composite-area") assert.equal(keptArea.template, "l-shape");
  assert.equal(diagramForQuestion(shape, question({ answer: "80", prompt })), undefined);
  const withUnit = diagramForQuestion(shape, question({ answer: "81 cm²", prompt }));
  assert.equal(withUnit?.kind, "composite-area");
  if (withUnit?.kind === "composite-area") assert.equal(withUnit.template, "l-shape");
  assert.equal(
    diagramForQuestion(shape, question({ answer: "81", prompt: { zh: "下圖的單位是米。求面積。", en: "Lengths are in m." } })),
    undefined,
  );
  assert.equal(
    diagramForQuestion(
      shape,
      question({
        answer: "81",
        prompt: { zh: "長 9 厘米、闊 8 厘米。求面積。", en: "9 cm by 8 cm." },
      }),
    ),
    undefined,
  );
  const matched = diagramForQuestion(
    lShape({ width: 10, height: 8, cutWidth: 4, cutHeight: 3 }),
    question({
      answer: "68",
      prompt: {
        zh: "長 10 厘米、闊 8 厘米，剪去橫向 4 厘米、縱向 3 厘米。求面積。",
        en: "10 cm by 8 cm with a 4 cm by 3 cm corner removed.",
      },
    }),
  );
  assert.equal(matched && compositeArea(matched as LShapeDiagram), 68);
  assert.equal(
    diagramForQuestion(shape, question({ answer: "81", prompt: { zh: "面積是 80。單位是厘米。", en: "The area is 80 cm." } })),
    undefined,
  );
});

test("accessible text does not state the keyed fraction or the area", () => {
  for (const example of DIAGRAM_EXAMPLES) {
    assert.ok(example.diagram);
    const area = example.diagram?.kind === "composite-area" ? compositeArea(example.diagram) : null;
    for (const locale of ["zh-HK", "en"] as const) {
      const text = diagramAccessibleText(example.diagram!, locale);
      assert.equal(accessibleTextLeaksAnswer(text, example.answer, area), false, `${example.id} ${locale}: ${text}`);
      assert.equal(/答案/.test(text), false);
    }
    if (example.diagram?.kind === "composite-area") {
      const labels = labelledLengths(example.diagram);
      const zh = diagramAccessibleText(example.diagram, "zh-HK");
      for (const value of labels) {
        if (example.diagram.template === "l-shape" && value === example.diagram.width - example.diagram.cutWidth) {
          continue;
        }
        assert.ok(zh.includes(String(value)), `${example.id} missing ${value} in ${zh}`);
      }
    }
  }
});

test("every curated example is mathematically consistent and its labels fit", () => {
  assert.equal(DIAGRAM_EXAMPLES.length, 7);
  for (const example of DIAGRAM_EXAMPLES) {
    const again = diagramForQuestion(example.diagram, example);
    assert.ok(again, example.id);
    if (example.type === "mc") {
      assert.equal(example.choices?.length, 4);
      assert.ok(example.choices?.includes(example.answer));
    }
    if (again?.kind === "composite-area") {
      assertLayoutClear(layoutComposite(again));
      const answer = Number(example.answer);
      assert.equal(compositeArea(again), answer);
    }
    if (again?.kind === "shaded-fraction") {
      assert.ok(Math.abs(fractionRegionValue(again) - evalFraction(example.answer)) < 1e-9);
    }
  }
});

test("labels stay inside the frame across the allowed composite sizes", () => {
  const corners = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;
  for (const width of [8, 10, 12]) {
    for (const height of [5, 8, 12]) {
      for (const cutWidth of [4, 6]) {
        for (const cutHeight of [2, 3, 4]) {
          if (width - cutWidth < LABELLED_SPAN_MIN || height - cutHeight < LENGTH_MIN) continue;
          if (cutHeight > LENGTH_MAX) continue;
          for (const cutCorner of corners) {
            for (const unit of ["cm", "m"] as const) {
              const diagram = lShape({ width, height, cutWidth, cutHeight, cutCorner, unit });
              assertLayoutClear(layoutComposite(diagram));
            }
          }
        }
      }
    }
  }
  for (const leftWidth of [4, 6, 8]) {
    for (const rightWidth of [4, 6, 8]) {
      if (leftWidth + rightWidth > 16) continue;
      for (const height of [6, 9, 12]) {
        for (const rightHeight of [2, 4]) {
          if (height - rightHeight < LENGTH_MIN) continue;
          const diagram: CompositeAreaDiagram = {
            kind: "composite-area",
            template: "step",
            unit: "cm",
            leftWidth,
            rightWidth,
            height,
            rightHeight,
          };
          assertLayoutClear(layoutComposite(diagram));
        }
      }
    }
  }
});

test("missing or invalid diagram data is omitted and the question is kept", () => {
  const plain = question({ answer: "4", prompt: { zh: "2 + 2 = ?", en: "2 + 2 = ?" } });
  assert.equal(diagramForQuestion(undefined, plain), undefined);
  const kept = withValidatedDiagram(plain, undefined);
  assert.equal("diagram" in kept, false);
  const bad = withValidatedDiagram(plain, { kind: "shaded-fraction", shape: "bar", parts: 4, shaded: 1, target: "shaded" });
  assert.equal("diagram" in bad, false);
  const good = withValidatedDiagram(
    question({ answer: "1/4", prompt: shadedPrompt }),
    fraction({ parts: 4, shaded: 1 }),
  );
  assert.equal(good.diagram?.kind, "shaded-fraction");
});

function evalFraction(raw: string): number {
  const [numer, denom] = raw.split("/").map(Number);
  return numer! / denom!;
}
