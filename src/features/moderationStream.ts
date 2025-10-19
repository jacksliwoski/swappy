import { Request, Response } from 'express';
import { getGeminiModel } from '../gemini';

export const moderateStreamSSE = async (req: Request, res: Response) => {
  const { msg } = req.query;
  
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
  
  const systemPrompt = `You moderate P2P bartering chat. Output only JSON: { "tags": string[], "action": "allow"|"warn"|"block", "tip": string }. Tags must be from: SCAM_DEPOSIT, MOVE_OFF_APP, AFTER_DARK_MEET, WEAPON, HARASSMENT, PII_PHONE_EMAIL_ADDRESS, SHIPPING_REQUEST, OTHER. Prefer warn unless clear harm. Message: "${msg}".`;

  try {
    const result = await model.generateContentStream(systemPrompt);
    
    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      // Stream each chunk
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }

    // Send final parsed result
    try {
      const parsed = JSON.parse(fullResponse);
      res.write(`data: ${JSON.stringify(parsed)}\n\n`);
    } catch (parseError) {
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
