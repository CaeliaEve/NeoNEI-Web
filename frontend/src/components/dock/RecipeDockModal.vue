<template>
  <div v-if="visible" class="recipe-dock-container" @keydown.esc="$emit('close')">
    <!-- In-game Style Stone Chassis -->
    <div class="recipe-dock-chassis">
      <!-- Top Chrome Bar: Machine Tabs, Navigation & Close -->
      <div class="chassis-header">
        <!-- History Back/Forward -->
        <div class="history-nav-btns">
          <button
            class="nav-icon-btn"
            :disabled="!canGoBack"
            @click="$emit('back')"
            title="返回上一级配方 (Backspace)"
          >
            &larr;
          </button>
          <button
            class="nav-icon-btn"
            :disabled="!canGoForward"
            @click="$emit('forward')"
            title="前进至下一级配方"
          >
            &rarr;
          </button>
        </div>

        <!-- Machine Category Tabs -->
        <div class="machine-tabs-track">
          <button
            v-for="(cat, idx) in machineCategories"
            :key="cat.id"
            class="machine-tab"
            :class="{ active: idx === selectedMachineIndex }"
            @click="$emit('select-machine', idx)"
          >
            <span class="tab-label">{{ cat.label }}</span>
            <span class="tab-badge">{{ cat.count }}</span>
          </button>
        </div>

        <!-- Sub Pager & Close Button -->
        <div class="header-right-tools">
          <div v-if="totalRecipesInCategory > 1" class="sub-pager">
            <button
              class="sub-pager-arrow"
              :disabled="currentRecipeIndex <= 0"
              @click="$emit('prev-recipe')"
            >
              &lt;
            </button>
            <span class="sub-pager-text">
              {{ currentRecipeIndex + 1 }} / {{ totalRecipesInCategory }}
            </span>
            <button
              class="sub-pager-arrow"
              :disabled="currentRecipeIndex >= totalRecipesInCategory - 1"
              @click="$emit('next-recipe')"
            >
              &gt;
            </button>
          </div>

          <button class="close-btn" @click="$emit('close')" title="关闭配方 (Esc)">
            &times;
          </button>
        </div>
      </div>

      <!-- Canvas Stage (NativeSurface) -->
      <div class="chassis-stage">
        <div v-if="currentRecipe" class="stage-canvas-wrap">
          <NativeSurface
            :recipes="[currentRecipe]"
            @slot-click="handleSlotClick"
          />
        </div>
        <div v-else class="empty-stage">
          <span>暂无可用配方</span>
        </div>
      </div>

      <!-- Footer Info Bar: Recipe Operating Condition Stats -->
      <div v-if="currentRecipe && currentRecipe.env" class="chassis-footer">
        <span class="stat-item">
          耗时: <strong class="stat-val">{{ (currentRecipe.env.ticks / 20).toFixed(1) }}s</strong> ({{ currentRecipe.env.ticks }}t)
        </span>
        <span class="stat-item">
          能耗: <strong class="stat-val text-amber">{{ currentRecipe.env.eut }} EU/t</strong>
        </span>
        <span v-if="currentRecipe.env.tier" class="stat-item">
          电压: <strong class="stat-val text-cyan">{{ currentRecipe.env.tier }}</strong>
        </span>
        <span v-if="currentRecipe.env.special && currentRecipe.env.special.specialValue !== undefined" class="stat-item">
          模式: <strong class="stat-val">{{ currentRecipe.env.special.specialValue }}</strong>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe, Slot } from "../../types.js";
import NativeSurface from "../NativeSurface.vue";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    currentRecipe: Recipe | null;
    machineCategories?: { id: string; label: string; count: number }[];
    selectedMachineIndex?: number;
    currentRecipeIndex?: number;
    totalRecipesInCategory?: number;
    canGoBack?: boolean;
    canGoForward?: boolean;
  }>(),
  {
    machineCategories: () => [],
    selectedMachineIndex: 0,
    currentRecipeIndex: 0,
    totalRecipesInCategory: 1,
    canGoBack: false,
    canGoForward: false
  }
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select-machine", index: number): void;
  (e: "prev-recipe"): void;
  (e: "next-recipe"): void;
  (e: "back"): void;
  (e: "forward"): void;
  (e: "slot-drill", slot: Slot, isUsage: boolean): void;
}>();

function handleSlotClick(slot: Slot, e?: MouseEvent) {
  const isUsage = e ? e.button === 2 : false;
  emit("slot-drill", slot, isUsage);
}
</script>

<style scoped>
.recipe-dock-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  z-index: 50;
}

.recipe-dock-chassis {
  background: #161B22;
  border: 2px solid #30363D;
  border-top-color: #484F58;
  border-left-color: #484F58;
  border-bottom-color: #0D1117;
  border-right-color: #0D1117;
  border-radius: 8px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-width: 640px;
  width: 100%;
  overflow: hidden;
}

.chassis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0D1117;
  padding: 6px 10px;
  border-bottom: 2px solid #21262D;
  gap: 8px;
}

.history-nav-btns {
  display: flex;
  gap: 4px;
}

.nav-icon-btn {
  background: #161B22;
  border: 1px solid #30363D;
  color: #C9D1D9;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
  cursor: pointer;
  line-height: 1;
}

.nav-icon-btn:disabled {
  color: #484F58;
  border-color: #21262D;
  cursor: not-allowed;
}

.machine-tabs-track {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  flex: 1;
}

.machine-tab {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 12px;
  color: #8B949E;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.machine-tab:hover {
  background: #21262D;
  color: #C9D1D9;
}

.machine-tab.active {
  background: #238636;
  border-color: #2EA043;
  color: #FFFFFF;
}

.tab-badge {
  background: rgba(0, 0, 0, 0.3);
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
}

.header-right-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-pager {
  display: flex;
  align-items: center;
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 1px 6px;
  font-family: monospace;
  font-size: 11px;
}

.sub-pager-arrow {
  background: none;
  border: none;
  color: #C9D1D9;
  font-weight: 700;
  cursor: pointer;
  padding: 0 4px;
}

.sub-pager-arrow:disabled {
  color: #484F58;
  cursor: not-allowed;
}

.sub-pager-text {
  color: #8B949E;
  padding: 0 4px;
}

.close-btn {
  background: #21262D;
  border: 1px solid #30363D;
  color: #8B949E;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-btn:hover {
  background: #DA3633;
  border-color: #F85149;
  color: #FFFFFF;
}

.chassis-stage {
  padding: 16px;
  background: #090B0E;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
}

.stage-canvas-wrap {
  width: 100%;
  height: 260px;
  position: relative;
}

.empty-stage {
  color: #484F58;
  font-size: 13px;
}

.chassis-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  background: #0D1117;
  padding: 6px 14px;
  border-top: 1px solid #21262D;
  font-size: 12px;
  color: #8B949E;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-val {
  color: #F0F6FC;
  font-family: monospace;
}

.text-amber {
  color: #D29922;
}

.text-cyan {
  color: #58A6FF;
}
</style>
