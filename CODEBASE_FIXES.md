# Codebase Fixes and Cleanup

## Issues Found

### 1. CORS Configuration (✅ FIXED)
**Problem:** AI server (port 3000) was configured for CORS on `localhost:5173` but frontend is running on `localhost:5179`

**Solution:** Updated `/src/server.ts` to allow all localhost ports during development

### 2. Old Test Components (✅ FIXED)
These files were from the original MVP test interface and are no longer used:
- `/web/src/components/VisionForm.tsx` - Now integrated in AddToInventory.tsx (DELETED)
- `/web/src/components/FactsCard.tsx` - Now integrated in AddToInventory.tsx (DELETED)
- `/web/src/components/ValuationCard.tsx` - Now integrated in AddToInventory.tsx (DELETED)
- `/web/src/components/FairnessTester.tsx` - Now integrated in TradeBuilder.tsx (DELETED)
- `/web/src/components/StreamModerationTester.tsx` - Now integrated in Messages.tsx (DELETED)
- `/web/src/components/MeetupSuggestions.tsx` - Now integrated via MeetupAssistant.tsx (DELETED)

**Cleanup:** Removed old imports from AddToInventory.tsx

### 3. API Structure Issues

**Current State:**
- AI APIs (`ai.*`) expect specific payload structures
- Frontend was sending correct structure
- 400 error was likely due to CORS, not payload

**API Signature Matrix:**

| API Endpoint | Frontend Call | Backend Expects | Status |
|--------------|---------------|-----------------|--------|
| `/ai/vision-facts` | `{ imagesBase64: string[], description?: string }` | ✅ Matches | OK |
| `/ai/valuation` | `{ facts: Facts }` | ✅ Matches | OK |
| `/ai/uneven-score` | `{ sideA: number[], sideB: number[] }` | ✅ Matches | OK |
| `/ai/moderate/stream` | Query param `msg` | ✅ Matches | OK |
| `/ai/meetup-suggestions` | `{ locationA, locationB, timeWindow, ... }` | ✅ Matches | OK |

### 4. Meetup Suggestions API Mismatch (✅ FIXED)

**Problem:** Frontend was calling `meetupSuggestions(locationA, locationB, under18)` but backend expected full params with timeWindow, travelMode, maxMinutesA, maxMinutesB

**Solution:** Updated `/web/src/utils/api.ts` to accept full params object matching backend schema

### 5. Visa Server Crash (✅ FIXED)
`npm run dev:visa exited with code 4294967295` - server was crashing on startup

**Root Cause:** Missing Visa configuration properties in `/visa-server/src/config.js`

**Solution:** Added visaBaseUrl, visaClientCrt, visaClientKey, visaRootCa, visaUsername, visaPassword, visaPavPath to config.js to match environment variables

## Cleanup Actions (✅ COMPLETED)

### Files Deleted
1. ✅ `/web/src/components/VisionForm.tsx`
2. ✅ `/web/src/components/FactsCard.tsx`
3. ✅ `/web/src/components/ValuationCard.tsx`
4. ✅ `/web/src/components/FairnessTester.tsx`
5. ✅ `/web/src/components/StreamModerationTester.tsx`
6. ✅ `/web/src/components/MeetupSuggestions.tsx`
7. ✅ `MEETUP_ASSISTANT_INTEGRATION.md` - Integration is complete

## Summary of Applied Fixes

### ✅ All Critical Fixes Applied

1. **CORS Configuration** - Updated to support all localhost ports
2. **Meetup API Signature** - Frontend now matches backend schema
3. **Visa Server Config** - Added missing configuration properties
4. **Code Cleanup** - Removed 7 obsolete test component files
5. **Import Cleanup** - Removed stale imports from AddToInventory.tsx

## Testing Checklist

After fixes:
- [ ] Test vision-facts API from AddToInventory screen
- [ ] Test valuation API
- [ ] Test fairness/uneven-score in TradeBuilder
- [ ] Test moderation in Messages
- [ ] Test meetup suggestions
- [ ] Verify no console errors
- [ ] Verify all old test components removed

## Current Architecture

**Frontend (React)** → **AI Server (port 3000)** → **Gemini API**
- Vision facts extraction
- Valuation
- Fairness scoring
- Moderation
- Meetup suggestions

**Frontend (React)** → **Data Server (port 7002)** → **Mock Data**
- Auth (register, login)
- User profiles
- Inventory CRUD
- Trades
- Messages

## Next Steps

1. Apply meetup API fix
2. Delete old test component files
3. Investigate visa-server crash
4. Test all AI endpoints end-to-end
5. Clean up documentation files
