<template>
  <aside class="left-rail" :class="{ collapsed: isCollapsed }">
    <!-- Rail Header -->
    <div class="rail-header">
      <div v-if="!isCollapsed" class="rail-logo">
        <span class="logo-accent">NEO</span>NEI
      </div>
      <button
        class="collapse-toggle-btn"
        @click="isCollapsed = !isCollapsed"
        :title="isCollapsed ? '展开侧栏' : '收起侧栏'"
      >
        {{ isCollapsed ? '&raquo;' : '&laquo;' }}
      </button>
    </div>

    <!-- Expanded Body -->
    <div v-if="!isCollapsed" class="rail-body">
      <!-- Mod Filter Section -->
      <div class="filter-section">
        <label class="section-title">模组筛选</label>
        <select
          class="chrome-select"
          :value="selectedMod"
          @change="$emit('select-mod', ($event.target as HTMLSelectElement).value)"
        >
          <option value="all">全部模组</option>
          <option v-for="m in mods" :key="m.modId" :value="m.modId">
            {{ m.modName }} ({{ m.itemCount }})
          </option>
        </select>
      </div>

      <!-- Quick Action Buttons -->
      <div class="rail-actions">
        <button class="rail-btn reset-btn" @click="$emit('reset-filters')">
          重置筛选
        </button>
        <button class="rail-btn settings-btn" @click="$emit('open-settings')">
          系统设置
        </button>
      </div>
    </div>

    <!-- Collapsed Rail Icons (For Tablet/Compact) -->
    <div v-else class="collapsed-icons">
      <button class="icon-chip" @click="isCollapsed = false" title="模组筛选">
        M
      </button>
      <button class="icon-chip" @click="$emit('open-settings')" title="设置">
        &#9881;
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  mods: { modId: string; modName: string; itemCount: number }[];
  selectedMod: string;
}>();

defineEmits<{
  (e: "select-mod", modId: string): void;
  (e: "reset-filters"): void;
  (e: "open-settings"): void;
}>();

const isCollapsed = ref(false);
</script>

<style scoped>
.left-rail {
  display: flex;
  flex-direction: column;
  width: 220px;
  background: #090B0E;
  border-right: 1px solid #21262D;
  transition: width 0.2s ease;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  user-select: none;
}

.left-rail.collapsed {
  width: 48px;
}

.rail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #21262D;
  min-height: 48px;
  box-sizing: border-box;
}

.rail-logo {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #F0F6FC;
}

.logo-accent {
  color: #58A6FF;
}

.collapse-toggle-btn {
  background: #161B22;
  border: 1px solid #30363D;
  color: #8B949E;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 8px;
  font-size: 13px;
  line-height: 1;
  transition: all 0.15s ease;
}

.collapse-toggle-btn:hover {
  background: #21262D;
  color: #F0F6FC;
}

.rail-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #8B949E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chrome-select {
  width: 100%;
  background: #161B22;
  border: 1px solid #30363D;
  color: #F0F6FC;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}

.chrome-select:focus {
  border-color: #58A6FF;
}

.rail-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.rail-btn {
  background: #161B22;
  border: 1px solid #30363D;
  color: #C9D1D9;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rail-btn:hover {
  background: #21262D;
  color: #F0F6FC;
}

.reset-btn:hover {
  border-color: #F85149;
  color: #FF7B72;
}

.collapsed-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
}

.icon-chip {
  width: 32px;
  height: 32px;
  background: #161B22;
  border: 1px solid #30363D;
  color: #C9D1D9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
}

.icon-chip:hover {
  border-color: #58A6FF;
  background: #21262D;
}
</style>
