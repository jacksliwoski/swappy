# 🚀 Quick Start Guide

## Prerequisites
Make sure you have Node.js v18+ installed. Check with:
```bash
node --version
```

## Step 1: Install Dependencies

### Backend (visa-server)
```bash
cd visa-server
npm install
```

### Frontend (web)
```bash
cd web
npm install
```

## Step 2: Start the Backend Server

```bash
cd visa-server
npm start
```

You should see:
```
📚 Demo database initialized with 2 users:
   alex@swappy.demo / password123
   jordan@swappy.demo / password123
[swappy] listening on http://localhost:7010 (MOCK=false)
```

**Keep this terminal open** - the server needs to stay running.

## Step 3: Start the Frontend (in a new terminal)

```bash
cd web
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Open Your Browser

Visit: **http://localhost:5173**

You'll be redirected to the sign-in page since you're not logged in yet.

## 🎮 Try It Out!

### Option 1: Use Demo Users
Click "Sign in" and use either:
- `alex@swappy.demo` / `password123`
- `jordan@swappy.demo` / `password123`

### Option 2: Create a New Account
1. Click "Sign up!" at the bottom
2. Fill out all the sections:
   - **Account Info**: Email, password, age
   - **Guardian Info**: Required for safety
   - **Meetup Preferences**: Location, time, travel options
   - **Interests**: What you like to collect
3. Submit and you'll be auto-logged in!

### Option 3: Test Password Reset
1. Click "Forgot your password?"
2. Enter an email (e.g., `alex@swappy.demo`)
3. Check `visa-server/data/outbox/` folder
4. Open the HTML email file
5. Click the reset link (or copy/paste into browser)
6. Set a new password

## 📁 What Gets Created

When you first start the backend, it creates:

```
visa-server/data/
├── users.json         # User database (2 demo users pre-loaded)
├── resets.json        # Password reset tokens
└── outbox/            # Demo emails (password resets)
    └── reset_*.html
```

## 🎨 Features to Explore

Once logged in, you can:
- **Discover**: Browse toy listings
- **My Toy Box**: View your inventory
- **Add Item**: Add new toys
- **Trade Room**: Create and manage trades
- **Messages**: Chat with other traders
- **Profile**: View your XP and level
- **Settings**: Update preferences

## 🔐 Authentication Features

- ✅ User registration with full profile
- ✅ Guardian information collection (required)
- ✅ Meetup preferences (location, time, travel)
- ✅ Interest/category tracking
- ✅ Password reset via email (demo mode)
- ✅ JWT token authentication
- ✅ Protected routes
- ✅ Sign out functionality

## 🎯 Demo User Profiles

**Alex (User 1)**
- Age: 10, Grade schooler
- Lives in Seattle, WA
- Available weekends 10am-4pm
- Travels by car (20 min max)
- Likes: LEGO, Pokemon, action figures
- Level 3 trader

**Jordan (User 2)**
- Age: 12, Middle schooler
- Lives in Bellevue Downtown
- Available after school 3-7pm
- Walks (15 min max), prefers indoors
- Likes: Sports cards, Funko Pops, Marvel
- Level 5 trader

## 🛠️ Troubleshooting

### Backend won't start
- Make sure port 7010 is not in use
- Check that you ran `npm install` first
- Look for error messages in the terminal

### Frontend won't start
- Make sure port 5173 is not in use
- Check that you ran `npm install` first
- Ensure backend is running on port 7010

### "Unable to connect" errors
- Make sure both servers are running
- Backend should be on http://localhost:7010
- Frontend should be on http://localhost:5173
- Check your firewall isn't blocking localhost

### Can't sign in
- Use exactly: `alex@swappy.demo` / `password123`
- Or: `jordan@swappy.demo` / `password123`
- Email is case-insensitive
- Password is case-sensitive

### Password reset not working
- Check `visa-server/data/outbox/` for the email file
- Copy the full URL from the email
- Token expires after 1 hour

## 📝 Environment Variables (Optional)

You can customize the server by creating a `.env` file in `visa-server/`:

```env
PORT=7010
JWT_SECRET=your-secret-key-here
MOCK=false
CORS_ORIGIN=http://localhost:5173
```

## 🎉 You're All Set!

The system is ready to use. Sign in with a demo user or create your own account and start exploring!

For more details, see `AUTH_SYSTEM_INTEGRATION.md`.

