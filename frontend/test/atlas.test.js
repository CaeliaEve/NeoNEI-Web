import test from "node:test";
import assert from "node:assert/strict";
import { AtlasRegistry } from "../src/surface/atlas.ts";

test("AtlasRegistry correctly handles animated sprite timelines", () => {
  const registry = new AtlasRegistry();

  // Register animated water sprite (3 frames, 50ms each -> 150ms cycle)
  registry.registerSprite("fluid:water", {
    page: "atlas_0.webp",
    x: 0,
    y: 0,
    w: 16,
    h: 16,
    animated: {
      totalDurationMs: 150,
      timeline: [
        { frameIndex: 0, durationMs: 50 },
        { frameIndex: 1, durationMs: 50 },
        { frameIndex: 2, durationMs: 50 }
      ],
      frames: [
        { index: 0, x: 0, y: 0, w: 16, h: 16 },
        { index: 1, x: 0, y: 16, w: 16, h: 16 },
        { index: 2, x: 0, y: 32, w: 16, h: 16 }
      ]
    }
  });

  const sprite = registry.getSprite("fluid:water");
  assert.ok(sprite);
  assert.equal(sprite.animated.totalDurationMs, 150);
  assert.equal(sprite.animated.frames.length, 3);

  // Mock canvas context and image
  let drawnSrc = null;
  const mockPageImg = {};
  registry.registerPageImage("atlas_0.webp", mockPageImg);

  const mockCtx = {
    drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
      drawnSrc = { sx, sy, sw, sh };
    }
  };

  // At nowMs = 20ms: Frame 0 (sy: 0)
  registry.drawSprite(mockCtx, "fluid:water", 0, 0, 16, 16, 20);
  assert.deepEqual(drawnSrc, { sx: 0, sy: 0, sw: 16, sh: 16 });

  // At nowMs = 75ms: Frame 1 (sy: 16)
  registry.drawSprite(mockCtx, "fluid:water", 0, 0, 16, 16, 75);
  assert.deepEqual(drawnSrc, { sx: 0, sy: 16, sw: 16, sh: 16 });

  // At nowMs = 130ms: Frame 2 (sy: 32)
  registry.drawSprite(mockCtx, "fluid:water", 0, 0, 16, 16, 130);
  assert.deepEqual(drawnSrc, { sx: 0, sy: 32, sw: 16, sh: 16 });

  // At nowMs = 170ms (loops back: 170 % 150 = 20ms): Frame 0 (sy: 0)
  registry.drawSprite(mockCtx, "fluid:water", 0, 0, 16, 16, 170);
  assert.deepEqual(drawnSrc, { sx: 0, sy: 0, sw: 16, sh: 16 });
});
