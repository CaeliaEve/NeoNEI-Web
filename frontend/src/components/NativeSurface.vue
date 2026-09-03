<template>
  <div class="surface-viewport" ref="viewportRef" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <canvas ref="canvasRef"></canvas>
    <RecipeTooltip :hit="activeHit" :visible="isTooltipVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { Recipe, HitTestResult } from "../types.js";
import { hitTestRecipe } from "../surface/hit-test.js";
import { timeline } from "../surface/timeline.js";
import { drawRecipe } from "../surface/surface-renderer.js";
import RecipeTooltip from "./RecipeTooltip.vue";

const props = defineProps<{
  recipes: Recipe[];
}>();

const viewportRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const activeHit = ref<HitTestResult | null>(null);
const isTooltipVisible = ref(false);

let ctx: CanvasRenderingContext2D | null = null;
let animFrameId: number | null = null;
let unsubscribeTimeline: (() => void) | null = null;

// Layout positions of recipes (grid layout)
const recipePositions: { x: number; y: number }[] = [];

function updateLayout() {
  if (!canvasRef.value || !viewportRef.value) return;
  const width = viewportRef.value.clientWidth;
  const height = viewportRef.value.clientHeight;

  canvasRef.value.width = width;
  canvasRef.value.height = height;

  recipePositions.length = 0;
  let curX = 24;
  let curY = 24;
  const gap = 20;

  for (let i = 0; i < props.recipes.length; i++) {
    const r = props.recipes[i];
    if (curX + r.w > width - 24 && curX > 24) {
      curX = 24;
      curY += r.h + gap;
    }
    recipePositions.push({ x: curX, y: curY });
    curX += r.w + gap;
  }
}

function render() {
  if (!ctx || !canvasRef.value) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  const tick = timeline.getTick();
  const hoverRecipeIdx = activeHit.value ? activeHit.value.recipeIndex : null;
  const hoverSlotIdx = activeHit.value ? activeHit.value.slotIndex : null;

  for (let i = 0; i < props.recipes.length; i++) {
    const pos = recipePositions[i];
    if (!pos) continue;
    drawRecipe(
      {
        ctx,
        tick,
        nowMs: performance.now(),
        hoverRecipeIndex: hoverRecipeIdx,
        hoverSlotIndex: hoverSlotIdx
      },
      props.recipes[i],
      i,
      pos.x,
      pos.y
    );
  }
}

function loop() {
  render();
  animFrameId = requestAnimationFrame(loop);
}

function onMouseMove(e: MouseEvent) {
  if (!viewportRef.value) return;
  const rect = viewportRef.value.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let foundHit: HitTestResult | null = null;
  for (let i = 0; i < props.recipes.length; i++) {
    const pos = recipePositions[i];
    if (!pos) continue;
    const hit = hitTestRecipe(props.recipes[i], i, pos.x, pos.y, mouseX, mouseY);
    if (hit) {
      foundHit = {
        ...hit,
        screenX: e.clientX,
        screenY: e.clientY
      };
      break;
    }
  }

  activeHit.value = foundHit;
  isTooltipVisible.value = foundHit !== null;
}

function onMouseLeave() {
  activeHit.value = null;
  isTooltipVisible.value = false;
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext("2d");
  }
  updateLayout();
  timeline.start();
  unsubscribeTimeline = timeline.subscribe(() => {
    // Tick event update
  });
  window.addEventListener("resize", updateLayout);
  animFrameId = requestAnimationFrame(loop);
});

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (unsubscribeTimeline) unsubscribeTimeline();
  timeline.stop();
  window.removeEventListener("resize", updateLayout);
});
</script>

<style scoped>
.surface-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #0d1117;
  cursor: default;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
