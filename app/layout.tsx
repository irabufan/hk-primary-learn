import type { Metadata } from "next";
import { Noto_Sans_TC, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// CJK fonts must not be preloaded (they ship many unicode-range subsets).
const notoTC = Noto_Sans_TC({
  preload: false,
  variable: "--font-noto-tc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "香港小學學園 · HK Primary Learn",
    template: "%s · 香港小學學園 HK Primary Learn",
  },
  description:
    "香港小一至小六學習樂園：中文、英文、數學互動練習與小測驗生成器。A bright P1–P6 learning playground for Hong Kong: Chinese, English and Maths exercises plus a quiz generator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body className={`${outfit.variable} ${notoTC.variable} antialiased`}>
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
