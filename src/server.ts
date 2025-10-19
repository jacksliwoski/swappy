import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { z } from 'zod';
import { visionItemFacts } from './features/visionItemFacts';
import { valuation } from './features/valuation';
import { unevenScore } from './features/fairness';
import { moderateStreamSSE } from './features/moderationStream';
import { getSafeMeetupSuggestions } from './features/meetupSuggestions';

dotenv.config();

// Validation schemas
const VisionFactsInputSchema = z.object({
  imagesBase64: z.array(z.string()).min(1).max(4),
  description: z.string().optional()
});

const ValuationInputSchema = z.object({
  facts: z.object({
    category: z.string(),
    brand: z.string(),
    model: z.string(),
    year_or_edition: z.string(),
    condition: z.enum(['new', 'ln', 'good', 'fair', 'poor']),
    attributes: z.array(z.string()),
    notes: z.string()
  })
});

const UnevenScoreInputSchema = z.object({
  sideA: z.array(z.number()),
  sideB: z.array(z.number())
});

const MeetupSuggestionsInputSchema = z.object({
  locationA: z.string().min(1),
  locationB: z.string().min(1),
  timeWindow: z.string().min(1),
  travelMode: z.enum(['driving', 'walking']),
  maxMinutesA: z.number().min(1),
  maxMinutesB: z.number().min(1),
  indoorPreferred: z.boolean().optional(),
  wheelchairAccess: z.boolean().optional(),
  parkingNeeded: z.boolean().optional(),
  ageContextUnder18: z.boolean().optional()
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Allow all localhost ports for development
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port or no origin (like mobile apps or curl)
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available models
app.get('/api/list-models', async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
});

// AI Vision Facts endpoint
app.post('/ai/vision-facts', async (req, res) => {
  try {
    const parsed = VisionFactsInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parsed.error.format()
      });
    }

    const facts = await visionItemFacts(parsed.data);
    res.json(facts);
  } catch (error) {
    console.error('Vision facts error:', error);
    res.status(500).json({ error: 'Failed to extract vision facts' });
  }
});

// AI Valuation endpoint
app.post('/ai/valuation', async (req, res) => {
  try {
    const parsed = ValuationInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parsed.error.format()
      });
    }

    const result = await valuation({ facts: parsed.data.facts });
    res.json(result);
  } catch (error) {
    console.error('Valuation error:', error);
    res.status(500).json({ error: 'Failed to calculate valuation' });
  }
});

// AI Uneven Score endpoint
app.post('/ai/uneven-score', async (req, res) => {
  try {
    const parsed = UnevenScoreInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parsed.error.format()
      });
    }

    const result = unevenScore(parsed.data);
    res.json(result);
  } catch (error) {
    console.error('Uneven score error:', error);
    res.status(500).json({ error: 'Failed to calculate uneven score' });
  }
});

// AI Moderation Stream endpoint
app.get('/ai/moderate/stream', moderateStreamSSE);

// AI Meetup Suggestions endpoint
app.post('/ai/meetup-suggestions', async (req, res) => {
  try {
    const parsed = MeetupSuggestionsInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parsed.error.format()
      });
    }

    const result = await getSafeMeetupSuggestions(parsed.data);
    res.json(result);
  } catch (error) {
    console.error('Meetup suggestions error:', error);
    res.status(500).json({ error: 'Failed to get meetup suggestions' });
  }
});

// Start server
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is not set in .env file');
  console.error('Please create a .env file with your Gemini API key:');
  console.error('GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Swappy server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI endpoints:`);
  console.log(`   POST /ai/vision-facts`);
  console.log(`   POST /ai/valuation`);
  console.log(`   POST /ai/uneven-score`);
  console.log(`   GET  /ai/moderate/stream?msg=...`);
  console.log(`   POST /ai/meetup-suggestions`);
});
