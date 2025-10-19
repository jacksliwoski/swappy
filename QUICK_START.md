# 🚀 Swappy Demo - Quick Start

## ✅ Fixed & Ready to Use!

The authentication system is now fully integrated with simple local storage. Everything is stored in JSON files - no complex database needed!

### Demo Accounts

**Jack**
- Email: `jack@swappy.demo`
- Password: `password123`
- Age: 10, Level 3 trader
- Location: Seattle, WA
- Likes: LEGO, Pokemon, action figures

**Anderson**
- Email: `anderson@swappy.demo`
- Password: `password123`
- Age: 12, Level 5 trader
- Location: Bellevue Downtown
- Likes: Sports cards, Funko Pops, Marvel

## 🎯 How to Start

### 1. Install Dependencies (First Time Only)

```bash
# Backend
cd visa-server
npm install

# Frontend
cd ../web
npm install
```

### 2. Start the Backend Server

```bash
cd visa-server
npm start
```

You should see:
```
📚 Demo database initialized with 2 users:
   jack@swappy.demo / password123
   anderson@swappy.demo / password123
[swappy] listening on http://localhost:7002 (MOCK=true)
```

**Keep this terminal open!**

### 3. Start the Frontend (New Terminal)

```bash
cd web
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

### 4. Open in Browser

Visit: **http://localhost:5173**

You'll be redirected to sign in.

## 🎮 Try It!

1. **Sign in with demo account:**
   - Email: `jack@swappy.demo`
   - Password: `password123`

2. **Or create a new account** - click "Sign up!" and fill out:
   - Account info (email, password, age)
   - Guardian info (required)
   - Meetup preferences
   - Interests

## 🗄️ How the Auth Works (Simple!)

The backend uses a **file-based database** - everything is stored in plain JSON files:

```
visa-server/data/
├── users.json      # All user accounts (auto-created on first start)
├── resets.json     # Password reset tokens
└── outbox/         # Demo emails (for password reset)
```

**No complex setup needed!** Just:
- User data stored in `users.json`
- Passwords hashed with bcrypt
- JWT tokens for auth
- All local, no external database

### User Profile Fields

Each user account stores:
- **Account**: email, password (hashed), age
- **Guardian**: name, email
- **Location**: City/neighborhood
- **Time windows**: When available to trade
- **Travel**: Mode (driving/walking/bike) & max minutes
- **Accessibility**: Indoor preference, wheelchair access, parking
- **Interests**: Categories they collect
- **Stats**: Username, avatar, level, XP

## 🔐 Auth Features

- ✅ Register with full profile
- ✅ Login with JWT tokens
- ✅ Protected routes (redirects to sign in if not logged in)
- ✅ Password reset (emails saved to local folder)
- ✅ Sign out (clears token)
- ✅ Guardian information (required for kids)

## 🛠️ Troubleshooting

### "Unable to connect" error when signing in

The backend server needs to be running on **port 7002**.

Check if it's running:
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:7002/api/health
```

You should see: `{"ok":true,"ts":...,"mock":true}`

If not, restart the backend:
```bash
cd visa-server
npm start
```

### Port already in use

Kill any existing node processes:
```bash
# PowerShell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then restart the servers.

### Login fails with demo credentials

Make sure you're using exactly:
- Email: `jack@swappy.demo` (all lowercase)
- Password: `password123` (case-sensitive)

### Reset users.json

If the database gets corrupted, just delete the file and restart:
```bash
# PowerShell
Remove-Item visa-server\data\users.json
cd visa-server
npm start
```

It will regenerate with the 2 demo users.

## 📝 API Endpoints

All endpoints are at `http://localhost:7002/api/...`

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in (returns JWT)
- `POST /api/auth/forgot` - Request password reset
- `POST /api/auth/reset` - Reset password with token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile (auth required)
- `GET /api/users/:id/inventory` - Get inventory (stub)

### Health Check
- `GET /api/health` - Check if server is running

## 🎉 You're All Set!

The authentication system is:
- ✅ Simple (file-based JSON storage)
- ✅ Local (no external dependencies)
- ✅ Complete (register, login, reset, profiles)
- ✅ Kid-friendly UI (matches your design)

Now you can focus on building the trading features!

---

**Ports:**
- Backend: http://localhost:7002
- Frontend: http://localhost:5173

**Demo Logins:**
- jack@swappy.demo / password123
- anderson@swappy.demo / password123

