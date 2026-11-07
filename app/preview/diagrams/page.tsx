import type { Metadata } from "next";
import { DiagramPreview } from "@/components/quiz/DiagramPreview";

export const metadata: Metadata = {
  title: "圖形示例",
  description:
    "已核對的分數着色圖與複合圖形面積示例，畫在小測驗畫面裏。這些題目是人手編寫的，不是人工智能生成的。",
};

export default function DiagramPreviewPage() {
  return <DiagramPreview />;
}
