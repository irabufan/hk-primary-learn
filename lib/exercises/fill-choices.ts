/**
 * Hand-picked wrong options for fill items that P1–P3 children may meet.
 * P1–P2 sessions show these fills as mc (answer + 3 distractors); P3 sessions
 * keep at most 2 typed fills and show the rest as mc. Every distractor is a
 * same-category word that is clearly wrong in the sentence (checked by hand;
 * a unit test also checks none is an accepted answer).
 */
export const FILL_DISTRACTORS: Record<string, [string, string, string]> = {
  // 中文 · 詞語 (量詞 / 疊詞)
  "ch-v-p1-1": ["本", "條", "隻"],
  "ch-v-p1-5": ["紅", "黃", "大"],
  "ch-v-p1-8": ["隻", "條", "本"],
  "ch-v-p2-2": ["棵", "雙", "朵"],
  "ch-v-p2-3": ["間", "頂", "棵"],
  "ch-v-p2-7": ["匹", "架", "本"],
  // 中文 · 閱讀
  "ch-r-ks1-1": ["雨傘", "水壺", "玩具"],
  "ch-r-ks1-2": ["小狗", "小鳥", "小魚"],
  "ch-r-ks1-3": ["西瓜", "麪包", "雪糕"],
  "ch-r1": ["睡覺", "唱歌", "游泳"],
  "ch-r2": ["輕巧", "細小", "漂亮"],
  "ch-r3": ["升起", "出來", "轉動"],
  "ch-r8": ["鬧哄哄", "亂糟糟", "熱烘烘"],
  "ch-r-p1-1": ["雪人", "高樓", "積木"],
  "ch-r-p1-2": ["花花", "波波", "咪咪"],
  "ch-r-p1-3": ["泳衣", "睡衣", "背心"],
  "ch-r-p2-1": ["游泳", "看電影", "回家睡覺"],
  // 中文 · 句子
  "ch-s-ks1-1": ["隻", "條", "朵"],
  "ch-s-ks1-2": ["本", "張", "朵"],
  "ch-s-ks1-3": ["但", "因為", "很"],
  "ch-s1": ["甜", "胖", "圓"],
  "ch-s3": ["兇惡", "難看", "生氣"],
  "ch-s4": ["睡覺", "吃零食", "玩耍"],
  "ch-s6": ["認真", "小心", "細心"],
  "ch-s9": ["但是", "因為", "如果"],
  "ch-s-p1-1": ["跑", "寫", "唱"],
  "ch-s-p1-2": ["毛巾", "梳子", "鉛筆"],
  // English · vocabulary
  "en-v-ks1-1": ["run", "eat", "sing"],
  "en-v-ks1-2": ["sad", "loud", "angry"],
  "en-v-ks1-3": ["sleep", "jump", "eat"],
  "en-v-ks1-4": ["table", "rain", "shoe"],
  "en-v1": ["lazy", "angry", "noisy"],
  "en-v4": ["cook", "eat", "sing"],
  "en-v5": ["shy", "tired", "lazy"],
  "en-v6": ["break", "paint", "eat"],
  "en-v-p1-1": ["hands", "wings", "wheels"],
  "en-v-p1-2": ["ears", "feet", "eyes"],
  "en-v-p1-3": ["sad", "tall", "loud"],
  "en-v-p1-4": ["sleep", "read", "cook"],
  // 常識
  "gs-hl-fill-1": ["汽水", "咖啡", "奶茶"],
  "gs-com-fill-1": ["垃圾", "洗衣", "水"],
  "gs-ns-fill-1": ["炎熱", "嘈吵", "香甜"],
};
