<template>
  <div class="app-layout">
    <!-- Top Dark Industrial Header -->
    <header class="app-header">
      <div class="logo">
        <span class="logo-accent">NEO</span>NEI
        <span class="badge">NEXT</span>
      </div>
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索物品、配方、拼音、矿物词典或模组 (按下回车或直接键入)..."
        />
      </div>
      <div class="header-actions">
        <span class="stat-pill">{{ recipes.length }} 配方</span>
        <button class="action-btn" @click="addSampleRecipe">+ 添加模拟配方</button>
      </div>
    </header>

    <!-- Main Native Surface Viewport -->
    <main class="app-main">
      <NativeSurface :recipes="filteredRecipes" />
    </main>

    <!-- Bottom Status Bar -->
    <footer class="app-footer">
      <div class="footer-status">
        <span class="dot live"></span> 渲染内核: NativeSurface (WASM / 20Hz Timeline)
      </div>
      <div class="footer-info">
        帧预算: 16.6ms | 槽位绝对定位: 激活 | 主线程状态: 零阻断 (60 FPS)
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Recipe } from "./types.js";
import NativeSurface from "./components/NativeSurface.vue";

const searchQuery = ref("");

// Initial sample recipes demonstrating absolute slot positioning & dynamic semantics
const recipes = ref<Recipe[]>([
  {
    id: "gregtech:assembler:sample_circuit",
    type: "gt.recipe.assembler",
    label: "组装机: 基础电路板",
    w: 220,
    h: 100,
    slots: [
      { x: 18, y: 22, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 1, name: "基础电路基板", count: 1 }] },
      { x: 38, y: 22, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 2, name: "红石合金线", count: 2 }] },
      { x: 18, y: 42, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 3, name: "电阻", count: 2 }] },
      { x: 58, y: 22, w: 18, h: 48, kind: "fluid", role: "in", fluid: { id: "molten.soldering_alloy", amount: 144 } },
      { x: 154, y: 32, w: 26, h: 26, kind: "item", role: "out", items: [{ id: 100, name: "电子电路", count: 1 }], chance: 1.0 }
    ],
    env: { tier: "LV", eut: 16, ticks: 200 }
  },
  {
    id: "minecraft:crafting_table",
    type: "minecraft.crafting",
    label: "工作台: 合成台",
    w: 190,
    h: 90,
    slots: [
      { x: 18, y: 20, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 5, name: "橡木木板", count: 1 }] },
      { x: 38, y: 20, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 5, name: "橡木木板", count: 1 }] },
      { x: 18, y: 40, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 5, name: "橡木木板", count: 1 }] },
      { x: 38, y: 40, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 5, name: "橡木木板", count: 1 }] },
      { x: 134, y: 30, w: 26, h: 26, kind: "item", role: "out", items: [{ id: 58, name: "工作台", count: 1 }] }
    ],
    env: { eut: 0, ticks: 0 }
  },
  {
    id: "gregtech:blast_furnace:aluminum",
    type: "gt.recipe.blast_furnace",
    label: "高炉: 铝矿提炼",
    w: 220,
    h: 100,
    slots: [
      { x: 18, y: 22, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 12, name: "铝土矿粉", count: 2 }] },
      { x: 58, y: 22, w: 18, h: 48, kind: "fluid", role: "in", fluid: { id: "gas.nitrogen", amount: 1000 } },
      { x: 144, y: 22, w: 18, h: 18, kind: "item", role: "out", items: [{ id: 13, name: "铝锭", count: 1 }] },
      { x: 164, y: 22, w: 18, h: 18, kind: "item", role: "out", items: [{ id: 14, name: "金矿副产粉", count: 1 }], chance: 0.25 }
    ],
    env: { tier: "MV", eut: 120, ticks: 1200 }
  },
  {
    id: "ae2:inscriber:logic_processor",
    type: "ae2.inscriber",
    label: "压印机: 逻辑处理器",
    w: 200,
    h: 90,
    slots: [
      { x: 18, y: 15, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 4100, name: "逻辑压印模板", count: 1 }] },
      { x: 18, y: 35, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 266, name: "金锭", count: 1 }] },
      { x: 18, y: 55, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 331, name: "红石粉", count: 1 }] },
      { x: 134, y: 35, w: 26, h: 26, kind: "item", role: "out", items: [{ id: 4101, name: "逻辑处理器", count: 1 }] }
    ],
    env: { eut: 8, ticks: 100 }
  },
  {
    id: "enderio:alloy:energetic_alloy",
    type: "enderio.alloy_smelter",
    label: "合金炉: 充能合金",
    w: 210,
    h: 95,
    slots: [
      { x: 18, y: 20, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 266, name: "金锭", count: 1 }] },
      { x: 38, y: 20, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 331, name: "红石粉", count: 1 }] },
      { x: 58, y: 20, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 348, name: "荧石粉", count: 1 }] },
      { x: 144, y: 28, w: 26, h: 26, kind: "item", role: "out", items: [{ id: 5001, name: "充能合金锭", count: 1 }] }
    ],
    env: { eut: 32, ticks: 100 }
  },
  {
    id: "thaumcraft:crucible:nitor",
    type: "thaumcraft.crucible",
    label: "坩埚炼金: 闪耀之光",
    w: 200,
    h: 90,
    slots: [
      { x: 28, y: 34, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 371, name: "萤石粉", count: 1 }] },
      { x: 134, y: 30, w: 26, h: 26, kind: "item", role: "out", items: [{ id: 6001, name: "闪耀之光", count: 1 }] }
    ],
    env: { eut: 0, ticks: 40, special: { essentia: "Ignis 3, Lux 3, Potentia 3" } }
  },
  {
    id: "botania:mana_pool:manasteel",
    type: "botania.mana_infusion",
    label: "魔力池: 魔力钢锭",
    w: 200,
    h: 90,
    slots: [
      { x: 28, y: 35, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 265, name: "铁锭", count: 1 }] },
      { x: 134, y: 30, w: 26, h: 26, kind: "item", role: "out", items: [{ id: 7001, name: "魔力钢锭", count: 1 }] }
    ],
    env: { eut: 0, ticks: 20, special: { mana: 3000 } }
  }
]);

