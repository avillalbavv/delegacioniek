import { z } from "zod";

const romCatalogEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  license: z.string().min(1),
  licenseUrl: z.string().url(),
  sourceUrl: z.string().url(),
  rom: z.string().regex(/^\/roms\/[a-zA-Z0-9._-]+\.gba$/),
  cover: z.string().regex(/^\/roms\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp|svg)$/).optional(),
});

const romCatalogSchema = z.object({
  games: z.array(romCatalogEntrySchema),
});

export type RomCatalogEntry = z.infer<typeof romCatalogEntrySchema>;

export function parseRomCatalog(value: unknown): RomCatalogEntry[] {
  return romCatalogSchema.parse(value).games;
}
