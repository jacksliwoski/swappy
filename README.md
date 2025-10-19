# Swappy AI - Local MVP

A local TypeScript Node service + lightweight React front-end that demonstrates four AI features powered by Google Gemini:

- **A) Vision → Item Facts** - Extract item details from images
- **B) Valuation** - Price estimation using comparable data
- **C) Uneven-Trade Scorer** - Calculate trade fairness
- **D) Chat Safety Moderation** - Real-time message moderation (streaming)

## Quick Start

### Install

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd web && npm install && cd ..
```

### Configure

Create a `.env` file in the root directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

**Get a Gemini API key:** https://ai.google.dev/

### Run

Start both backend (port 3000) and frontend (port 5173):

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Manual QA Script

Use the Dev UI to test end-to-end:

1. **Upload 2-3 clear photos** of an item (e.g., Trek bike) + short description
2. Click **Extract Facts** - confirm category/brand/model/condition are accurate
3. Edit facts if needed, then click **Save & Use These Facts**
4. Click **Get Valuation** - confirm low/mid/high populate with explanation
5. Click **Use MID as side A item** twice (simulate two items)
6. Add one item on side B manually
7. Click **Score Fairness** - confirm fairness meter < 100% and balancing suggestion appears
8. **(Optional)** In Moderation tester, try:
   - "Send me a $50 Venmo deposit before we meet" → expect `SCAM_DEPOSIT`, warn or block
   - "Let's move to WhatsApp" → `MOVE_OFF_APP`, warn

## Project Structure

```
swappy/
├── src/                         # Backend (Node + TypeScript)
│   ├── server.ts                # Express server with API endpoints
│   ├── gemini.ts                # Gemini AI client setup
│   ├── features/
│   │   ├── visionItemFacts.ts   # (A) Vision → Item Facts
│   │   ├── valuation.ts         # (B) Valuation
│   │   ├── fairness.ts          # (C) Uneven-Trade Scorer
│   │   └── moderationStream.ts  # (D) Chat Safety Moderation
│   ├── data/
│   │   └── comps.json           # Seed comparable pricing data
│   └── utils/
│       └── base64.ts            # Image encoding utilities
├── web/                         # Frontend (Vite + React + TypeScript)
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   ├── index.css
│   │   └── components/
│   │       ├── VisionForm.tsx
│   │       ├── FactsCard.tsx
│   │       ├── ValuationCard.tsx
│   │       ├── FairnessTester.tsx
│   │       └── StreamModerationTester.tsx
│   └── package.json
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## API Endpoints

All endpoints return JSON. Bad inputs return `400` with validation details.

### POST /ai/vision-facts

Send 1-4 images (base64 JPEG/PNG) + optional description → returns item facts.

**Request:**
```json
{
  "imagesBase64": ["<base64>", "<base64>"],
  "description": "optional text"
}
```

**Response:**
```json
{
  "category": "bike",
  "brand": "trek",
  "model": "fx 2",
  "year_or_edition": "2021",
  "condition": "good",
  "attributes": ["aluminum frame", "21-speed"],
  "notes": "Minor scratches on frame"
}
```

### POST /ai/valuation

Given item facts, returns price estimate + explanation.

**Request:**
```json
{
  "facts": {
    "category": "bike",
    "brand": "trek",
    "model": "fx 2",
    "condition": "good",
    ...
  }
}
```

**Response:**
```json
{
  "estimate": { "low": 176, "mid": 207, "high": 238 },
  "explanation": "Based on comparable Trek FX 2 bikes in good condition..."
}
```

### POST /ai/uneven-score

Calculate fairness score for two-sided trades.

**Request:**
```json
{
  "sideA": [220, 15],
  "sideB": [160]
}
```

**Response:**
```json
{
  "A": 235,
  "B": 160,
  "diff": 75,
  "fairness": 0.68,
  "warn": true
}
```

### GET /ai/moderate/stream?msg=<encoded>

Server-Sent Events stream for chat moderation.

**Response (SSE stream):**
```
data: {"chunk": "..."}
data: {"tags": ["SCAM_DEPOSIT"], "action": "warn", "tip": "..."}
data: [DONE]
```

## Data Contracts

See `web/src/types.ts` for complete TypeScript definitions:

- `Facts` - Item details extracted from images
- `ValuationResponse` - Price estimate with explanation
- `FairnessResponse` - Trade fairness analysis
- `ModerationResult` - Chat moderation result

## Tech Stack

- **Backend:** Node 20+, TypeScript, Express, Zod, dotenv, @google/generative-ai
- **Frontend:** Vite, React 18, TypeScript
- **AI Model:** Gemini 1.5 Flash (multimodal for vision, text for others)

## Acceptance Criteria

✅ **Vision → Facts** - Accepts 1-4 images, returns normalized JSON, handles unknowns gracefully
✅ **Valuation** - Uses seed comps, applies condition multipliers, returns explanation
✅ **Uneven Trade** - Implements scoring formula, shows fairness meter, warns when unbalanced
✅ **Moderation** - Streams SSE chunks, identifies safety tags, displays action/tip
✅ **General** - Zod validates inputs, API key checked at startup, README has setup steps

## Notes

- No authentication, databases, or production infrastructure
- All data stored locally in `src/data/comps.json`
- Frontend connects to `http://localhost:3000`
- Uses default comps `[200, 210, 220]` if item not found in seed data