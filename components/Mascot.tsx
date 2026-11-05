type MascotProps = {
  className?: string;
  /** Cheerful wave for results; calm smile for hero. */
  mood?: "hero" | "cheer";
};

/**
 * Original inline SVG mascot for HK Primary Learn — a friendly round star-kid
 * with a tiny school satchel. Not based on any copyrighted character.
 */
export function Mascot({ className = "h-24 w-24", mood = "hero" }: MascotProps) {
  const armUp = mood === "cheer";
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role="img"
      aria-label="學園小星星"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft ground shadow */}
      <ellipse cx="60" cy="108" rx="28" ry="6" fill="#94a3b8" opacity="0.25" />
      {/* body */}
      <circle cx="60" cy="58" r="36" fill="#FBBF24" />
      <circle cx="60" cy="58" r="36" fill="url(#glow)" opacity="0.35" />
      {/* satchel */}
      <rect x="78" y="62" width="18" height="14" rx="3" fill="#DC2626" />
      <path d="M78 66 H70" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="48" cy="52" r="4.5" fill="#1e293b" />
      <circle cx="72" cy="52" r="4.5" fill="#1e293b" />
      <circle cx="49.5" cy="50.5" r="1.5" fill="#fff" />
      <circle cx="73.5" cy="50.5" r="1.5" fill="#fff" />
      {/* smile */}
      <path
        d={armUp ? "M48 68 Q60 80 72 68" : "M50 68 Q60 76 70 68"}
        fill="none"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* rosy cheeks */}
      <circle cx="40" cy="62" r="4" fill="#FB7185" opacity="0.55" />
      <circle cx="80" cy="62" r="4" fill="#FB7185" opacity="0.55" />
      {/* arms */}
      <path
        d={armUp ? "M28 58 Q18 40 30 32" : "M28 62 Q18 70 26 78"}
        fill="none"
        stroke="#FBBF24"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d={armUp ? "M92 58 Q104 36 96 28" : "M92 62 Q102 70 94 78"}
        fill="none"
        stroke="#FBBF24"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* little star tuft */}
      <path
        d="M60 14 L63 26 L75 26 L65 33 L69 44 L60 37 L51 44 L55 33 L45 26 L57 26 Z"
        fill="#F59E0B"
      />
      <defs>
        <radialGradient id="glow" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
