<template>
  <div class="nei-app-root" :class="{ 'mobile-mode': isMobile }">
    <!-- Main Viewport -->
    <div class="nei-viewport">
      <!-- Left Rail (Collapsible) -->
      <LeftRail
        class="rail-left"
        :mods="availableMods"
        :selected-mod="selectedMod"
        @select-mod="selectedMod = $event"
        @reset-filters="resetFilters"
        @open-settings="showScaleModal = true"
      />

      <!-- Center Stage (Empty State or Recipe Dock) -->
      <main class="nei-center-stage">
        <!-- Ambient Empty State (Minecraft Slate Texture) -->
        <div v-if="!activeRecipeModalVisible" class="ambient-empty-state">
          <div class="empty-watermark">
            <span class="watermark-accent">NEO</span>NEI
          </div>
          <p class="empty-hint">在右侧面板点击物品查看合成（R）或用途（U）</p>

          <div v-if="historyItems.length > 0" class="recent-chips-container">
            <span class="chips-label">最近浏览:</span>
            <div class="chips-row">
              <button
                v-for="chip in historyItems.slice(0, 5)"
                :key="chip.id + ':' + (chip.meta ?? 0)"
                class="chip-btn"
                @click="openRecipeForItem(chip, false)"
              >
                {{ chip.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Recipe Dock Modal (Classic In-Game Chassis) -->
        <RecipeDockModal
          v-else
          :visible="activeRecipeModalVisible"
          :current-recipe="currentModalRecipe"
          :machine-categories="currentMachineCategories"
          :selected-machine-index="selectedMachineIndex"
          :current-recipe-index="currentCategoryRecipeIndex"
          :total-recipes-in-category="recipesInCurrentCategory.length"
          :can-go-back="historyStack.length > 1"
          :can-go-forward="forwardStack.length > 0"
          @close="closeRecipeDock"
          @select-machine="onSelectMachine"
          @prev-recipe="prevCategoryRecipe"
          @next-recipe="nextCategoryRecipe"
          @back="navigateHistoryBack"
          @forward="navigateHistoryForward"
          @slot-drill="handleSlotDrill"
        />
      </main>

      <!-- Right Full-Spectrum Item Browser -->
      <aside class="nei-right-browser">
        <ItemBrowserPanel
          :items="filteredItems"
          :item-size="guiScale"
          :selected-item-id="selectedItem ? String(selectedItem.id) : null"
          @item-click="openRecipeForItem($event, false)"
          @item-contextmenu="openRecipeForItem($event, true)"
          @open-recipe="toggleRecipeModal"
        >
          <template #history>
            <HistoryStrip
              :items="historyItems"
              @item-click="openRecipeForItem($event, false)"
              @item-contextmenu="openRecipeForItem($event, true)"
            />
          </template>
        </ItemBrowserPanel>
      </aside>
    </div>

    <!-- Bottom Centered NEI Search Bar -->
    <BottomSearchBar
      ref="searchBarRef"
      v-model="searchQuery"
    />

    <!-- GUI Scale Control Dialog -->
    <GuiScaleControl
      v-if="showScaleModal"
      v-model="guiScale"
      @close="showScaleModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { Recipe, Slot, BrowserItem } from "./types.js";
import { filterItems } from "./surface/search-filter.js";

import LeftRail from "./components/layout/LeftRail.vue";
import BottomSearchBar from "./components/layout/BottomSearchBar.vue";
import GuiScaleControl from "./components/layout/GuiScaleControl.vue";
import ItemBrowserPanel from "./components/browser/ItemBrowserPanel.vue";
import HistoryStrip from "./components/browser/HistoryStrip.vue";
import RecipeDockModal from "./components/dock/RecipeDockModal.vue";

// State
const allRecipes = ref<Recipe[]>([]);
const rawItems = ref<BrowserItem[]>([]);
const historyItems = ref<BrowserItem[]>([]);
const searchQuery = ref("");
const selectedMod = ref("all");
const selectedItem = ref<BrowserItem | null>(null);
const searchBarRef = ref<InstanceType<typeof BottomSearchBar> | null>(null);

// GUI Scale
const loadSavedScale = (): number => {
  try {
    const saved = localStorage.getItem("neonei:guiScale");
    return saved ? parseInt(saved, 10) : 44;
  } catch {
    return 44;
  }
};
const guiScale = ref(loadSavedScale());
const showScaleModal = ref(false);

// Mobile Breakpoint Detection
const isMobile = ref(window.innerWidth < 768);
const onResize = () => {
  isMobile.value = window.innerWidth < 768;
};

// Recipe Dock & Navigation
const activeRecipeModalVisible = ref(false);
const selectedMachineIndex = ref(0);
const currentCategoryRecipeIndex = ref(0);

interface HistoryState {
  item: BrowserItem;
  isUsage: boolean;
}
const historyStack = ref<HistoryState[]>([]);
const forwardStack = ref<HistoryState[]>([]);

// Data Fetching
onMounted(async () => {
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", handleGlobalKeydown);

  try {
    const res = await fetch("/data/recipes/gregtech.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        allRecipes.value = data;
        buildItemCatalog(data);
      }
    }
  } catch (err) {
    console.warn("Could not load /data/recipes/gregtech.json", err);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("keydown", handleGlobalKeydown);
});

// Build catalog of unique items from recipes
function buildItemCatalog(recipes: Recipe[]) {
  const itemMap = new Map<string, BrowserItem>();

  for (const r of recipes) {
    const mod = r.id.split(":")[0] || "minecraft";
    for (const s of r.slots) {
      if (s.items && s.items.length > 0) {
        for (const item of s.items) {
          const key = `${item.id}:${item.meta ?? 0}`;
          if (!itemMap.has(key)) {
            itemMap.set(key, {
              id: item.id,
              meta: item.meta ?? 0,
              name: item.name || `Item #${item.id}`,
              mod: mod === "gt" ? "gregtech" : mod
            });
          }
        }
      }
    }
  }

  rawItems.value = Array.from(itemMap.values());
}

// Available mods for filter
const availableMods = computed(() => {
  const modCount = new Map<string, number>();
  for (const item of rawItems.value) {
    const m = item.mod || "minecraft";
    modCount.set(m, (modCount.get(m) || 0) + 1);
  }
  return Array.from(modCount.entries()).map(([modId, itemCount]) => ({
    modId,
    modName: modId === "gregtech" ? "GregTech 5U" : modId.toUpperCase(),
    itemCount
  }));
});

// Filtered items
const filteredItems = computed(() => {
  let list = rawItems.value;
  if (selectedMod.value !== "all") {
    list = list.filter((i) => i.mod === selectedMod.value);
  }
  return filterItems(list, searchQuery.value);
});

// Recipe Dock Logic
function openRecipeForItem(item: BrowserItem, isUsage: boolean, pushHistory = true) {
  selectedItem.value = item;
  activeRecipeModalVisible.value = true;
  selectedMachineIndex.value = 0;
  currentCategoryRecipeIndex.value = 0;

  // Add to recent viewed items strip
  if (!historyItems.value.some((h) => h.id === item.id && h.meta === item.meta)) {
    historyItems.value.unshift(item);
    if (historyItems.value.length > 8) historyItems.value.pop();
  }

  if (pushHistory) {
    historyStack.value.push({ item, isUsage });
    forwardStack.value = [];
  }
}

// Machine categories for currently selected item
const currentMachineCategories = computed(() => {
  if (!selectedItem.value) return [];
  const targetId = selectedItem.value.id;
  const targetMeta = selectedItem.value.meta ?? 0;

  const catMap = new Map<string, Recipe[]>();
  for (const r of allRecipes.value) {
    const matches = r.slots.some((s) =>
      s.items?.some((i) => i.id === targetId && (i.meta === undefined || i.meta === targetMeta))
    );
    if (matches) {
      const type = r.type || "default";
      if (!catMap.has(type)) catMap.set(type, []);
      catMap.get(type)!.push(r);
    }
  }

  // Fallback: If no exact matching recipes, show all recipes
  if (catMap.size === 0 && allRecipes.value.length > 0) {
    catMap.set("gt.recipe.assembler", allRecipes.value.slice(0, 10));
  }

  return Array.from(catMap.entries()).map(([type, recipes]) => ({
    id: type,
    label: formatMachineLabel(type),
    count: recipes.length,
    recipes
  }));
});

function formatMachineLabel(type: string): string {
  if (type.includes("assembler")) return "组装机";
  if (type.includes("blast_furnace")) return "高炉";
  if (type.includes("chemical")) return "化学反应釜";
  return type.replace("gt.recipe.", "");
}

const recipesInCurrentCategory = computed(() => {
  const cats = currentMachineCategories.value;
  if (!cats || cats.length === 0) return [];
  const cat = cats[selectedMachineIndex.value] || cats[0];
  return cat ? cat.recipes : [];
});

const currentModalRecipe = computed(() => {
  const list = recipesInCurrentCategory.value;
  if (!list || list.length === 0) return null;
  return list[currentCategoryRecipeIndex.value] || list[0] || null;
});

function onSelectMachine(idx: number) {
  selectedMachineIndex.value = idx;
  currentCategoryRecipeIndex.value = 0;
}

function prevCategoryRecipe() {
  if (currentCategoryRecipeIndex.value > 0) {
    currentCategoryRecipeIndex.value--;
  }
}

function nextCategoryRecipe() {
  if (currentCategoryRecipeIndex.value < recipesInCurrentCategory.value.length - 1) {
    currentCategoryRecipeIndex.value++;
  }
}

function closeRecipeDock() {
  activeRecipeModalVisible.value = false;
}

function toggleRecipeModal() {
  if (activeRecipeModalVisible.value) {
    closeRecipeDock();
  } else if (rawItems.value.length > 0) {
    openRecipeForItem(rawItems.value[0], false);
  }
}

function handleSlotDrill(slot: Slot, isUsage: boolean) {
  if (slot.items && slot.items.length > 0) {
    const item = slot.items[0];
    openRecipeForItem({
      id: item.id,
      meta: item.meta ?? 0,
      name: item.name || `Item #${item.id}`
    }, isUsage);
  }
}

function navigateHistoryBack() {
  if (historyStack.value.length > 1) {
    const current = historyStack.value.pop()!;
    forwardStack.value.push(current);
    const prev = historyStack.value[historyStack.value.length - 1];
    openRecipeForItem(prev.item, prev.isUsage, false);
  }
}

function navigateHistoryForward() {
  if (forwardStack.value.length > 0) {
    const next = forwardStack.value.pop()!;
    historyStack.value.push(next);
    openRecipeForItem(next.item, next.isUsage, false);
  }
}

function resetFilters() {
  selectedMod.value = "all";
  searchQuery.value = "";
}

// Global hotkeys
function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (activeRecipeModalVisible.value) {
      closeRecipeDock();
    } else if (searchQuery.value) {
      searchQuery.value = "";
    }
  } else if (e.key === "Backspace" && !isInputActive()) {
    e.preventDefault();
    navigateHistoryBack();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
    e.preventDefault();
    searchBarRef.value?.focus();
  }
}

