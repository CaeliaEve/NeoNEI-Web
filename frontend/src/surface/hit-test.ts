import { Recipe, Slot, HitTestResult } from "../types.js";

export function hitTestRecipe(
  recipe: Recipe,
  recipeIndex: number,
  offsetX: number,
  offsetY: number,
  mouseX: number,
  mouseY: number
): HitTestResult | null {
  const localX = mouseX - offsetX;
  const localY = mouseY - offsetY;

  // Check if within recipe bounding box
  if (localX < 0 || localX > recipe.w || localY < 0 || localY > recipe.h) {
    return null;
  }

  // Check slots
  for (let i = 0; i < recipe.slots.length; i++) {
    const slot = recipe.slots[i];
    if (
      localX >= slot.x &&
      localX <= slot.x + slot.w &&
      localY >= slot.y &&
      localY <= slot.y + slot.h
    ) {
      return {
        recipeIndex,
        slotIndex: i,
        slot,
        screenX: mouseX,
        screenY: mouseY
      };
    }
  }

  return null;
}
