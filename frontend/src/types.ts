export interface SlotItem {
  id: number;
  meta?: number;
  count?: number;
  name?: string;
  nbt?: string;
}

export interface SlotFluid {
  id: string;
  amount: number;
}

export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "item" | "fluid";
  role: "in" | "out" | "cat";
  items?: SlotItem[];
  fluid?: SlotFluid;
  chance?: number;
}

export interface RecipeEnv {
  ticks: number;
  eut: number;
  tier?: string;
  special?: Record<string, string | number>;
}

export interface Recipe {
  id: string;
  type: string;
  label?: string;
  w: number;
  h: number;
  slots: Slot[];
  env?: RecipeEnv;
}

export interface HitTestResult {
  recipeIndex: number;
  slotIndex: number;
  slot: Slot;
  screenX: number;
  screenY: number;
}
