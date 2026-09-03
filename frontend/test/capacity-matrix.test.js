import test from "node:test";
import assert from "node:assert/strict";
import { calculateCapacityMatrix } from "../src/surface/capacity-matrix.ts";

test("calculateCapacityMatrix correctly calculates columns, rows, and pageSize", () => {
  // Test 1: Standard 1080p right panel (width: 480px, height: 800px, itemSize: 44px, gap: 4px)
  const result1080p = calculateCapacityMatrix({
    containerWidth: 480,
    containerHeight: 800,
    itemSize: 44,
    gap: 4,
    paddingX: 16,
    paddingY: 16
  });

  // availableWidth = 480 - 16 = 464. Each slot takes 44 + 4 = 48px. 464 / 48 = 9.66 -> 9 cols
  // availableHeight = 800 - 16 = 784. 784 / 48 = 16.33 -> 16 rows
  assert.equal(result1080p.cols, 9);
  assert.equal(result1080p.rows, 16);
  assert.equal(result1080p.pageSize, 144);
  assert.equal(result1080p.itemSize, 44);

  // Test 2: Mobile small screen (width: 360px, height: 600px, itemSize: 36px, gap: 4px)
  const resultMobile = calculateCapacityMatrix({
    containerWidth: 360,
    containerHeight: 600,
    itemSize: 36,
    gap: 4,
    paddingX: 12,
    paddingY: 12
  });
  // availableWidth = 360 - 12 = 348. slot = 40. 348 / 40 = 8.7 -> 8 cols
  // availableHeight = 600 - 12 = 588. 588 / 40 = 14.7 -> 14 rows
  assert.equal(resultMobile.cols, 8);
  assert.equal(resultMobile.rows, 14);
  assert.equal(resultMobile.pageSize, 112);

  // Test 3: Edge case: Extremely small container guarantees at least 1 col and 1 row
  const resultTiny = calculateCapacityMatrix({
    containerWidth: 20,
    containerHeight: 20,
    itemSize: 44,
    gap: 4,
    paddingX: 0,
    paddingY: 0
  });
  assert.equal(resultTiny.cols, 1);
  assert.equal(resultTiny.rows, 1);
  assert.equal(resultTiny.pageSize, 1);
});
