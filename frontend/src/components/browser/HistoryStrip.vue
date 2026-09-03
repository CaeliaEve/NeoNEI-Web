<template>
  <div v-if="items.length > 0" class="history-strip">
    <span class="history-label">历史</span>
    <div class="history-items">
      <div
        v-for="item in items"
        :key="item.id + ':' + (item.meta ?? 0)"
        class="history-item-slot"
        :title="item.name"
        @click="$emit('item-click', item)"
        @contextmenu.prevent="$emit('item-contextmenu', item, $event)"
      >
        <span class="history-item-icon">{{ item.name.slice(0, 1) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrowserItem } from "../../types.js";

defineProps<{
  items: BrowserItem[];
}>();

defineEmits<{
  (e: "item-click", item: BrowserItem): void;
  (e: "item-contextmenu", item: BrowserItem, event: MouseEvent): void;
}>();
</script>

<style scoped>
.history-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: rgba(13, 17, 23, 0.85);
  border: 1px solid #30363D;
  border-radius: 6px;
  margin-bottom: 6px;
  min-height: 34px;
}

.history-label {
  font-size: 11px;
  color: #8B949E;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-items {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
}

.history-item-slot {
  width: 24px;
  height: 24px;
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.history-item-slot:hover {
  border-color: #58A6FF;
  background: #21262D;
  transform: translateY(-1px);
}

.history-item-icon {
  font-size: 11px;
  font-weight: 700;
  color: #C9D1D9;
}
</style>
