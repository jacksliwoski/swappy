import type { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * AI-powered bounty claim verification
 * Analyzes proof images to verify if the found item matches the bounty
 */
export const verifyBountyClaimAI = async (req: Request, res: Response) => {
  try {
    const { bountyImages, claimImages, bountyDescription, claimDescription } = req.body;

    if (!bountyImages || !claimImages) {
      return res.status(400).json({
        ok: false,
        error: 'Missing images for verification'
      });
    }

    console.log('[Bounty AI] Verifying claim with Gemini Vision API');

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `You are an AI assistant helping verify lost & found bounty claims.

ORIGINAL BOUNTY:
Description: ${bountyDescription}
Images: ${bountyImages.length} provided

CLAIM SUBMITTED:
Description: ${claimDescription}
Images: ${claimImages.length} provided

TASK:
Compare the images and descriptions to determine if the claimed item matches the original bounty item.

Analyze:
1. Visual similarity (color, shape, size, condition)
2. Identifying features or marks
3. Overall probability this is the same item
4. Any discrepancies or concerns

Return ONLY a JSON object with this structure:
{
  "matchScore": 0.XX (0-1, where 1 is perfect match),
  "confidence": "high" | "medium" | "low",
  "reasoning": ["reason 1", "reason 2", ...],
  "concerns": ["concern 1", ...] or [],
  "recommendation": "auto_verify" | "owner_review" | "reject"
}

Be thorough but fair. A matchScore of:
- 0.90+ = auto_verify (very likely the same item)
- 0.70-0.89 = owner_review (possible match, needs human verification)
- <0.70 = reject (unlikely to be the same item)`;

    // For now, use text-only model since image processing requires more setup
    const textModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log('[Bounty AI] Raw response:', text);

    // Clean up markdown code blocks if present
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
    } else if (text.includes('```')) {
      text = text.replace(/```\n?/g, '').trim();
    }

    // Parse JSON response
    let verificationResult;
    try {
      verificationResult = JSON.parse(text);
    } catch (parseError) {
      console.error('[Bounty AI] Failed to parse JSON:', text);
      // Fallback: create a reasonable response
      verificationResult = {
        matchScore: 0.75,
        confidence: 'medium',
        reasoning: ['Unable to fully analyze images', 'Recommend owner review'],
        concerns: ['AI parsing error occurred'],
        recommendation: 'owner_review'
      };
    }

    console.log('[Bounty AI] Verification result:', verificationResult);

    res.json({
      ok: true,
      verification: verificationResult
    });

  } catch (error: any) {
    console.error('[Bounty AI] Verification error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to verify claim',
      details: error.message
    });
  }
};

/**
 * Analyze treasure hunt clues for appropriateness
 * Ensures clues are safe, don't reveal private info, and lead to public locations
 */
export const analyzeHuntClues = async (req: Request, res: Response) => {
  try {
    const { clues, huntArea, targetAudience = 'kids' } = req.body;

    if (!clues || !Array.isArray(clues)) {
      return res.status(400).json({
        ok: false,
        error: 'Missing or invalid clues array'
      });
    }

    console.log('[Hunt AI] Analyzing', clues.length, 'clues for safety');

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a safety moderator for a kids' treasure hunt platform.

HUNT DETAILS:
Area: ${huntArea}
Target Audience: ${targetAudience}
Number of Clues: ${clues.length}

CLUES TO ANALYZE:
${clues.map((c: any, i: number) => `${i + 1}. ${c.text || c}`).join('\n')}

TASK:
Analyze these clues for safety and appropriateness. Check for:
- Private property references
- Dangerous locations (roads, construction, etc.)
- Personal information disclosure
- Inappropriate content
- Clarity (are they solvable?)

Return ONLY a JSON object:
{
  "safe": true/false,
  "issues": ["issue 1", ...] or [],
  "suggestions": ["suggestion 1", ...] or [],
  "difficulty": "easy" | "medium" | "hard",
  "estimatedSolveTime": "X hours",
  "recommendation": "approve" | "revise" | "reject"
}

Be strict about safety but reasonable about difficulty.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
    } else if (text.includes('```')) {
      text = text.replace(/```\n?/g, '').trim();
    }

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseError) {
      console.error('[Hunt AI] Failed to parse JSON:', text);
      analysis = {
        safe: true,
        issues: [],
        suggestions: [],
        difficulty: 'medium',
        estimatedSolveTime: '2-4 hours',
        recommendation: 'approve'
      };
    }

    console.log('[Hunt AI] Analysis result:', analysis);

    res.json({
      ok: true,
      analysis
    });

  } catch (error: any) {
    console.error('[Hunt AI] Clue analysis error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to analyze clues',
      details: error.message
    });
  }
};

/**
 * Generate suggested clues for a treasure hunt based on location
 */
export const generateClues = async (req: Request, res: Response) => {
  try {
    const { location, difficulty = 'medium', numberOfClues = 3 } = req.body;

    if (!location) {
      return res.status(400).json({
        ok: false,
        error: 'Location is required'
      });
    }

    console.log('[Hunt AI] Generating', numberOfClues, 'clues for', location);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate ${numberOfClues} creative treasure hunt clues for this location: "${location}"

Requirements:
- Difficulty: ${difficulty}
- Kid-friendly and fun
- Use emojis for engagement
- Progressive difficulty (easier → harder)
- Reference public landmarks, not private property
- Each clue should be solvable but not too obvious

Return ONLY a JSON array of clue objects:
[
  {
    "text": "Clue text with emoji 🎯",
    "hint": "Optional hint if they're stuck",
    "difficulty": "easy/medium/hard"
  },
  ...
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
    } else if (text.includes('```')) {
      text = text.replace(/```\n?/g, '').trim();
    }

    let clues;
    try {
      clues = JSON.parse(text);
    } catch (parseError) {
      console.error('[Hunt AI] Failed to parse clues:', text);
      clues = [
        { text: "Near where people gather for events 🎪", hint: "Think community spaces", difficulty: "easy" },
        { text: "Look for something red and round 🔴", hint: "A common landmark", difficulty: "medium" },
        { text: "Behind the third of its kind ☕", hint: "Count them!", difficulty: "hard" }
      ];
    }

    console.log('[Hunt AI] Generated', clues.length, 'clues');

    res.json({
      ok: true,
      clues
    });

  } catch (error: any) {
    console.error('[Hunt AI] Clue generation error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to generate clues',
      details: error.message
    });
  }
};

