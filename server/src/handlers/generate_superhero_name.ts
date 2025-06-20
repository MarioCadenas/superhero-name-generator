
import { db } from '../db';
import { superheroNamesTable } from '../db/schema';
import { type GenerateSuperheroNameInput, type SuperheroName } from '../schema';

export async function generateSuperheroName(input: GenerateSuperheroNameInput): Promise<SuperheroName> {
  // Sophisticated superhero name generation algorithm
  const superheroName = createSuperheroName(input.realName, input.keyword);
  
  // Insert the generated name into the database
  const [result] = await db.insert(superheroNamesTable).values({
    real_name: input.realName,
    keyword: input.keyword,
    superhero_name: superheroName,
  }).returning();
  
  return result;
}

function createSuperheroName(realName: string, keyword: string): string {
  // Heroic prefixes and suffixes
  const prefixes = [
    'Captain', 'The Mighty', 'Agent', 'Doctor', 'Professor', 'Master', 'Lord', 'Lady',
    'The Amazing', 'Super', 'Ultra', 'The Incredible', 'Commander', 'The Great',
    'Admiral', 'General', 'The Legendary', 'Cosmic', 'Shadow', 'The Invincible'
  ];
  
  const suffixes = [
    'Man', 'Woman', 'Guardian', 'Master', 'Star', 'Knight', 'Warrior', 'Hero',
    'Defender', 'Protector', 'Champion', 'Avenger', 'Hunter', 'Ranger', 'Force',
    'Storm', 'Fire', 'Lightning', 'Thunder', 'Shadow', 'Light', 'Wing', 'Blade'
  ];
  
  // Extract meaningful parts from real name
  const nameWords = realName.trim().split(/\s+/);
  const firstName = nameWords[0] || '';
  const lastName = nameWords[nameWords.length - 1] || '';
  
  // Clean and capitalize keyword
  const cleanKeyword = keyword.trim().toLowerCase();
  const capitalizedKeyword = cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1);
  
  // Generation strategies
  const strategies = [
    // Strategy 1: Prefix + Keyword + Suffix
    () => {
      const prefix = getRandomElement(prefixes);
      const suffix = getRandomElement(suffixes);
      return `${prefix} ${capitalizedKeyword} ${suffix}`;
    },
    
    // Strategy 2: Keyword + First Name combination
    () => {
      const suffix = getRandomElement(suffixes);
      const blend = blendWords(capitalizedKeyword, firstName);
      return `${blend} ${suffix}`;
    },
    
    // Strategy 3: Prefix + Blended Name
    () => {
      const prefix = getRandomElement(prefixes);
      const blend = blendWords(firstName, capitalizedKeyword);
      return `${prefix} ${blend}`;
    },
    
    // Strategy 4: The + Keyword + Last Name blend
    () => {
      const blend = blendWords(capitalizedKeyword, lastName);
      return `The ${blend}`;
    },
    
    // Strategy 5: Simple Keyword + Suffix
    () => {
      const suffix = getRandomElement(suffixes);
      return `${capitalizedKeyword} ${suffix}`;
    },
    
    // Strategy 6: Alliterative combination
    () => {
      const firstLetter = firstName.charAt(0).toLowerCase();
      const keywordStartsWithSame = cleanKeyword.charAt(0) === firstLetter;
      
      if (keywordStartsWithSame) {
        const suffix = getRandomElement(suffixes);
        return `${capitalizedKeyword} ${suffix}`;
      } else {
        // Find suffix starting with same letter as first name
        const matchingSuffix = suffixes.find(s => s.toLowerCase().charAt(0) === firstLetter);
        if (matchingSuffix) {
          return `${capitalizedKeyword} ${matchingSuffix}`;
        }
        // Fallback to random suffix
        const suffix = getRandomElement(suffixes);
        return `${capitalizedKeyword} ${suffix}`;
      }
    }
  ];
  
  // Select random strategy
  const strategy = getRandomElement(strategies);
  let result = strategy();
  
  // Ensure the result doesn't exceed reasonable length
  if (result.length > 50) {
    // Fallback to simpler name
    const suffix = getRandomElement(suffixes);
    result = `${capitalizedKeyword} ${suffix}`;
  }
  
  return result;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function blendWords(word1: string, word2: string): string {
  // Simple word blending algorithm
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  // Try to find common sounds or letters
  const mid1 = Math.floor(w1.length / 2);
  const mid2 = Math.floor(w2.length / 2);
  
  // Strategy 1: Take first half of word1 + second half of word2
  const blend1 = w1.slice(0, mid1) + w2.slice(mid2);
  
  // Strategy 2: Take first part of word1 + ending of word2
  const blend2 = w1.slice(0, Math.max(2, mid1)) + w2.slice(-Math.max(2, w2.length - mid2));
  
  // Choose the better sounding blend (prefer shorter, avoid awkward combinations)
  const chosen = blend1.length <= blend2.length ? blend1 : blend2;
  
  // Capitalize properly
  return chosen.charAt(0).toUpperCase() + chosen.slice(1);
}
