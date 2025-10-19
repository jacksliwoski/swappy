# Swappy — Visa-only (Barter) with Gamified Caps

This is the **download-and-run** server for your Visa part. It includes:
- **Visa PAV** (zero-dollar auth) for guardian verification
- **Visa Merchant Search** for safe, allow-listed pickup locations
- **Criteria** enforcement + **gamified sell caps** (start $50, level up to $250)
- Stubs for **Gemini** and **AWS DB** (left blank on purpose)

No money moves. Pure toy-for-toy trades.

## Run
```bash
cd server
cp .env.example .env   # set mTLS cert/key/ca & Visa creds; keep MOCK=true until Hello World works
npm i
npm run dev            # http://localhost:7002
```
Postman collection: `postman/Swappy-Visa.postman_collection.json`
