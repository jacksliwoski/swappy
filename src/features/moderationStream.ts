import { Request, Response } from 'express';
import { getGeminiModel } from '../gemini';

export const moderateStreamSSE = async (req: Request, res: Response) => {
  const { msg, chatHistory } = req.query;
  
  if (!msg || typeof msg !== 'string') {
    return res.status(400).json({ error: 'Message parameter required' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const model = getGeminiModel('gemini-2.5-flash');
  
  // Parse chat history if provided
  let conversationContext = '';
  if (chatHistory && typeof chatHistory === 'string') {
    try {
      const history = JSON.parse(chatHistory);
      if (Array.isArray(history) && history.length > 0) {
        conversationContext = `\n\nPrevious conversation context:\n${history.map((m: any) => `- ${m.fromMe ? 'User' : 'Other'}: ${m.text}`).join('\n')}`;
      }
    } catch (e) {
      // Invalid history, continue without it
    }
  }
  
  const systemPrompt = `You are a STRICT safety moderator for a P2P bartering platform for kids and teens. Be vigilant and err on the side of caution.

OUTPUT ONLY VALID JSON in this exact format:
{
  "tags": ["TAG1", "TAG2"],
  "action": "allow" | "warn" | "block",
  "tip": "Brief safety tip for the user"
}

AVAILABLE TAGS (use multiple if applicable):
- SCAM_DEPOSIT: Requesting money, deposits, upfront payments
- MOVE_OFF_APP: Asking to chat elsewhere (WhatsApp, text, email, social media)
- AFTER_DARK_MEET: Suggesting unsafe meeting times (after dark, late night)
- WEAPON: Any weapon, knife, gun, or dangerous item
- HARASSMENT: Threats, bullying, inappropriate language, profanity
- PII_PHONE_EMAIL_ADDRESS: Sharing phone numbers, email addresses, personal info
- SHIPPING_REQUEST: Asking to ship items (prefer local meetups)
- INAPPROPRIATE_CONTENT: Sexual content, drugs, alcohol, adult items
- PRESSURE_TACTICS: Rushing, pressuring, urgency to act now
- OTHER: Other safety concerns

MODERATION RULES (BE STRICT):
1. BLOCK immediately: Weapons, explicit threats, sexual content, drug references, severe harassment, profanity
2. WARN for: Money requests, off-app contact, sharing personal info, pressure tactics, after-dark meets, mild profanity
3. ALLOW: Normal trading questions about items, availability, meetup location suggestions (public places)

Consider the full conversation context to detect patterns like grooming, manipulation, or escalating behavior.${conversationContext}

Current message to moderate: "${msg}"

Remember: Output ONLY the JSON object, no other text.`;

  try {
    const result = await model.generateContentStream(systemPrompt);
    
    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      // Stream each chunk
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }

    console.log('[Moderation] Full AI response:', fullResponse);

    // Send final parsed result
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonText = fullResponse.trim();
      
      // Remove markdown code block syntax if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim();
      }
      
      console.log('[Moderation] Cleaned JSON:', jsonText);
      
      const parsed = JSON.parse(jsonText);
      console.log('[Moderation] Parsed result:', parsed);
      
      res.write(`data: ${JSON.stringify(parsed)}\n\n`);
    } catch (parseError) {
      console.error('[Moderation] Parse error:', parseError);
      console.error('[Moderation] Raw response that failed to parse:', fullResponse);
      
      // Fallback if JSON parsing fails
      res.write(`data: ${JSON.stringify({ 
        tags: ['OTHER'], 
        action: 'allow', 
        tip: 'Unable to parse moderation response' 
      })}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({ 
      error: 'Moderation failed', 
      tags: ['OTHER'], 
      action: 'allow', 
      tip: 'System error occurred' 
    })}\n\n`);
    res.end();
  }
};
