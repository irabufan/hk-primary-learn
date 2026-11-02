import type { SubjectSlug, Year } from "@/lib/curriculum";
import type { ExerciseBank, FillItem, McItem, NumberItem } from "./types";

/**
 * Extra hand-written P1 / P2 items so each early-years session has at least
 * six exact-year questions. Merged into the subject banks in ./index.ts.
 * The first MC choice is the answer here; sessions shuffle choices.
 */

function zhMc(id: string, years: Year[], prompt: string, choices: string[]): McItem {
  return { kind: "mc", id, prompt: { zh: prompt }, choices, answerIndex: 0, years };
}

function zhFill(id: string, years: Year[], prompt: string, accept: string[], hint?: string, passage?: string): FillItem {
  return {
    kind: "fill",
    id,
    prompt: { zh: prompt },
    accept,
    years,
    ...(hint ? { hint: { zh: hint } } : {}),
    ...(passage ? { passage: { zh: passage } } : {}),
  };
}

function enMc(id: string, years: Year[], prompt: string, choices: string[], passage?: string): McItem {
  return {
    kind: "mc",
    id,
    prompt: { en: prompt },
    choices,
    answerIndex: 0,
    years,
    ...(passage ? { passage: { en: passage } } : {}),
  };
}

function enFill(id: string, years: Year[], prompt: string, accept: string[], wordBank: string): FillItem {
  return { kind: "fill", id, prompt: { en: prompt }, hint: { en: `Word bank: ${wordBank}` }, accept, years };
}

function mathsMc(id: string, years: Year[], zh: string, en: string, choices: string[]): McItem {
  return { kind: "mc", id, prompt: { zh, en }, choices, answerIndex: 0, years };
}

function mathsNum(id: string, years: Year[], zh: string, en: string, answer: number): NumberItem {
  return { kind: "number", id, prompt: { zh, en }, answer, years };
}

const P1: Year[] = ["P1"];
const P2: Year[] = ["P2"];

