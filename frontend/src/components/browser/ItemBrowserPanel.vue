<template>
  <div class="item-browser-column" ref="containerRef" @wheel="handleWheel">
    <!-- Top Pager & Controls -->
    <div class="browser-top-bar">
      <button class="recipe-btn-badge" @click="$emit('open-recipe')">
        NEI
      </button>

      <div class="pager-capsule">
        <button
          class="pager-arrow"
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
          title="上一页"
        >
          &lt;
        </button>
        <span class="pager-text">
          <strong class="curr-page">{{ formattedCurrentPage }}</strong>
          <span class="divider">/</span>
          <span class="total-page">{{ formattedTotalPages }}</span>
        </span>
        <button
          class="pager-arrow"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
          title="下一页"
        >
          &gt;
        </button>
      </div>

      <span class="item-count-pill">{{ items.length }} 物</span>
    </div>

    <!-- History Strip -->
    <slot name="history" />

    <!-- Grid Viewport -->
    <div class="item-grid-viewport" ref="viewportRef">
      <div
        class="item-grid"
        :style="gridStyle"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id + ':' + (item.meta ?? 0)"
          class="item-card-slot"
          :style="{ width: itemSize + 'px', height: itemSize + 'px' }"
          :class="{ active: selectedItemId === String(item.id) }"
          @click="$emit('item-click', item)"
          @contextmenu.prevent="$emit('item-contextmenu', item, $event)"
          @mouseenter="hoveredItem = item"
          @mouseleave="hoveredItem = null"
        >
          <div class="slot-inner">
            <span class="slot-initial">{{ item.name ? item.name.slice(0, 1) : '?' }}</span>
            <span v-if="item.meta" class="meta-tag">{{ item.meta }}</span>
          </div>

          <!-- Hover Tooltip -->
          <div v-if="hoveredItem === item" class="item-tooltip">
            <div class="tooltip-title">{{ item.name }}</div>
            <div class="tooltip-meta">ID: {{ item.id }}<span v-if="item.meta">:{{ item.meta }}</span></div>
            <div v-if="item.mod" class="tooltip-mod">{{ item.mod }}</div>
            <div v-if="item.oredict && item.oredict.length" class="tooltip-ore">
              ${{ item.oredict.join(', $') }}
            </div>
            <div class="tooltip-action-hint">左键: 查看合成(R) | 右键: 查看用途(U)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import type { BrowserItem } from "../../types.js";
import { calculateCapacityMatrix } from "../../surface/capacity-matrix.js";

const props = withDefaults(
  defineProps<{
    items: BrowserItem[];
    itemSize?: number;
    selectedItemId?: string | null;
  }>(),
  {
    itemSize: 44
  }
);

const emit = defineEmits<{
  (e: "item-click", item: BrowserItem): void;
  (e: "item-contextmenu", item: BrowserItem, event: MouseEvent): void;
  (e: "open-recipe"): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const currentPage = ref(1);
const hoveredItem = ref<BrowserItem | null>(null);

// Dynamic grid capacity
const cols = ref(8);
const rows = ref(12);
const pageSize = ref(96);

let resizeObserver: ResizeObserver | null = null;

function measureGrid() {
  if (!viewportRef.value) return;
  const rect = viewportRef.value.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const matrix = calculateCapacityMatrix({
    containerWidth: rect.width,
    containerHeight: rect.height,
    itemSize: props.itemSize,
    gap: 4,
    paddingX: 8,
    paddingY: 8
  });

  cols.value = matrix.cols;
  rows.value = matrix.rows;
  pageSize.value = matrix.pageSize;

  // Clamp current page
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value);
  }
}

onMounted(() => {
  measureGrid();
  if (viewportRef.value) {
    resizeObserver = new ResizeObserver(() => {
      measureGrid();
    });
    resizeObserver.observe(viewportRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

watch(() => [props.itemSize, props.items.length], () => {
  measureGrid();
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.items.length / pageSize.value));
});

const formattedCurrentPage = computed(() => {
  return String(currentPage.value).padStart(2, "0");
});

const formattedTotalPages = computed(() => {
  return String(totalPages.value).padStart(2, "0");
});

const visibleItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return props.items.slice(start, start + pageSize.value);
});

const gridStyle = computed(() => {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${cols.value}, ${props.itemSize}px)`,
    gridAutoRows: `${props.itemSize}px`,
    gap: "4px"
  };
});

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function handleWheel(e: WheelEvent) {
  if (e.deltaY > 20) {
    changePage(currentPage.value + 1);
  } else if (e.deltaY < -20) {
    changePage(currentPage.value - 1);
  }
}
</script>

<style scoped>
.item-browser-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #090B0E;
  border-left: 1px solid #21262D;
  padding: 8px 10px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.browser-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 6px;
  gap: 8px;
  user-select: none;
}

.recipe-btn-badge {
  background: #21262D;
  border: 1px solid #30363D;
  color: #58A6FF;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.15s ease;
}

.recipe-btn-badge:hover {
  background: #30363D;
  color: #79C0FF;
}

.pager-capsule {
  display: flex;
  align-items: center;
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 20px;
  padding: 2px 8px;
  gap: 6px;
}

.pager-arrow {
  background: transparent;
  border: none;
  color: #C9D1D9;
  font-weight: 700;
  cursor: pointer;
  padding: 0 4px;
  font-size: 13px;
  line-height: 1;
}

.pager-arrow:disabled {
  color: #484F58;
  cursor: not-allowed;
}

.pager-text {
  font-family: monospace;
  font-size: 11px;
  letter-spacing: 1px;
}

.curr-page {
  color: #F0F6FC;
}

.divider {
  color: #484F58;
  margin: 0 3px;
}

.total-page {
  color: #8B949E;
}

.item-count-pill {
  font-size: 11px;
  color: #8B949E;
  background: #161B22;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #30363D;
}

.item-grid-viewport {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4px 0;
  box-sizing: border-box;
}

.item-card-slot {
  background: #12151A;
  border: 1px solid #21262D;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.1s ease, transform 0.1s ease;
  user-select: none;
}

.item-card-slot:hover {
  border-color: #58A6FF;
  z-index: 10;
  box-shadow: 0 0 6px rgba(88, 166, 255, 0.3);
}

.item-card-slot.active {
  border-color: #3FB950;
  background: #1C242C;
}

.slot-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.slot-initial {
  font-size: 14px;
  font-weight: 700;
  color: #C9D1D9;
}

.meta-tag {
  position: absolute;
  bottom: 1px;
  right: 2px;
  font-size: 9px;
  font-family: monospace;
  color: #8B949E;
  line-height: 1;
}

.item-tooltip {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  z-index: 100;
  background: rgba(16, 12, 28, 0.95);
  border: 2px solid #552288;
  border-radius: 4px;
  padding: 8px 12px;
  min-width: 180px;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

.tooltip-title {
  font-size: 13px;
  font-weight: 700;
  color: #FFFFFF;
}

.tooltip-meta {
  font-size: 11px;
  color: #8B949E;
  font-family: monospace;
  margin-top: 2px;
}

.tooltip-mod {
  font-size: 11px;
  color: #58A6FF;
  margin-top: 2px;
}

.tooltip-ore {
  font-size: 10px;
  color: #D2A8FF;
  font-family: monospace;
  margin-top: 2px;
}

.tooltip-action-hint {
  font-size: 10px;
  color: #7EE787;
  margin-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 4px;
}
</style>
