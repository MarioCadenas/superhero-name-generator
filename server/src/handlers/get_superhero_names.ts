
import { db } from '../db';
import { superheroNamesTable } from '../db/schema';
import { type GetSuperheroNamesInput, type SuperheroName } from '../schema';
import { desc } from 'drizzle-orm';

export async function getSuperheroNames(input: GetSuperheroNamesInput): Promise<SuperheroName[]> {
  // Fetch recent superhero names from the database, ordered by creation date (newest first)
  const results = await db
    .select()
    .from(superheroNamesTable)
    .orderBy(desc(superheroNamesTable.created_at))
    .limit(input.limit);
  
  return results;
}
