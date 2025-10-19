# 🎉 Authentication System Integration

## Overview
I've successfully integrated a complete authentication system with a demo file-based database into your Swappy web app. The system includes user registration, login, password reset, and profile management—all with the kid-friendly UI aesthetic you've established.

## 📦 What's Been Added

### 1. Demo Database System
**File**: `visa-server/src/db/filedb.js`

A simple JSON-based database that stores:
- **User accounts** with authentication
- **Guardian information** (name, email)
- **Meetup preferences** (location, time windows, travel mode, etc.)
- **User profiles** (username, avatar, level, XP, interests)
- **Password reset tokens**

**Demo Users (Pre-loaded)**:
```
User 1:
- Email: alex@swappy.demo
- Password: password123
- Age: 10
- Location: Seattle, WA
- Time Window: Weekends 10am-4pm
- Travel: Driving (20 min max)
- Interests: LEGO sets, Pokemon cards, action figures, board games, video games
- Username: AlexTheTrader 🦖
- Level: 3

User 2:
- Email: jordan@swappy.demo
- Password: password123
- Age: 12
- Location: Bellevue Downtown
- Time Window: After school 3-7pm
- Travel: Walking (15 min max)
- Indoor preferred: Yes
- Interests: sports cards, Funko Pops, Marvel figures, trading card games, art supplies
- Username: JordanCollects 🎮
- Level: 5
```

### 2. Backend Routes & Middleware

**Authentication Routes** (`visa-server/src/routes/auth.js`):
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Sign in and get JWT token
- `POST /api/auth/forgot` - Request password reset (sends demo email to `/data/outbox`)
- `POST /api/auth/reset` - Reset password with token
- `GET /api/auth/me` - Get current authenticated user

**User Routes** (`visa-server/src/routes/users.js`):
- `GET /api/users/:id` - Get user profile (public info)
- `PUT /api/users/:id` - Update user profile (authenticated)
- `GET /api/users/:id/inventory` - Get user inventory (stub for now)

**Middleware** (`visa-server/src/middleware/auth.js`):
- JWT signing and verification
- `requireAuth` middleware for protected routes

### 3. Frontend Authentication Screens

All screens follow your kid-friendly design aesthetic with:
- Fredoka font for headings
- Nunito font for body text
- Playful colors and friendly icons
- Smooth transitions and hover effects
- Accessible form controls

**Sign In** (`web/src/screens/SignIn.tsx`):
- Email + password login
- Demo user credentials displayed
- Links to forgot password and sign up

**Sign Up** (`web/src/screens/SignUp.tsx`):
- **Account Info**: Email, password, age
- **Guardian Info**: Name, email (required for safety)
- **Meetup Preferences**: 
  - Location (city/neighborhood)
  - Time windows (when available to trade)
  - Travel mode (driving/walking/biking/transit)
  - Max travel time (minutes)
  - Indoor preference checkbox
  - Wheelchair access checkbox
  - Parking needed checkbox
- **Interests**: Comma-separated list of collecting categories

**Forgot Password** (`web/src/screens/ForgotPassword.tsx`):
- Request password reset link
- In demo mode, emails are saved to `/data/outbox` folder

**Reset Password** (`web/src/screens/ResetPassword.tsx`):
- Set new password using token from email
- Validates password match and minimum length

### 4. Updated API Client

**File**: `web/src/utils/api.ts`

Added complete auth API methods:
- `api.auth.register(payload)` - Register new user
- `api.auth.login({ email, password })` - Sign in
- `api.auth.forgot(email)` - Request reset
- `api.auth.reset(token, newPassword)` - Reset password
- `api.auth.me()` - Get current user
- `api.users.get(id)` - Get user by ID
- `api.users.updateProfile(id, updates)` - Update profile
- `api.users.getInventory(id)` - Get inventory

**Token Management**:
- `setToken(token)` - Store JWT in localStorage
- `getToken()` - Retrieve JWT
- `clearToken()` - Remove JWT
- `withAuth(init)` - Helper to add auth header to requests

### 5. Protected App Routes

**File**: `web/src/App.tsx`

The app now has two route groups:

**Public Routes** (no auth required):
- `/signin` - Sign in page
- `/signup` - Registration page
- `/forgot-password` - Request reset link
- `/reset-password?token=...` - Reset password

**Protected Routes** (authentication required):
- `/discover` - Browse listings
- `/inventory` - Your toy box
- `/add` - Add new item
- `/trades/:id?` - Trade room
- `/messages/:id?` - Messages
- `/profile` - Your profile
- `/settings` - Settings

**Authentication Flow**:
1. On app load, checks for JWT token in localStorage
2. If no token → redirects to `/signin`
3. If token exists → allows access to protected routes
4. Sign out button clears token and redirects to sign in

## 🎨 UI Integration

All authentication screens match your kid-friendly aesthetic:

### Colors
- **Primary brand**: `var(--color-brand)` - #22D3A8 (mint green)
- **Brand ink**: `var(--color-brand-ink)` - #0F766E (dark teal)
- **Success**: Green background for info boxes
- **Error**: Red background for error messages
- **Borders**: `var(--color-border)` - #E6EAF2

### Typography
- **Headings**: Fredoka (700 weight)
- **Body**: Nunito (500/600 weight)
- **Form labels**: Nunito (600 weight)

### Components
- **Inputs**: 12px radius, 2px border, focus animation
- **Buttons**: Mint green, hover effects, bouncy scale
- **Cards**: 24px radius, 2px border, shadow
- **Section headers**: Emoji + title + border bottom

