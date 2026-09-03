export interface SearchableItem {
  id: number | string;
  name?: string;
  mod?: string;
  oredict?: string[];
  [key: string]: unknown;
}

// Common Minecraft Chinese characters to pinyin initials mapping
const PINYIN_CHAR_MAP: Record<string, string> = {
  "基": "j", "础": "c", "电": "d", "路": "l", "板": "b",
  "红": "h", "石": "s", "信": "x", "号": "h", "发": "f", "射": "s", "器": "q",
  "钛": "t", "框": "k", "架": "j", "魔": "m", "力": "l", "钢": "g", "锭": "d",
  "纯": "c", "净": "j", "高": "g", "卢": "l", "水": "s", "晶": "j", "进": "j",
  "阶": "j", "接": "j", "收": "s", "外": "w", "编": "b", "程": "c", "任": "r",
  "意": "y", "铜": "t", "铁": "t", "金": "j", "银": "y", "铝": "l", "铅": "q",
  "锡": "x", "锌": "x", "镍": "n", "铂": "b", "铱": "y", "钨": "w", "铬": "g",
  "锰": "m", "钴": "g", "碳": "t", "硅": "g", "硫": "l", "磷": "l", "氮": "d",
  "氧": "y", "氢": "q", "氦": "h", "氩": "y", "氡": "d", "氟": "f", "氯": "l",
  "溴": "x", "碘": "d", "锂": "l", "钠": "n", "钾": "j", "铷": "r", "铯": "s",
  "铍": "p", "镁": "m", "钙": "g", "锶": "s", "钡": "b", "镭": "l", "钪": "k",
  "钇": "y", "锆": "g", "铪": "h", "钒": "f", "铌": "n", "钽": "t", "钼": "m",
  "铀": "y", "钚": "b", "钍": "t", "线": "x", "缆": "l", "导": "d",
  "管": "g", "箱": "x", "罐": "g", "炉": "l", "机": "j", "泵": "b", "阀": "f",
  "仓": "c", "门": "m", "口": "k", "槽": "c", "池": "c", "砖": "z",
  "黑": "h", "花": "h", "岗": "g", "深": "s", "色": "s", "混": "h", "凝": "n",
  "土": "t", "大": "d", "理": "l", "玄": "x", "武": "w", "粉": "f", "粒": "l",
  "块": "k", "棒": "b", "杆": "g", "环": "h", "齿": "c", "轮": "l", "转": "z",
  "子": "z", "定": "d", "螺": "l", "栓": "s", "透": "t", "镜": "j",
  "体": "t", "芯": "x", "片": "p", "处": "c", "制": "z", "超": "c",
  "量": "l", "纳": "n", "米": "m", "生": "s", "物": "w", "质": "z",
  "原": "y", "料": "l", "催": "c", "化": "h", "剂": "j", "重": "z", "合": "h",
  "成": "c", "分": "f", "解": "j", "提": "t", "炼": "l", "洗": "x", "矿": "k",
  "离": "l", "心": "x", "热": "r", "压": "y", "切": "q", "割": "g", "车": "c",
  "床": "c", "钻": "z", "头": "t", "工": "g", "作": "z", "台": "t", "熔": "r"
};

/**
 * Extracts pinyin initials from a Chinese string, or returns lowercased ASCII letters
 */
export function getPinyinInitials(str: string): string {
  if (!str) return "";
  let initials = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (PINYIN_CHAR_MAP[char]) {
      initials += PINYIN_CHAR_MAP[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      initials += char.toLowerCase();
    }
  }
  return initials;
}

/**
 * Checks if query matches the pinyin initials of the candidate string
 */
export function matchPinyinInitials(candidate: string, query: string): boolean {
  if (!candidate || !query) return false;
  const initials = getPinyinInitials(candidate);
  return initials.includes(query.toLowerCase());
}

/**
 * Filters a collection of items supporting text, pinyin initials, @mod, and $ore syntax
 */
export function filterItems<T extends SearchableItem>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  // 1. @mod syntax (e.g. @gregtech, @ae2)
  if (q.startsWith("@")) {
    const modQuery = q.slice(1);
    return items.filter((item) => item.mod?.toLowerCase().includes(modQuery));
  }

  // 2. $ore syntax (e.g. $circuit, $ingot)
  if (q.startsWith("$")) {
    const oreQuery = q.slice(1);
    return items.filter((item) =>
      item.oredict?.some((ore) => ore.toLowerCase().includes(oreQuery))
    );
  }

  // 3. Plain text or Pinyin initials
  return items.filter((item) => {
    const name = item.name ? item.name.toLowerCase() : "";
    if (name.includes(q)) return true;

    // Check pinyin initials if query is alphabetic
    if (/^[a-z0-9]+$/i.test(q) && item.name) {
      if (matchPinyinInitials(item.name, q)) return true;
    }

    // Check mod name as secondary fallback
    if (item.mod && item.mod.toLowerCase().includes(q)) return true;

    return false;
  });
}