export const earlyYearsBanks: Record<SubjectSlug, ExerciseBank> = {
  chinese: {
    vocab: [
      zhFill("ch-v-p1-1", P1, "一＿＿花", ["朵"], "填量詞：朵／本／條"),
      zhMc("ch-v-p1-2", P1, "哪一個是水果？", ["蘋果", "椅子", "書包", "小狗"]),
      zhMc("ch-v-p1-3", P1, "我們用腳＿＿球。", ["踢", "吃", "看", "寫"]),
      zhMc("ch-v-p1-4", P1, "「多」的反義詞是甚麼？", ["少", "大", "高", "長"]),
      zhFill("ch-v-p1-5", P1, "天空藍＿＿的。", ["藍"], "疊詞：藍＿的"),
      zhMc("ch-v-p1-6", P1, "哪一個字有「口」部？", ["吃", "林", "打", "你"]),
      zhMc("ch-v-p1-7", P1, "哪一個是交通工具？", ["巴士", "蘋果", "鉛筆", "小貓"]),
      zhFill("ch-v-p1-8", P1, "一＿＿老師", ["位"], "填量詞：位／隻／條"),
      zhMc("ch-v-p2-1", P2, "「高興」的近義詞是甚麼？", ["快樂", "傷心", "生氣", "害怕"]),
      zhFill("ch-v-p2-2", P2, "一＿＿汽車", ["輛"], "填量詞：輛／棵／雙"),
      zhFill("ch-v-p2-3", P2, "一＿＿鞋子", ["雙", "對"], "填量詞：雙／間／頂"),
      zhMc("ch-v-p2-4", P2, "「寬」的反義詞是甚麼？", ["窄", "長", "高", "胖"]),
      zhMc("ch-v-p2-5", P2, "哪一組詞語都是文具？", ["鉛筆、間尺", "蘋果、香蕉", "小狗、小貓", "巴士、的士"]),
      zhMc("ch-v-p2-6", P2, "「明亮」的反義詞是甚麼？", ["黑暗", "光明", "清楚", "漂亮"]),
      zhFill("ch-v-p2-7", P2, "一＿＿大樹", ["棵"], "填量詞：棵／匹／架"),
      zhMc("ch-v-p2-8", P2, "「美麗」的近義詞是甚麼？", ["漂亮", "醜陋", "高大", "乾淨"]),
    ],
    reading: [
      zhFill("ch-r-p1-1", P1, "我在沙灘上堆＿＿。", ["沙堡"], undefined, "爸爸帶我去海灘。我在沙灘上堆沙堡。"),
      zhFill("ch-r-p1-2", P1, "小狗的名字叫＿＿。", ["豆豆"], undefined, "弟弟有一隻小狗。小狗的名字叫豆豆。"),
      zhFill("ch-r-p1-3", P1, "下雨了，我穿上＿＿去上學。", ["雨衣"], undefined, "今天下雨了。我穿上雨衣去上學。"),
      zhFill(
        "ch-r-p2-1",
        P2,
        "野餐後，他們去做甚麼？",
        ["放風箏"],
        undefined,
        "星期日，我和家人去郊外。我們先在草地上野餐，然後去放風箏。",
      ),
    ],
    sentences: [
      zhFill("ch-s-p1-1", P1, "我＿＿一杯牛奶。", ["喝"], "選字：喝／跑／寫"),
      zhFill("ch-s-p1-2", P1, "我用＿＿刷牙。", ["牙刷"], "選詞：牙刷／毛巾／梳子"),
    ],
  },
  english: {
    vocabulary: [
      enFill("en-v-p1-1", P1, "A cat has four ___.", ["legs"], "legs / hands / wings"),
      enFill("en-v-p1-2", P1, "I eat with my ___.", ["mouth"], "mouth / ears / feet"),
      enFill("en-v-p1-3", P1, "The sky is ___.", ["blue"], "blue / sad / tall"),
      enFill("en-v-p1-4", P1, "I can ___ in the pool.", ["swim"], "swim / sleep / read"),
    ],
    reading: [
      enMc("en-r-p1-1", P1, "How old is Ben?", ["Six", "Five", "Seven", "Ten"], "This is Ben. He is six. He has a red ball."),
      enMc("en-r-p1-2", P1, "What pet do I have?", ["A fish", "A dog", "A cat", "A bird"], "I have a fish. It is small. It is orange."),
      enMc("en-r-p1-3", P1, "Where is the bird?", ["In the tree", "On the bed", "In the box", "Under the car"], "Look at the tree. A bird is in the tree."),
      enMc("en-r-p1-4", P1, "Who is the cake for?", ["Sam", "Mum", "Dad", "Tom"], "Mum has a cake. It is for Sam. Sam is happy."),
      enMc(
        "en-r-p2-1",
        P2,
        "When does Lily go to the park?",
        ["On Sunday", "On Monday", "Every day", "At night"],
        "Lily goes to the park on Sunday. She plays with her dog there. Her dog likes to run.",
      ),
      enMc(
        "en-r-p2-2",
        P2,
        "Where is the box?",
        ["On the table", "Under the bed", "In the bag", "On the chair"],
        "There is a box on the table. There are three apples in the box.",
      ),
      enMc(
        "en-r-p2-3",
        P2,
        "What does May like?",
        ["Drawing", "Football", "Singing", "Swimming"],
        "Tom has a little sister, May. May likes drawing. Tom likes football.",
      ),
      enMc(
        "en-r-p2-4",
        P2,
        "What is Mr Chan's job?",
        ["A bus driver", "A teacher", "A doctor", "A cook"],
        "Mr Chan is a bus driver. He gets up at six o'clock. He drives a red bus.",
      ),
    ],
    grammar: [
      enMc("en-g-p1-1", P1, "She ___ my sister.", ["is", "am", "are", "be"]),
      enMc("en-g-p1-2", P1, "Here is ___ orange.", ["an", "a", "two", "many"]),
      enMc("en-g-p1-3", P1, "I have two ___.", ["dogs", "dog", "a dog", "doges"]),
      enMc("en-g-p1-4", P1, "We ___ happy.", ["are", "is", "am", "be"]),
      enMc("en-g-p1-5", P1, "___ is my pencil.", ["This", "These", "Those", "They"]),
      enMc("en-g-p2-1", P2, "He ___ milk every morning.", ["drinks", "drink", "drinking", "drank"]),
      enMc("en-g-p2-2", P2, "There ___ a pen on my desk.", ["is", "are", "am", "be"]),
      enMc("en-g-p2-3", P2, "Look at Mary. ___ bag is pink.", ["Her", "His", "She", "He"]),
      enMc("en-g-p2-4", P2, "There are many ___ in the park.", ["children", "childs", "child", "childrens"]),
    ],
  },
  maths: {
    "add-subtract": [
      mathsNum("m-as-p2-6", P2, "463 + 228 = ?", "463 + 228 = ?", 691),
      mathsNum(
        "m-as-p2-7",
        P2,
        "小明有 305 張貼紙，送了 127 張給同學，還剩多少張？",
        "Ming has 305 stickers and gives 127 to classmates. How many are left?",
        178,
      ),
    ],
    shapes: [
      mathsMc("m-sh-p1-6", P1, "紙巾盒像哪一個立體？", "A tissue box looks like which solid?", [
        "長方體 Cuboid",
        "球體 Sphere",
        "圓柱 Cylinder",
        "圓錐 Cone",
      ]),
      mathsMc("m-sh-p1-7", P1, "雪糕筒像哪一個立體？", "An ice-cream cone looks like which solid?", [
        "圓錐 Cone",
        "正方體 Cube",
        "圓柱 Cylinder",
        "球體 Sphere",
      ]),
      mathsNum("m-sh-p2-5", P2, "一個五邊形有多少條邊？", "How many sides does a pentagon have?", 5),
      mathsNum("m-sh-p2-6", P2, "一個六邊形有多少個角？", "How many angles does a hexagon have?", 6),
      mathsMc("m-sh-p2-7", P2, "黃昏時，太陽在哪個方向落下？", "In the evening, the sun sets in the…", [
        "西 West",
        "東 East",
        "南 South",
        "北 North",
      ]),
    ],
    "word-problems": [
      mathsMc("m-w-p1-4", P1, "書架上有 20 本書，借出了 8 本，還剩多少本？", "There are 20 books on a shelf. 8 are borrowed. How many are left?", [
        "12",
        "28",
        "13",
        "11",
      ]),
      mathsMc("m-w-p1-5", P1, "公園裏有 9 個男孩和 8 個女孩，共有多少個小朋友？", "9 boys and 8 girls are in the park. How many children are there?", [
        "17",
        "16",
        "18",
        "1",
      ]),
    ],
  },
  gs: {
    "healthy-living": [
      zhMc("gs-hl-p1-1", P1, "我們用甚麼聞到花香？", ["鼻子", "耳朵", "眼睛", "手"]),
      zhMc("gs-hl-p1-2", P1, "水壺裏有熱水，應該怎樣做？", ["不要碰", "用手摸", "拿來玩", "倒在地上"]),
      zhMc("gs-hl-p1-3", P1, "陌生人按門鐘，我應該怎樣做？", ["告訴大人", "馬上開門", "跟他走", "大聲罵他"]),
      zhMc("gs-hl-p1-4", P1, "刷牙可以預防甚麼？", ["蛀牙", "近視", "感冒", "肚痛"]),
      zhMc("gs-hl-p2-1", P2, "乘車時，我們應該怎樣做？", ["扣好安全帶", "把頭伸出窗", "在車上跑", "站在座位上"]),
      zhMc("gs-hl-p2-2", P2, "哪一種是健康的小食？", ["蘋果", "薯片", "糖果", "汽水"]),
      zhMc("gs-hl-p2-3", P2, "綠色小人燈亮着，表示甚麼？", ["可以過馬路", "要停下來", "車輛可以走", "要跑過去"]),
      zhMc("gs-hl-p2-4", P2, "生病時，應該怎樣吃藥？", ["按醫生指示", "自己多吃", "吃別人的藥", "當糖果吃"]),
    ],
    community: [
      zhMc("gs-com-p1-1", P1, "爸爸的媽媽，我們叫她甚麼？", ["嫲嫲", "婆婆", "姨姨", "姑姐"]),
      zhMc("gs-com-p1-2", P1, "上課時想發問，應該怎樣做？", ["先舉手", "大聲叫", "離開座位", "不停說話"]),
      zhMc("gs-com-p1-3", P1, "小息時，同學在哪裏玩耍？", ["操場", "校務處", "洗手間", "教員室"]),
      zhMc("gs-com-p1-4", P1, "吃完飯，我可以幫忙做甚麼？", ["收拾碗筷", "看電視", "玩遊戲", "睡覺"]),
      zhMc("gs-com-p1-5", P1, "老師送你禮物，你應該說甚麼？", ["謝謝", "對不起", "再見", "早晨"]),
      zhMc("gs-com-p1-6", P1, "買小食的人很多，應該怎樣做？", ["排隊等候", "擠到最前", "大聲叫喊", "推開別人"]),
      zhMc("gs-com-p2-1", P2, "誰負責派信？", ["郵差", "警察", "廚師", "司機"]),
      zhMc("gs-com-p2-2", P2, "中秋節，人們通常會吃甚麼？", ["月餅", "糉子", "年糕", "湯圓"]),
      zhMc("gs-com-p2-3", P2, "端午節有甚麼活動？", ["扒龍舟", "賞月", "派利是", "舞獅"]),
      zhMc("gs-com-p2-4", P2, "在港鐵車廂裏，應該怎樣做？", ["讓座給有需要的人", "大聲喧嘩", "在車廂吃東西", "靠在車門上"]),
    ],
    "nature-science": [
      zhMc("gs-ns-p1-1", P1, "白天，天空上最亮的是甚麼？", ["太陽", "月亮", "星星", "燈籠"]),
      zhMc("gs-ns-p1-2", P1, "晚上，我們通常會做甚麼？", ["睡覺", "上學", "曬太陽", "上體育課"]),
      zhMc("gs-ns-p1-3", P1, "下雨天出門，要帶甚麼？", ["雨傘", "太陽眼鏡", "扇子", "泳衣"]),
      zhMc("gs-ns-p1-4", P1, "天氣很冷，應該穿甚麼？", ["厚外套", "短褲", "背心", "拖鞋"]),
      zhMc("gs-ns-p1-5", P1, "晚上，天空上可以看到甚麼？", ["月亮和星星", "太陽", "彩虹", "藍天"]),
      zhMc("gs-ns-p1-6", P1, "天氣很熱，要多喝甚麼？", ["清水", "汽水", "咖啡", "奶茶"]),
      zhMc("gs-ns-p2-1", P2, "以下哪一樣是生物？", ["小狗", "石頭", "椅子", "皮球"]),
      zhMc("gs-ns-p2-2", P2, "青蛙通常住在哪裏？", ["池塘", "沙漠", "雪山", "天空"]),
      zhMc("gs-ns-p2-3", P2, "哪一個季節樹葉會變黃和落下？", ["秋天", "春天", "夏天", "冬天"]),
      zhMc("gs-ns-p2-4", P2, "匙羹通常用甚麼物料造？", ["金屬", "紙", "布", "玻璃"]),
    ],
  },
};
