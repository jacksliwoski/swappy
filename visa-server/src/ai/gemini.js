// Real Gemini AI integration for price advice
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' }); // Load from root .env

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function priceAdvice(title, category) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Suggest a fair barter/trade value for this item for peer-to-peer local trades. Return ONLY a JSON object.

Item: ${title}
Category: ${category}

Return format:
{
  "suggestedPrice": <number in USD>,
  "notes": "<1-2 sentence explanation>"
}`;

    const result = await model.generateContent(prompt, {
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const response = await result.response;
    let text = response.text();

    // Strip markdown if present
    text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(text);

    return {
      suggestedPrice: parsed.suggestedPrice || 25,
      notes: parsed.notes || `Suggested fair price for ${title} (${category}).`
    };
  } catch (error) {
    console.error('Gemini AI error:', error);
    // Fallback to stub behavior
    return {
      suggestedPrice: 25,
      notes: `AI unavailable: suggested default price for ${title} (${category}).`
    };
  }
}

module.exports = { priceAdvice };
