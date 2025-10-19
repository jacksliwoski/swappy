import { getGeminiModel } from '../gemini';
import { Facts } from './visionItemFacts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const conditionMultipliers = {
  new: 1,
  ln: 0.9,
  good: 0.8,
  fair: 0.65,
  poor: 0.45
};

let compsDataCache: Record<string, number[]> | null = null;

function loadCompsData(): Record<string, number[]> {
  if (compsDataCache) {
    return compsDataCache;
  }

  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const compsPath = join(__dirname, '../data/comps.json');
    const compsContent = readFileSync(compsPath, 'utf-8');
    compsDataCache = JSON.parse(compsContent);
    return compsDataCache;
  } catch (error) {
    console.error('Error loading comps.json:', error);
    return {};
  }
}

const median = (arr: number[]): number => {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
};

export const valuation = async ({
  facts,
  geo
}: {
  facts: Facts,
  geo?: string
}): Promise<{ estimate: { low: number, mid: number, high: number }, explanation: string }> => {
  const compsData = loadCompsData();
  const key = `${facts.category.toLowerCase()}|${facts.brand.toLowerCase()}|${facts.model.toLowerCase()}`;
  const comps = compsData[key] || [200, 210, 220];

  if (!compsData[key]) {
    console.log(`No comps found for key: "${key}" - using default [200, 210, 220]`);
  }

  // Try to get real market prices using Google Search grounding
  try {
    const model = getGeminiModel();

    // Build concise search query with only relevant facts
    const searchParts = [facts.brand, facts.model, facts.category].filter(Boolean);
    if (facts.year_or_edition) searchParts.push(facts.year_or_edition);
    const searchQuery = searchParts.join(' ');

    const groundingPrompt = `Search for current used market prices for: ${searchQuery}

Condition: ${facts.condition}
${facts.attributes.length > 0 ? `Key features: ${facts.attributes.slice(0, 3).join(', ')}` : ''}

Find prices on eBay, Facebook Marketplace, Craigslist, OfferUp, etc. and return realistic local trade values in USD.

Return ONLY JSON:
{
  "low": <number>,
  "mid": <number>,
  "high": <number>,
  "explanation": "<1-2 sentence explanation citing sources>"
}`;

    const result = await model.generateContent(groundingPrompt, {
      generationConfig: {
        responseMimeType: 'application/json'
      },
      tools: [{
        googleSearch: {}
      }]
    });

    const response = await result.response;
    let text = response.text();

    // Strip markdown if present
    text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

    const groundedResult = JSON.parse(text);

    if (groundedResult.low && groundedResult.mid && groundedResult.high && groundedResult.explanation) {
      console.log('Using grounded search results for valuation');
      return {
        estimate: {
          low: Math.round(groundedResult.low),
          mid: Math.round(groundedResult.mid),
          high: Math.round(groundedResult.high)
        },
        explanation: groundedResult.explanation
      };
    }
  } catch (error) {
    console.error('Google Search grounding failed, falling back to local comps:', error);
  }

  // Fallback to local comps if grounding fails
  const basePrice = median(comps);
  const multiplier = conditionMultipliers[facts.condition];
  const adjustedPrice = Math.round(basePrice * multiplier);

  const estimate = {
    low: Math.round(adjustedPrice * 0.85),
    mid: adjustedPrice,
    high: Math.round(adjustedPrice * 1.15)
  };

  const model = getGeminiModel();
  const explanationPrompt = `In ≤2 sentences, explain this local trade price range. Facts: ${JSON.stringify(facts)}. Comps median: ${basePrice}. Range: ${estimate.low}/${estimate.mid}/${estimate.high}. Keep it practical and non-salesy.`;

  const result = await model.generateContent(explanationPrompt);
  const response = await result.response;
  const explanation = response.text();

  return { estimate, explanation };
};
