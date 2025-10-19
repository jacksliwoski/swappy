import { getGeminiModel } from '../gemini';
import { z } from 'zod';

const FactsSchema = z.object({
  category: z.string(),
  brand: z.string(),
  model: z.string(),
  year_or_edition: z.string(),
  condition: z.enum(['new', 'ln', 'good', 'fair', 'poor']),
  attributes: z.array(z.string()),
  notes: z.string()
});

export type Facts = z.infer<typeof FactsSchema>;

export const visionItemFacts = async ({
  imagesBase64,
  description
}: {
  imagesBase64: string[],
  description?: string
}): Promise<Facts> => {
  const model = getGeminiModel('gemini-2.5-flash');

  const prompt = `You are an appraiser for local barter trades. Extract normalized fields as JSON with keys exactly: category, brand, model, year_or_edition, condition (one of new|ln|good|fair|poor), attributes (string array), notes (string). Be concise and factual; if unknown, use empty string or empty array. Return JSON only.${description ? `\n\nUser description: ${description}` : ''}`;

  const imageParts = imagesBase64.map(base64 => ({
    inlineData: {
      data: base64,
      mimeType: 'image/jpeg'
    }
  }));

  const result = await model.generateContent([
    prompt,
    ...imageParts
  ], {
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const response = await result.response;
  let text = response.text();

  // Strip markdown code blocks if present
  text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(text);
    return FactsSchema.parse(parsed);
  } catch (error) {
    console.error('Raw response:', text);
    throw new Error(`Failed to parse vision facts: ${error}`);
  }
};
