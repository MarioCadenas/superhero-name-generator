
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const superheroNamesTable = pgTable('superhero_names', {
  id: serial('id').primaryKey(),
  real_name: text('real_name').notNull(),
  keyword: text('keyword').notNull(),
  superhero_name: text('superhero_name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type SuperheroName = typeof superheroNamesTable.$inferSelect;
export type NewSuperheroName = typeof superheroNamesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { superheroNames: superheroNamesTable };
