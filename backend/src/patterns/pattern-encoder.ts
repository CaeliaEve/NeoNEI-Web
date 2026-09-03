import { z } from "zod";

export const PatternStackSchema = z.object({
  id: z.string(),
  meta: z.number().int().default(0),
  count: z.number().int().default(1),
  nbt: z.string().nullable().optional()
});

export type PatternStack = z.infer<typeof PatternStackSchema>;

export const PatternEntrySchema = z.object({
  patternId: z.string(),
  patternName: z.string(),
  crafting: z.boolean().default(true),
  substitute: z.boolean().default(false),
  inputs: z.array(PatternStackSchema),
  outputs: z.array(PatternStackSchema)
});

export type PatternEntry = z.infer<typeof PatternEntrySchema>;

export const PatternExportDocumentSchema = z.object({
  version: z.number().default(1),
  exportedAt: z.string(),
  count: z.number().int(),
  patterns: z.array(PatternEntrySchema)
});

export type PatternExportDocument = z.infer<typeof PatternExportDocumentSchema>;

export function encodePatternDocument(patterns: PatternEntry[]): PatternExportDocument {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    count: patterns.length,
    patterns
  };
}

export function decodePatternDocument(raw: unknown): PatternExportDocument {
  return PatternExportDocumentSchema.parse(raw);
}
