
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { superheroNamesTable } from '../db/schema';
import { type GetSuperheroNamesInput } from '../schema';
import { getSuperheroNames } from '../handlers/get_superhero_names';

describe('getSuperheroNames', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no superhero names exist', async () => {
    const input: GetSuperheroNamesInput = { limit: 10 };
    const result = await getSuperheroNames(input);
    
    expect(result).toEqual([]);
  });

  it('should return superhero names ordered by creation date (newest first)', async () => {
    // Create test data with specific timestamps to control order
    const baseTime = new Date('2024-01-01T00:00:00Z');
    
    // Insert first superhero name
    await db.insert(superheroNamesTable).values({
      real_name: 'John Doe',
      keyword: 'fire',
      superhero_name: 'Captain Fireblaze',
      created_at: new Date(baseTime.getTime() + 1000) // 1 second later
    });

    // Insert second superhero name (should appear first in results)
    await db.insert(superheroNamesTable).values({
      real_name: 'Jane Smith',
      keyword: 'ice',
      superhero_name: 'The Mighty Frostguard',
      created_at: new Date(baseTime.getTime() + 2000) // 2 seconds later
    });

    // Insert third superhero name
    await db.insert(superheroNamesTable).values({
      real_name: 'Bob Wilson',
      keyword: 'thunder',
      superhero_name: 'Agent Stormstar',
      created_at: baseTime // earliest time
    });

    const input: GetSuperheroNamesInput = { limit: 10 };
    const result = await getSuperheroNames(input);

    expect(result).toHaveLength(3);
    
    // Verify order (newest first)
    expect(result[0].superhero_name).toEqual('The Mighty Frostguard');
    expect(result[1].superhero_name).toEqual('Captain Fireblaze');
    expect(result[2].superhero_name).toEqual('Agent Stormstar');
    
    // Verify all required fields are present
    result.forEach(superhero => {
      expect(superhero.id).toBeDefined();
      expect(superhero.real_name).toBeDefined();
      expect(superhero.keyword).toBeDefined();
      expect(superhero.superhero_name).toBeDefined();
      expect(superhero.created_at).toBeInstanceOf(Date);
    });
  });

  it('should respect the limit parameter', async () => {
    // Create 5 test superhero names
    for (let i = 0; i < 5; i++) {
      await db.insert(superheroNamesTable).values({
        real_name: `Hero ${i}`,
        keyword: `power${i}`,
        superhero_name: `Captain Power${i}`,
        created_at: new Date(Date.now() + i * 1000) // Different timestamps
      });
    }

    // Test with limit of 3
    const input: GetSuperheroNamesInput = { limit: 3 };
    const result = await getSuperheroNames(input);

    expect(result).toHaveLength(3);
    
    // Should return the 3 most recent (highest timestamps)
    expect(result[0].superhero_name).toEqual('Captain Power4');
    expect(result[1].superhero_name).toEqual('Captain Power3');
    expect(result[2].superhero_name).toEqual('Captain Power2');
  });

  it('should return single result when limit is 1', async () => {
    // Create multiple superhero names
    await db.insert(superheroNamesTable).values({
      real_name: 'Old Hero',
      keyword: 'old',
      superhero_name: 'The Ancient One',
      created_at: new Date('2024-01-01T00:00:00Z')
    });

    await db.insert(superheroNamesTable).values({
      real_name: 'New Hero',
      keyword: 'new',
      superhero_name: 'The Modern Guardian',
      created_at: new Date('2024-01-02T00:00:00Z')
    });

    const input: GetSuperheroNamesInput = { limit: 1 };
    const result = await getSuperheroNames(input);

    expect(result).toHaveLength(1);
    expect(result[0].superhero_name).toEqual('The Modern Guardian');
  });

  it('should handle default limit correctly', async () => {
    // Create 15 test superhero names (more than default limit of 10)
    for (let i = 0; i < 15; i++) {
      await db.insert(superheroNamesTable).values({
        real_name: `Hero ${i}`,
        keyword: `keyword${i}`,
        superhero_name: `Superhero ${i}`,
        created_at: new Date(Date.now() + i * 1000)
      });
    }

    // Use default limit (should be 10 based on schema)
    const input: GetSuperheroNamesInput = { limit: 10 };
    const result = await getSuperheroNames(input);

    expect(result).toHaveLength(10);
    
    // Should return the 10 most recent
    expect(result[0].superhero_name).toEqual('Superhero 14');
    expect(result[9].superhero_name).toEqual('Superhero 5');
  });

  it('should return all superhero names when limit exceeds available records', async () => {
    // Create only 3 superhero names
    for (let i = 0; i < 3; i++) {
      await db.insert(superheroNamesTable).values({
        real_name: `Hero ${i}`,
        keyword: `power${i}`,
        superhero_name: `Captain ${i}`,
        created_at: new Date(Date.now() + i * 1000)
      });
    }

    // Request more than available
    const input: GetSuperheroNamesInput = { limit: 50 };
    const result = await getSuperheroNames(input);

    expect(result).toHaveLength(3);
    
    // Should still be ordered correctly
    expect(result[0].superhero_name).toEqual('Captain 2');
    expect(result[1].superhero_name).toEqual('Captain 1');
    expect(result[2].superhero_name).toEqual('Captain 0');
  });
});