### Interactions
- Focus rings on all inputs
- Hover scale/lift on buttons
- Smooth transitions (180ms ease-out)
- Disabled states with reduced opacity

## 📁 File Structure

```
visa-server/
├── data/                          # Auto-generated on first run
│   ├── users.json                 # User database (demo users pre-loaded)
│   ├── resets.json                # Password reset tokens
│   └── outbox/                    # Demo email outbox
│       └── reset_*.html           # Password reset emails
├── src/
│   ├── db/
│   │   └── filedb.js             # File-based database
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints
│   │   └── users.js              # User endpoints
│   └── index.js                  # Main server (updated)

web/src/
├── screens/
│   ├── SignIn.tsx                # Login screen
│   ├── SignUp.tsx                # Registration with full profile
│   ├── ForgotPassword.tsx        # Request reset link
│   └── ResetPassword.tsx         # Set new password
├── utils/
│   └── api.ts                    # API client (updated)
└── App.tsx                       # Auth routing (updated)
```

## 🚀 How to Use

### Start the Backend
```bash
cd visa-server
npm start
```

The server will:
1. Create `/data` folder if it doesn't exist
2. Initialize `users.json` with 2 demo users
3. Initialize `resets.json` for password reset tokens
4. Start listening on `http://localhost:7010`

### Start the Frontend
```bash
cd web
npm run dev
```

Then visit `http://localhost:5173`

### Testing

**Option 1: Use Demo Users**
- Go to sign in page
- Use `alex@swappy.demo` / `password123`
- Or `jordan@swappy.demo` / `password123`

**Option 2: Create New Account**
- Go to sign up page
- Fill out all sections:
  - Account info
  - Guardian info (required)
  - Meetup preferences
  - Interests
- Submit to create account
- You'll be auto-logged in

**Option 3: Test Password Reset**
1. Go to "Forgot Password"
2. Enter email (e.g., `alex@swappy.demo`)
3. Check `visa-server/data/outbox/` for the reset email
4. Copy the reset link from the email
5. Visit the link to set a new password

## 🔐 Security Notes

⚠️ **This is a DEMO system** - Not production-ready:

- Uses file-based JSON storage (not a real database)
- Stores data in plain JSON files
- No database backups or redundancy
- No rate limiting on auth endpoints
- JWT secret is hardcoded in config
- Password reset emails go to local folder (not real email)
- No HTTPS enforcement
- No CORS restrictions in dev mode

**For production, you would need:**
- Real database (PostgreSQL, MongoDB, etc.)
- Proper password hashing (already using bcrypt ✓)
- Environment variables for secrets
- Rate limiting
- Email service integration
- HTTPS/SSL
- CORS restrictions
- Session management
- Account verification
- Guardian verification workflow

## 📊 User Profile Fields

Each user now has these fields stored in the database:

### Account Data
- `id` - Unique user ID
- `email` - Email address
- `passwordHash` - Bcrypt hashed password
- `age` - User's age
- `guardianName` - Guardian's name
- `guardianEmail` - Guardian's email

### Meetup Preferences
- `location` - City/neighborhood (e.g., "Seattle, WA")
- `timeWindow` - Availability (e.g., "Weekends 10am-4pm")
- `travelMode` - "driving" | "walking" | "biking" | "public_transit"
- `maxMinutes` - Max travel time in minutes
- `indoorPreferred` - Boolean for indoor preference
- `wheelchairAccess` - Boolean for accessibility needs
- `parkingNeeded` - Boolean for parking requirement
- `isUnder18` - Auto-calculated from age

### Profile Data
- `username` - Display name (auto-generated or custom)
- `avatar` - Emoji avatar (auto-assigned)
- `level` - Trading level (starts at 1)
- `xp` - Experience points
- `xpToNextLevel` - XP needed for next level
- `categoryInterests` - Array of interests
- `hasGuardian` - Boolean flag
- `createdAt` - Account creation timestamp

## 🎯 Next Steps

### To Integrate with Existing Features:

1. **Inventory System**
   - Link items to `userId`
   - Update `api.users.getInventory()` to fetch from real inventory

2. **Trade System**
   - Link trades to user IDs
   - Enforce guardian approval for under-18 users
   - Use meetup preferences in Safe-Meetup Assistant

3. **Profile Screen**
   - Display user profile data
   - Show XP progress and level
   - Allow editing meetup preferences
   - Show category interests with fun chips

4. **Discover Screen**
   - Filter by category interests
   - Show distance/travel time based on user location
   - Match meetup preferences

5. **Messages Screen**
   - Use Safe-Meetup Assistant with user preferences
   - Suggest meetup spots based on both users' preferences
   - Check time window compatibility

## ✅ Complete Integration Checklist

- ✅ Demo database with 2 placeholder users
- ✅ User authentication (register, login)
- ✅ Password reset flow
- ✅ JWT token management
- ✅ Protected routes
- ✅ Kid-friendly UI for all auth screens
- ✅ Guardian information collection
- ✅ Meetup preferences (location, time, travel, accessibility)
- ✅ User interests/categories
- ✅ Profile data (username, avatar, level, XP)
- ✅ API client integration
- ✅ Token storage in localStorage
- ✅ Sign out functionality

## 🎨 Design Consistency

All authentication screens maintain your established aesthetic:
- Playful emoji icons (👋, 🎉, 🔑, 🔐)
- Friendly microcopy ("Join Swappy!", "Welcome back!")
- Section headers with emojis (👤, 👨‍👩‍👧‍👦, 📍, 🎯)
- Info boxes with helpful hints
- Smooth hover animations
- Focus states for accessibility
- Error states with friendly messages

The system is now fully integrated and ready to use! 🚀

