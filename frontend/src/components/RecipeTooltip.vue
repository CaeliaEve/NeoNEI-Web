<template>
  <div
    v-if="visible && hit"
    class="tooltip-container"
    :style="{ left: `${hit.screenX + 16}px`, top: `${hit.screenY - 12}px` }"
  >
    <div class="tooltip-title">{{ title }}</div>
    <div v-if="subtitle" class="tooltip-sub">{{ subtitle }}</div>
    <div v-if="hit.slot.chance" class="tooltip-chance">
      产出概率: {{ Math.round(hit.slot.chance * 100) }}%
    </div>
    <div class="tooltip-hints">
      <span class="key">R</span> 查配方 &nbsp; <span class="key">U</span> 查用途
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { HitTestResult } from "../types.js";

const props = defineProps<{
  hit: HitTestResult | null;
  visible: boolean;
}>();

const title = computed(() => {
  if (!props.hit) return "";
  const slot = props.hit.slot;
  if (slot.kind === "fluid" && slot.fluid) {
    return `流体: ${slot.fluid.id} (${slot.fluid.amount} mB)`;
  }
  if (slot.items && slot.items.length > 0) {
    const it = slot.items[0];
    return it.name || `物品 ID: ${it.id} (meta: ${it.meta || 0})`;
  }
  return "空槽位";
});

const subtitle = computed(() => {
  if (!props.hit) return "";
  const slot = props.hit.slot;
  return `槽位类型: ${slot.role.toUpperCase()} | 尺寸: ${slot.w}×${slot.h}`;
});
</script>

<style scoped>
.tooltip-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-width: 140px;
}

.tooltip-title {
  font-weight: 600;
  font-size: 13px;
  color: #58a6ff;
  margin-bottom: 2px;
}

.tooltip-sub {
  font-size: 11px;
  color: #8b949e;
  margin-bottom: 6px;
}

.tooltip-chance {
  font-size: 11px;
  color: #d29922;
  margin-bottom: 6px;
}

.tooltip-hints {
  font-size: 10px;
  color: #6e7681;
  border-top: 1px solid #21262d;
  padding-top: 4px;
}

.key {
  display: inline-block;
  background-color: #21262d;
  border: 1px solid #30363d;
  border-radius: 3px;
  padding: 1px 4px;
  color: #c9d1d9;
  font-weight: bold;
}
</style>
