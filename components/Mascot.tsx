"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/provider";

export type MascotMood = "hero" | "wave" | "read" | "cheer" | "tryagain";

const SRC: Record<MascotMood, string> = {
  hero: "/mascot/bolo-wave.webp",
  wave: "/mascot/bolo-wave.webp",
  read: "/mascot/bolo-read.webp",
  cheer: "/mascot/bolo-cheer.webp",
  tryagain: "/mascot/bolo-tryagain.webp",
};

type MascotProps = {
  className?: string;
  mood?: MascotMood;
  /** Subtle idle bounce — hero only; respects prefers-reduced-motion via CSS. */
  bounce?: boolean;
  priority?: boolean;
};

/**
 * 菠蘿包仔 / Bolo — pineapple-bun mascot for HK Primary Learn.
 * Poses: wave (hero), read (loading/empty), cheer (≥70%), tryagain (lower scores).
 */
export function Mascot({
  className = "h-28 w-28",
  mood = "hero",
  bounce = false,
  priority = false,
}: MascotProps) {
  const { locale } = useI18n();
  const alt =
    locale === "en"
      ? "Bolo, the pineapple bun mascot"
      : "菠蘿包仔，菠蘿包吉祥物";

  return (
    <div
      className={`relative shrink-0 ${className} ${bounce ? "animate-bolo-bounce" : ""}`}
    >
      <Image
        src={SRC[mood]}
        alt={alt}
        fill
        sizes="(max-width: 640px) 128px, 160px"
        className="object-contain"
        priority={priority}
      />
    </div>
  );
}
