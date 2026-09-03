import { Recipe, Slot } from "../types.js";
import { atlasRegistry } from "./atlas.js";

export interface RenderContext {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  tick: number;
  nowMs: number;
  hoverSlotIndex: number | null;
  hoverRecipeIndex: number | null;
}

export function drawRecipe(
  rc: RenderContext,
  recipe: Recipe,
  recipeIndex: number,
  x: number,
  y: number
) {
  const { ctx, tick, hoverSlotIndex, hoverRecipeIndex } = rc;

  // 1. Draw outer dark industrial container
  ctx.save();
  ctx.translate(x, y);

  // Background panel
  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, recipe.w, recipe.h);

  // Border
  ctx.strokeStyle = "#21262d";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, recipe.w - 1, recipe.h - 1);

  // Header / Type label
  ctx.fillStyle = "#8b949e";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(recipe.label || recipe.type, 8, 14);

  // 2. Draw progress arrow if present
  const progressRatio = (tick % 40) / 40; // 2-second cycle
  ctx.fillStyle = "#21262d"; // background track
  ctx.fillRect(85, 36, 24, 16);
  ctx.fillStyle = "#d29922"; // amber/gold filled progress
  ctx.fillRect(85, 36, Math.floor(24 * progressRatio), 16);

  // Arrowhead outline
  ctx.beginPath();
  ctx.moveTo(109, 34);
  ctx.lineTo(117, 44);
  ctx.lineTo(109, 54);
  ctx.fillStyle = "#30363d";
  ctx.fill();

  // 3. Draw slots
  for (let i = 0; i < recipe.slots.length; i++) {
    const slot = recipe.slots[i];
    const isHovered = hoverRecipeIndex === recipeIndex && hoverSlotIndex === i;
    drawSlot(ctx, slot, isHovered, tick, rc.nowMs);
  }

  // 4. Draw machine environment stats (EU/t and duration ticks)
  if (recipe.env) {
    ctx.fillStyle = "#58a6ff";
    ctx.font = "10px monospace";
    const envText = `${recipe.env.tier || "LV"} | ${recipe.env.eut} EU/t | ${recipe.env.ticks}t`;
    ctx.fillText(envText, 8, recipe.h - 8);
  }

  ctx.restore();
}

function drawSlot(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  slot: Slot,
  isHovered: boolean,
  tick: number,
  nowMs: number
) {
  const { x, y, w, h, kind, role, items, fluid, chance } = slot;

  // Slot background
  ctx.fillStyle = "#12151a";
  ctx.fillRect(x, y, w, h);

  // Minecraft-style dark inset bevel
  // Top and left dark shadow
  ctx.fillStyle = "#090b0e";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);

  // Bottom and right subtle highlight
  ctx.fillStyle = "#2d333b";
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x + w - 1, y, 1, h);

  // Hover highlight overlay
  if (isHovered) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  }

  // Draw content
  if (kind === "fluid" && fluid) {
    // Try to draw animated fluid texture from atlas first
    const drawn = atlasRegistry.drawSprite(ctx, `fluid:${fluid.id}`, x + 2, y + 2, w - 4, h - 4, nowMs);
    if (!drawn) {
      // Fluid level fill fallback
      ctx.fillStyle = "#1f6feb";
      const fluidH = Math.max(2, Math.floor(h * 0.8));
      ctx.fillRect(x + 2, y + h - fluidH - 1, w - 4, fluidH);

      // Fluid capacity tick markers
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      for (let my = y + 8; my < y + h - 4; my += 8) {
        ctx.fillRect(x + 2, my, 4, 1);
      }
    }
  } else if (items && items.length > 0) {
    // Handle OreDict cycling: if multiple items, cycle every 30 ticks (1.5s)
    const activeItemIdx = Math.floor(tick / 30) % items.length;
    const item = items[activeItemIdx];

    const spriteKey = `item:${item.id}:${item.meta || 0}`;
    const drawn = atlasRegistry.drawSprite(ctx, spriteKey, x + 2, y + 2, w - 4, h - 4, nowMs);
    if (!drawn) {
      // Fallback stylized icon block
      ctx.fillStyle = role === "out" ? "#3fb950" : "#8b949e";
      ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    }

    // Item count in bottom right
    if (item.count && item.count > 1) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(item.count), x + w - 2, y + h - 2);
      ctx.textAlign = "left"; // reset
    }
  }

  // Draw chance badge if < 100%
  if (chance && chance < 1.0) {
    ctx.fillStyle = "#d29922";
    ctx.font = "8px sans-serif";
    const pct = `${Math.round(chance * 100)}%`;
    ctx.fillText(pct, x + 2, y + 8);
  }
}
