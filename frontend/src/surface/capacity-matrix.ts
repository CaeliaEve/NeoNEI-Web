export interface CapacityMatrixOptions {
  containerWidth: number;
  containerHeight: number;
  itemSize: number;
  gap?: number;
  paddingX?: number;
  paddingY?: number;
}

export interface CapacityMatrixResult {
  cols: number;
  rows: number;
  pageSize: number;
  itemSize: number;
  gap: number;
}

/**
 * Dynamically calculates the exact number of columns, rows, and total items
 * that can fit into a given container dimensions with zero overflow and zero awkward half-slots.
 */
export function calculateCapacityMatrix(options: CapacityMatrixOptions): CapacityMatrixResult {
  const gap = options.gap ?? 4;
  const paddingX = options.paddingX ?? 0;
  const paddingY = options.paddingY ?? 0;
  const itemSize = Math.max(16, options.itemSize);

  const availableW = Math.max(0, options.containerWidth - paddingX);
  const availableH = Math.max(0, options.containerHeight - paddingY);

  const slotW = itemSize + gap;
  const slotH = itemSize + gap;

  const cols = Math.max(1, Math.floor((availableW + gap) / slotW));
  const rows = Math.max(1, Math.floor((availableH + gap) / slotH));

  return {
    cols,
    rows,
    pageSize: cols * rows,
    itemSize,
    gap
  };
}
