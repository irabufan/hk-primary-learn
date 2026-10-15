"use client";

import { useI18n } from "@/lib/i18n/provider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-sky-200 bg-white/70">
      <div className="wrap py-8 text-sm text-muted space-y-2">
        <p className="font-medium text-ink-soft">{t("footer.blurb")}</p>
        <p>{t("footer.disclaimer")}</p>
        <p className="text-xs">{t("footer.copy")}</p>
        <p className="text-xs font-semibold text-indigo-600">{t("footer.version")}</p>
      </div>
    </footer>
  );
}
