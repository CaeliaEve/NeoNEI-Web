import express from "express";
import cors from "cors";
import compression from "compression";
import * as path from "node:path";
import * as fs from "node:fs";
import { encodePatternDocument, PatternEntrySchema, PatternEntry } from "./patterns/pattern-encoder.js";

export function createServer(dataDir?: string) {
  const app = express();

  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));

  // Health endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });

  // In-memory store for pattern drafts
  const patternStore = new Map<string, PatternEntry>();

  // Pattern encode endpoint
  app.post("/patterns/encode", (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const parsed = items.map((item) => PatternEntrySchema.parse(item));
      for (const p of parsed) {
        patternStore.set(p.patternId, p);
      }
      const doc = encodePatternDocument(parsed);
      res.json(doc);
    } catch (err: unknown) {
      res.status(400).json({
        error: "Invalid pattern entry",
        message: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // Get all saved pattern drafts
  app.get("/patterns", (req, res) => {
    const list = Array.from(patternStore.values());
    res.json({ count: list.length, patterns: list });
  });

  // Get single pattern
  app.get("/patterns/:id", (req, res) => {
    const pattern = patternStore.get(req.params.id);
    if (!pattern) {
      return res.status(404).json({ error: "Pattern not found" });
    }
    res.json(pattern);
  });

  // Static immutable data plane
  const resolvedDataDir = dataDir || path.resolve(process.cwd(), "public/dist-data");
  if (fs.existsSync(resolvedDataDir)) {
    app.use("/data", express.static(resolvedDataDir, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("manifest.json")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      }
    }));
  }

  return app;
}

// Start standalone if executed directly
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  const port = parseInt(process.env.PORT || "3000", 10);
  const dataDir = process.env.DATA_DIR;
  const app = createServer(dataDir);
  app.listen(port, () => {
    console.log(`[NeoNEI Backend] Listening on http://127.0.0.1:${port}`);
  });
}
