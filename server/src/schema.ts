
import { z } from 'zod';

// Superhero name schema
export const superheroNameSchema = z.object({
  id: z.number(),
  real_name: z.string(),
  keyword: z.string(),
  superhero_name: z.string(),
  created_at: z.coerce.date()
});

export type SuperheroName = z.infer<typeof superheroNameSchema>;

// Input schema for generating superhero names
export const generateSuperheroNameInputSchema = z.object({
  realName: z.string().min(1, "Real name is required"),
  keyword: z.string().min(1, "Keyword is required")
});

export type GenerateSuperheroNameInput = z.infer<typeof generateSuperheroNameInputSchema>;

// Input schema for getting superhero names
export const getSuperheroNamesInputSchema = z.object({
  limit: z.number().int().positive().max(100).default(10)
});

export type GetSuperheroNamesInput = z.infer<typeof getSuperheroNamesInputSchema>;
