import { z } from "zod";

const stringOrArray = () => z.union([z.string(), z.array(z.string())]);

const mixedOrArray = () =>
  z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z.array(z.number()),
    z.array(z.union([z.string(), z.number()])),
  ]);

const urlField = () =>
  z.union([
    z.string(),
    z.array(z.string()),
  ]).optional();

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

const featuresSchema = z.object({
  qol: z.array(z.string()).optional(),
  tone: z.array(z.string()).optional(),
  scale: z.array(z.string()).optional(),
  sprites: z.array(z.string()).optional(),
  new_features: z.array(z.string()).optional(),
  catchable_pokemons: z.array(z.string()).optional(),
  gameplay_difficulty: z.array(z.string()).optional(),
  altered_adjusted_gameplay: z.array(z.string()).optional(),
}).nullable().optional();

export const romSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  console: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  gallery: z.array(z.string()).nullable().optional(),
  base_game: z.array(z.string()).nullable().optional(),
  language: z.array(z.string()).nullable().optional(),
  status: z.array(z.string()).nullable().optional(),
  content: z.array(z.string()).nullable().optional(),
  version: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  date_updated: z.string().nullable().optional(),
  features: featuresSchema,
  links: z.array(z.string()).nullable().optional(),
});

export type Rom = z.infer<typeof romSchema>;

export type SearchFilters = {
  baseGame: string[];
  status: string[];
  difficulty: string[];
  features: string[];
};

export type RomFrontmatter = Rom & {
  slug: string;
}; 