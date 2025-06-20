
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { superheroNamesTable } from '../db/schema';
import { type GenerateSuperheroNameInput } from '../schema';
import { generateSuperheroName } from '../handlers/generate_superhero_name';
import { eq } from 'drizzle-orm';

const testInput: GenerateSuperheroNameInput = {
  realName: 'John Smith',
  keyword: 'fire'
};

describe('generateSuperheroName', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate a superhero name', async () => {
    const result = await generateSuperheroName(testInput);

    expect(result.real_name).toEqual('John Smith');
    expect(result.keyword).toEqual('fire');
    expect(result.superhero_name).toBeDefined();
    expect(typeof result.superhero_name).toBe('string');
    expect(result.superhero_name.length).toBeGreaterThan(0);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save the superhero name to database', async () => {
    const result = await generateSuperheroName(testInput);

    const records = await db.select()
      .from(superheroNamesTable)
      .where(eq(superheroNamesTable.id, result.id))
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].real_name).toEqual('John Smith');
    expect(records[0].keyword).toEqual('fire');
    expect(records[0].superhero_name).toEqual(result.superhero_name);
    expect(records[0].created_at).toBeInstanceOf(Date);
  });

  it('should generate different names for different inputs', async () => {
    const input1: GenerateSuperheroNameInput = {
      realName: 'Alice Johnson',
      keyword: 'lightning'
    };
    
    const input2: GenerateSuperheroNameInput = {
      realName: 'Bob Wilson',
      keyword: 'steel'
    };

    const result1 = await generateSuperheroName(input1);
    const result2 = await generateSuperheroName(input2);

    expect(result1.superhero_name).not.toEqual(result2.superhero_name);
    expect(result1.real_name).toEqual('Alice Johnson');
    expect(result1.keyword).toEqual('lightning');
    expect(result2.real_name).toEqual('Bob Wilson');
    expect(result2.keyword).toEqual('steel');
  });

  it('should handle single word names', async () => {
    const input: GenerateSuperheroNameInput = {
      realName: 'Superman',
      keyword: 'strength'
    };

    const result = await generateSuperheroName(input);

    expect(result.real_name).toEqual('Superman');
    expect(result.keyword).toEqual('strength');
    expect(result.superhero_name).toBeDefined();
    expect(result.superhero_name.length).toBeGreaterThan(0);
  });

  it('should handle names with extra spaces', async () => {
    const input: GenerateSuperheroNameInput = {
      realName: '  Peter   Parker  ',
      keyword: '  spider  '
    };

    const result = await generateSuperheroName(input);

    expect(result.real_name).toEqual('  Peter   Parker  ');
    expect(result.keyword).toEqual('  spider  ');
    expect(result.superhero_name).toBeDefined();
    expect(result.superhero_name.length).toBeGreaterThan(0);
  });

  it('should generate names with reasonable length', async () => {
    const input: GenerateSuperheroNameInput = {
      realName: 'Bartholomew Maximilian Archibald',
      keyword: 'electromagnetic'
    };

    const result = await generateSuperheroName(input);

    expect(result.superhero_name).toBeDefined();
    expect(result.superhero_name.length).toBeLessThanOrEqual(50);
    expect(result.superhero_name.length).toBeGreaterThan(0);
  });

  it('should create multiple unique records', async () => {
    const input1: GenerateSuperheroNameInput = {
      realName: 'Diana Prince',
      keyword: 'wisdom'
    };
    
    const input2: GenerateSuperheroNameInput = {
      realName: 'Bruce Wayne',
      keyword: 'shadow'
    };

    const result1 = await generateSuperheroName(input1);
    const result2 = await generateSuperheroName(input2);

    expect(result1.id).not.toEqual(result2.id);
    
    const allRecords = await db.select()
      .from(superheroNamesTable)
      .execute();

    expect(allRecords).toHaveLength(2);
    expect(allRecords.find(r => r.id === result1.id)).toBeDefined();
    expect(allRecords.find(r => r.id === result2.id)).toBeDefined();
  });

  it('should incorporate keyword in generated name', async () => {
    const input: GenerateSuperheroNameInput = {
      realName: 'Clark Kent',
      keyword: 'ice'
    };

    const result = await generateSuperheroName(input);

    // The generated name should contain the keyword or a variation of it
    const nameLower = result.superhero_name.toLowerCase();
    expect(nameLower).toMatch(/ice/i);
  });
});
