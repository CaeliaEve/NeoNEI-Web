import test from "node:test";
import assert from "node:assert/strict";
import { filterItems, matchPinyinInitials } from "../src/surface/search-filter.ts";

test("matchPinyinInitials correctly matches Chinese characters to initials", () => {
  assert.equal(matchPinyinInitials("基础电路板", "jcdl"), true);
  assert.equal(matchPinyinInitials("基础电路板", "jcdlb"), true);
  assert.equal(matchPinyinInitials("红石信号发射器", "hsxh"), true);
  assert.equal(matchPinyinInitials("红石信号发射器", "xyz"), false);
});

test("filterItems supports plain text, pinyin, @mod, and $ore filters", () => {
  const sampleItems = [
    { id: 1, name: "基础电路板", mod: "gregtech", oredict: ["circuitBasic", "circuit"] },
    { id: 2, name: "钛框架", mod: "gregtech", oredict: ["frameGtTitanium"] },
    { id: 3, name: "魔力钢锭", mod: "botania", oredict: ["ingotManasteel"] },
    { id: 4, name: "纯净高卢水晶", mod: "appliedenergistics2", oredict: ["crystalPureCertusQuartz"] },
  ];

  // 1. Plain text search
  assert.equal(filterItems(sampleItems, "钛").length, 1);
  assert.equal(filterItems(sampleItems, "钛")[0].name, "钛框架");

  // 2. Pinyin search (jcdl -> 基础电路板)
  assert.equal(filterItems(sampleItems, "jcdl").length, 1);
  assert.equal(filterItems(sampleItems, "jcdl")[0].id, 1);

  // 3. @mod search
  assert.equal(filterItems(sampleItems, "@botania").length, 1);
  assert.equal(filterItems(sampleItems, "@gregtech").length, 2);

  // 4. $ore search
  assert.equal(filterItems(sampleItems, "$circuit").length, 1);
  assert.equal(filterItems(sampleItems, "$ingot").length, 1);

  // 5. Empty query returns all
  assert.equal(filterItems(sampleItems, "").length, 4);
});
