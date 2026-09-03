import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createServer } from "../dist/server.js";

test("NeoNEI Backend handles health and pattern encoding", async () => {
  const app = createServer();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Health test
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assert.equal(healthRes.status, "ok");

    // 2. Pattern encoding test
    const samplePattern = {
      patternId: "pat-assembler-1",
      patternName: "Circuit Pattern",
      crafting: true,
      substitute: false,
      inputs: [{ id: "minecraft:iron_ingot", meta: 0, count: 2 }],
      outputs: [{ id: "gregtech:circuit", meta: 0, count: 1 }]
    };

    const encodeRes = await fetch(`${baseUrl}/patterns/encode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(samplePattern)
    }).then((r) => r.json());

    assert.equal(encodeRes.count, 1);
    assert.equal(encodeRes.patterns[0].patternId, "pat-assembler-1");

    // 3. Get single pattern test
    const getRes = await fetch(`${baseUrl}/patterns/pat-assembler-1`).then((r) => r.json());
    assert.equal(getRes.patternName, "Circuit Pattern");
  } finally {
    server.close();
  }
});