function isInputActive(): boolean {
  const active = document.activeElement;
  return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
}
</script>

<style scoped>
.nei-app-root {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #0D1117;
  color: #F0F6FC;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.nei-viewport {
  display: flex;
  flex: 1;
  width: 100%;
  height: calc(100vh - 44px);
  overflow: hidden;
  position: relative;
}

.nei-center-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #161B22 0%, #0D1117 100%);
  position: relative;
  overflow: hidden;
}

.ambient-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  opacity: 0.85;
}

.empty-watermark {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 4px;
  color: #21262D;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.watermark-accent {
  color: #58A6FF;
  opacity: 0.4;
}

.empty-hint {
  font-size: 13px;
  color: #484F58;
  margin-top: 10px;
  letter-spacing: 0.5px;
}

.recent-chips-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.chips-label {
  font-size: 11px;
  color: #484F58;
}

.chips-row {
  display: flex;
  gap: 6px;
}

.chip-btn {
  background: #161B22;
  border: 1px solid #30363D;
  color: #8B949E;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip-btn:hover {
  border-color: #58A6FF;
  color: #F0F6FC;
  background: #21262D;
}

.nei-right-browser {
  width: 380px;
  min-width: 280px;
  max-width: 520px;
  height: 100%;
}

/* Tablet Layout (768px ~ 1279px) */
@media (max-width: 1279px) {
  .nei-right-browser {
    width: 340px;
  }
}

/* Mobile Layout (< 768px) */
@media (max-width: 767px) {
  .nei-viewport {
    flex-direction: column;
  }

  .rail-left {
    display: none;
  }

  .nei-right-browser {
    width: 100%;
    max-width: 100%;
    flex: 1;
  }

  /* Bottom Sheet Overlay on Mobile */
  .nei-center-stage {
    position: fixed;
    inset: 0;
    z-index: 200;
    pointer-events: none;
    background: transparent;
  }

  .recipe-dock-container {
    pointer-events: auto;
    align-items: flex-end !important;
    padding: 0 !important;
    background: rgba(0, 0, 0, 0.7);
  }

  .recipe-dock-chassis {
    border-radius: 16px 16px 0 0 !important;
    max-height: 80vh !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
