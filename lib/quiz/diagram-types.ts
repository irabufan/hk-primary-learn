/**
 * Bounded diagram specs for shaded fractions and composite area.
 * Renderers draw only these shapes — never raw model SVG or HTML.
 */

export const FRACTION_PARTS_MIN = 2;
export const FRACTION_PARTS_MAX = 12;
export const GRID_ROWS_MAX = 4;
export const GRID_COLS_MAX = 6;

/** Whole centimetres or metres. Kept small so Chinese labels fit without clipping. */
export const LENGTH_MIN = 2;
export const LENGTH_MAX = 12;
/** Shortest labelled horizontal edge (cm or m). */
export const LABELLED_SPAN_MIN = 4;

export type LengthUnit = "cm" | "m";

export type ShadedFractionDiagram = {
  kind: "shaded-fraction";
  shape: "bar" | "circle" | "grid";
  /** Equal parts. For a grid this must equal rows × cols. */
  parts: number;
  /**
   * How many parts are shaded. Shading is fixed: the first `shaded` parts
   * in reading order (bar: left to right; circle: clockwise from the top;
   * grid: left to right, then top to bottom).
   */
  shaded: number;
  /** Which region the keyed answer must equal. */
  target: "shaded" | "unshaded";
  /** Required when shape is "grid". Forbidden otherwise. */
  rows?: number;
  cols?: number;
};

/**
 * Bounding rectangle with one rectangular corner removed.
 * Area = width × height − cutWidth × cutHeight.
 */
export type LShapeDiagram = {
  kind: "composite-area";
  template: "l-shape";
  unit: LengthUnit;
  width: number;
  height: number;
  cutWidth: number;
  cutHeight: number;
  cutCorner: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};

/**
 * Two rectangles joined along a vertical side. The left one is taller.
 * Area = leftWidth × height + rightWidth × rightHeight.
 */
export type StepDiagram = {
  kind: "composite-area";
  template: "step";
  unit: LengthUnit;
  leftWidth: number;
  rightWidth: number;
  /** Height of the left rectangle. */
  height: number;
  /** Height of the right rectangle. Must be shorter than `height`. */
  rightHeight: number;
};

export type CompositeAreaDiagram = LShapeDiagram | StepDiagram;

export type QuizDiagram = ShadedFractionDiagram | CompositeAreaDiagram;
