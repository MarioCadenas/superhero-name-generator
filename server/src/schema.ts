
import { z } from 'zod';

// Superhero generation request schema
export const generateSuperheroNameInputSchema = z.object({
  realName: z.string().min(1, 'Real name is required').max(100, 'Real name too long'),
  keyword: z.string().min(1, 'Keyword is required').max(50, 'Keyword too long')
});

export type GenerateSuperheroNameInput = z.infer<typeof generateSuperheroNameInputSchema>;

// Superhero name response schema
export const superheroNameSchema = z.object({
  id: z.number(),
  realName: z.string(),
  keyword: z.string(),
  superheroName: z.string(),
  createdAt: z.coerce.date()
});

export type SuperheroName = z.infer<typeof superheroNameSchema>;

// Input schema for getting superhero names history
export const getSuperheroNamesInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(10)
});

export type GetSuperheroNamesInput = z.infer<typeof getSuperheroNamesInputSchema>;
