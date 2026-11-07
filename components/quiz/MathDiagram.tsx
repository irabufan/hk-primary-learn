"use client";

import { useId } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { diagramAccessibleText, layoutComposite } from "@/lib/quiz/diagrams";
import type { QuizDiagram, ShadedFractionDiagram } from "@/lib/quiz/diagram-types";

type Props = {
  diagram: QuizDiagram;
};

const STROKE = "#9a3412";
const INK = "#1e293b";

function sectorPath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const x0 = cx + radius * Math.cos(start);
  const y0 = cy + radius * Math.sin(start);
  const x1 = cx + radius * Math.cos(end);
  const y1 = cy + radius * Math.sin(end);
  return `M ${cx} ${cy} L ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1} Z`;
}

function ShadeDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <rect width="8" height="8" fill="#ffedd5" />
        <rect width="3.5" height="8" fill="#fb923c" />
      </pattern>
    </defs>
  );
}

function FractionFigure({ diagram, shadeId }: { diagram: ShadedFractionDiagram; shadeId: string }) {
  const { locale } = useI18n();
  const legend = locale === "en" ? "Shaded" : "着色";
  const fill = (index: number) => (index < diagram.shaded ? `url(#${shadeId})` : "#ffffff");

  if (diagram.shape === "circle") {
    const cx = 140;
    const cy = 132;
    const radius = 104;
    const legendY = 252;
    return (
      <svg viewBox="0 0 280 292" className="h-auto w-full rounded-xl bg-white font-sans">
        <ShadeDefs id={shadeId} />
        {Array.from({ length: diagram.parts }, (_, index) => {
          const step = (Math.PI * 2) / diagram.parts;
          const start = -Math.PI / 2 + index * step;
          return (
            <path
              key={index}
              d={sectorPath(cx, cy, radius, start, start + step)}
              fill={fill(index)}
              stroke={STROKE}
              strokeWidth={1.75}
            />
          );
        })}
        <Legend x={16} y={legendY} shadeId={shadeId} label={legend} />
      </svg>
    );
  }

  if (diagram.shape === "grid") {
    const rows = diagram.rows ?? 1;
    const cols = diagram.cols ?? 1;
    const cell = 58;
    const gap = 6;
    const pad = 16;
    const gridW = cols * cell + (cols - 1) * gap;
    const gridH = rows * cell + (rows - 1) * gap;
    const width = gridW + pad * 2;
    const legendY = pad + gridH + 14;
    const height = legendY + 28;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full rounded-xl bg-white font-sans">
        <ShadeDefs id={shadeId} />
        {Array.from({ length: rows * cols }, (_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          return (
            <rect
              key={index}
              x={pad + col * (cell + gap)}
              y={pad + row * (cell + gap)}
              width={cell}
              height={cell}
              rx={6}
              fill={fill(index)}
              stroke={STROKE}
              strokeWidth={2}
            />
          );
        })}
        <Legend x={pad} y={legendY} shadeId={shadeId} label={legend} />
      </svg>
    );
  }

  if (diagram.shape !== "bar") {
    const never: never = diagram.shape;
    void never;
    return null;
  }

  const padX = 16;
  const padY = 16;
  const inner = 328;
  const gap = 4;
  const cellW = (inner - gap * (diagram.parts - 1)) / diagram.parts;
  const cellH = 84;
  const width = padX * 2 + inner;
  const legendY = padY + cellH + 16;
  const height = legendY + 28;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full rounded-xl bg-white font-sans">
      <ShadeDefs id={shadeId} />
      {Array.from({ length: diagram.parts }, (_, index) => (
        <rect
          key={index}
          x={padX + index * (cellW + gap)}
          y={padY}
          width={cellW}
          height={cellH}
          rx={6}
          fill={fill(index)}
          stroke={STROKE}
          strokeWidth={2}
        />
      ))}
      <Legend x={padX} y={legendY} shadeId={shadeId} label={legend} />
    </svg>
  );
}

function Legend({ x, y, shadeId, label }: { x: number; y: number; shadeId: string; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={18} height={18} rx={3} fill={`url(#${shadeId})`} stroke={STROKE} strokeWidth={1.5} />
      <text x={x + 24} y={y + 10} fill={STROKE} fontSize={14} fontWeight={700} dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
}

function CompositeFigure({ diagram, shadeId }: { diagram: Extract<QuizDiagram, { kind: "composite-area" }>; shadeId: string }) {
  const layout = layoutComposite(diagram);
  return (
    <svg viewBox={layout.viewBox} className="h-auto w-full rounded-xl bg-white font-sans">
      <ShadeDefs id={shadeId} />
      <polygon
        points={layout.polygon}
        fill={`url(#${shadeId})`}
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="miter"
      />
      {layout.guides.map((guide, index) => (
        <line
          key={`g${index}`}
          x1={guide.x1}
          y1={guide.y1}
          x2={guide.x2}
          y2={guide.y2}
          stroke="#334155"
          strokeWidth={1.25}
        />
      ))}
      {layout.labels.map((label, index) => (
        <text
          key={`t${index}`}
          x={label.cx}
          y={label.cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={INK}
          fontSize={14}
          fontWeight={700}
        >
          {label.text}
        </text>
      ))}
    </svg>
  );
}

function DiagramSvg({ diagram, shadeId }: { diagram: QuizDiagram; shadeId: string }) {
  switch (diagram.kind) {
    case "shaded-fraction":
      return <FractionFigure diagram={diagram} shadeId={shadeId} />;
    case "composite-area":
      return <CompositeFigure diagram={diagram} shadeId={shadeId} />;
    default: {
      const never: never = diagram;
      void never;
      return null;
    }
  }
}

export function MathDiagram({ diagram }: Props) {
  const { locale } = useI18n();
  const rawId = useId().replace(/:/g, "");
  const shadeId = `shade-${rawId}`;
  const text = diagramAccessibleText(diagram, locale);

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-2 sm:p-3">
      <figure className="mx-auto w-full max-w-md" data-testid="math-diagram">
        <div aria-hidden="true">
          <DiagramSvg diagram={diagram} shadeId={shadeId} />
        </div>
        <figcaption className="sr-only" lang={locale === "en" ? "en" : "zh-HK"}>
          {text}
        </figcaption>
      </figure>
    </div>
  );
}