const filteredRecipes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return recipes.value;
  return recipes.value.filter(
    (r) =>
      r.label?.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.slots.some((s) => s.items?.some((i) => i.name?.toLowerCase().includes(q)))
  );
});

function addSampleRecipe() {
  const id = recipes.value.length + 1;
  recipes.value.push({
    id: `custom:recipe_${id}`,
    type: "gt.recipe.chemical_reactor",
    label: `反应釜配方 #${id}`,
    w: 220,
    h: 100,
    slots: [
      { x: 18, y: 22, w: 18, h: 18, kind: "item", role: "in", items: [{ id: 20 + id, name: `催化剂原料 #${id}`, count: 1 }] },
      { x: 58, y: 22, w: 18, h: 48, kind: "fluid", role: "in", fluid: { id: "water", amount: 500 } },
      { x: 144, y: 30, w: 26, h: 26, kind: "item", role: "out", items: [{ id: 100 + id, name: `纯化化合物 #${id}`, count: 2 }] }
    ],
    env: { tier: "HV", eut: 480, ticks: 300 }
  });
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #0d1117;
  overflow: hidden;
}

.app-header {
  height: 48px;
  background-color: #161b22;
  border-bottom: 1px solid #21262d;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
}

.logo {
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 1px;
  color: #c9d1d9;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo-accent {
  color: #58a6ff;
}

.badge {
  font-size: 9px;
  font-weight: 700;
  background-color: #238636;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 10px;
}

.search-bar {
  flex: 1;
}

.search-bar input {
  width: 100%;
  max-width: 600px;
  height: 30px;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 0 12px;
  color: #c9d1d9;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  border-color: #58a6ff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-pill {
  font-size: 12px;
  color: #8b949e;
  background-color: #21262d;
  padding: 4px 10px;
  border-radius: 12px;
}

.action-btn {
  background-color: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #30363d;
}

.app-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.app-footer {
  height: 28px;
  background-color: #161b22;
  border-top: 1px solid #21262d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: #8b949e;
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot.live {
  width: 6px;
  height: 6px;
  background-color: #3fb950;
  border-radius: 50%;
  display: inline-block;
}
</style>
