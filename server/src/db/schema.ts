
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const superheroNamesTable = pgTable('superhero_names', {
  id: serial('id').primaryKey(),
  realName: text('real_name').notNull(),
  keyword: text('keyword').notNull(),
  superheroName: text('superhero_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type SuperheroName = typeof superheroNamesTable.$inferSelect;
export type NewSuperheroName = typeof superheroNamesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { superheroNames: superheroNamesTable };
