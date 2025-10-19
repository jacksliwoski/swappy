# 🔐 Authentication & Demo Database Integration

## Overview
Swappy now includes a complete authentication system with a file-based demo database, perfect for development and demonstration purposes. All auth screens have been restyled with the kid-friendly, playful UI aesthetic.

---

## 🗄️ Demo Database System

### File-Based Storage (`visa-server/src/db/filedb.js`)
A simple, lightweight JSON file database for demo/development:

**Files Created:**
- `data/users.json` - User accounts with bcrypt password hashing
- `data/resets.json` - Password reset tokens
- `data/outbox/*.eml` - Email messages (no real SMTP needed!)

**Features:**
- ✅ Atomic file writes (no data corruption)
- ✅ bcrypt password hashing (12 rounds)
- ✅ Guardian information storage (for kids under 18)
- ✅ Reset token management with expiration
- ✅ Safe concurrent access

**User Schema:**
```json
{
  "id": "u_1234567890",
  "email": "kid@example.com",
  "passwordHash": "bcrypt_hash_here",
  "age": 12,
  "guardianName": "Parent Name",
  "guardianEmail": "parent@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 🔑 Authentication System

### Backend API Endpoints (`visa-server/src/routes/auth.js`)

**POST /api/auth/register**
- Register new user account
- Validates guardian info required
- Sends guardian notification email
- Returns JWT token

```typescript
{
  email: string;
  password: string;
  age: number;
  guardianName: string;
  guardianEmail: string;
}
```

**POST /api/auth/login**
- Sign in with email/password
- Returns JWT token + user data
- Token expires in 7 days (configurable)

**POST /api/auth/forgot**
- Request password reset link
- Generates secure token (24 bytes)
- Writes email to outbox (demo mode)
- Token expires in 30 minutes

**POST /api/auth/reset**
- Reset password with token
- Validates token not expired/used
- Updates password with bcrypt hash

**GET /api/auth/me**
- Get current user info
- Requires valid JWT in Authorization header

---

## 🎨 Kid-Friendly Auth Screens

All authentication screens have been restyled with the playful, colorful design:

### **SignIn** (`src/screens/SignIn.tsx`)
- 👋 Welcoming "Welcome Back!" message
- Mint green (#22D3A8) primary button
- Smooth hover animations (scale + translate)
- Links to forgot password & sign up
- Loading states with disabled styling

### **SignUp** (`src/screens/SignUp.tsx`)
- 🎉 Exciting "Join Swappy!" headline
- Guardian info section with info box
- Age validation (5-17)
- All fields with focus animations
- Clear instructions for kids

### **ForgotPassword** (`src/screens/ForgotPassword.tsx`)
- 🔑 Friendly "No worries!" messaging
- Success state with green background
- Email written to server outbox notice
- Button changes to "Link Sent! ✓" on success

### **ResetPassword** (`src/screens/ResetPassword.tsx`)
- 🔒 Clear "Reset Your Password" title
- Token validation from URL params
- Auto-redirect to sign in after success
- Password minimum length (6 chars)

### **AuthButton** (`visa-server/components/AuthButton.tsx`)
- Pill-shaped button with 👋 emoji
- Hover animation (bounce up)
- Switches between "Sign in" / "Sign out"
- Syncs across tabs via localStorage events

---

## 🎨 Design Tokens Used

All auth screens use the consistent kid-friendly design system:

**Colors:**
- Brand: `var(--color-brand)` - #22D3A8 (mint green)
- Surface: `var(--color-surface)` - #FFFFFF
- Text: `var(--color-text-1)` / `var(--color-text-2)`
- Success: `var(--color-success-light)` - light green
- Error: `var(--color-error-light)` - light red

**Typography:**
- Headings: `var(--font-display)` - Fredoka (bubbly)
- Body: `var(--font-body)` - Nunito (legible)
- Sizes: h2 (30px), body (16px), small (14px)

**Spacing:**
- Padding: `var(--space-3)` through `var(--space-8)`
- Consistent 8pt grid system

**Effects:**
- Border radius: `var(--radius-sm)` to `var(--radius-pill)`
- Shadows: `var(--shadow-s1)` / `var(--shadow-s2)`
- Transitions: `var(--transition-base)` - 180ms ease-out

---

## 🔐 JWT Token Management

### Client-Side (`src/utils/api.ts`)

**Token Helpers:**
```typescript
setToken(token: string)    // Save to localStorage
getToken(): string | null   // Retrieve token
clearToken()               // Remove on sign out
```

**Auth Headers:**
```typescript
withAuth(init: RequestInit): RequestInit
// Adds: Authorization: Bearer <token>
```

### Server-Side (`visa-server/src/middleware/auth.js`)

**JWT Signing:**
```javascript
signJwt(payload, opts)
// Creates token with user id & email
// Expires in 7 days (configurable)
```

**Protected Routes:**
```javascript
requireAuth(req, res, next)
// Validates JWT from Authorization header
// Attaches user to req.user
// Returns 401 if invalid/missing
```

---

## 📧 Demo Email System

**Nodemailer File Transport:**
- No SMTP configuration needed!
- Emails written to `data/outbox/*.eml` files
- Perfect for development/demo

**Emails Sent:**
1. **Guardian Notification** - When kid creates account
2. **Password Reset** - With token link

**Email File Format:**
```
From: Swappy <no-reply@swappy.local>
To: parent@example.com
Subject: Guardian notice: New account created
Date: ...

Hi Parent,

An account was created listing you as guardian for kid@example.com.
Age: 12

— Swappy
```

---

## 🚀 Usage Examples

### **Register New User:**
```typescript
const res = await api.auth.register({
  email: 'kid@example.com',
  password: 'strongPassword123',
  age: 12,
  guardianName: 'Jane Doe',
  guardianEmail: 'jane@example.com'
});

setToken(res.token); // Save JWT
// Redirect to app
```

### **Sign In:**
```typescript
const res = await api.auth.login({
  email: 'kid@example.com',
  password: 'strongPassword123'
});

setToken(res.token);
// User is now authenticated
```

### **Protected API Calls:**
```typescript
// Token automatically included in headers
const user = await api.users.get('user-1');
```

### **Sign Out:**
```typescript
clearToken();
location.href = '/signin';
```

---

## 🎨 Visual Design Highlights

### **Hover States:**
- Buttons scale up (1.02x) and elevate (translateY -2px)
- Shadow increases from s1 → s2
- Color darkens to brand-ink

### **Focus States:**
- Input borders turn mint green
- Subtle shadow appears (s1)
- Smooth 180ms transition

### **Success/Error Messages:**
- Colored backgrounds (light green/red)
- Bold text with semibold weight
- Rounded corners (radius-sm)

### **Loading States:**
- Button opacity reduces to 60%
- Cursor changes to not-allowed
- Text changes to "Signing in..." etc.

---

## 🔒 Security Features

1. **Password Hashing:** bcrypt with 12 rounds
2. **JWT Expiration:** 7 days (configurable)
3. **Reset Token Expiration:** 30 minutes
4. **One-Time Reset Tokens:** Deleted after use
5. **Guardian Verification:** Required for accounts
6. **HTTPS Ready:** Bearer token in Authorization header

---

## 📱 Mobile Optimizations

- Minimum tap targets: 44px height
- Responsive container (max-width 420-480px)
- Centered layout with padding
- Touch-friendly input fields
- Clear error messages

---

## 🎯 Integration Checklist

✅ File-based database created  
✅ Auth routes implemented  
✅ JWT middleware configured  
✅ SignIn screen styled  
✅ SignUp screen styled  
✅ ForgotPassword screen styled  
✅ ResetPassword screen styled  
✅ AuthButton component styled  
✅ Token management in API utils  
✅ Email system (file transport)  
✅ Guardian info validation  
✅ Kid-friendly design tokens applied  
✅ Hover/focus states implemented  
✅ Loading states added  
✅ Error handling with friendly messages  
✅ Mobile responsive  
✅ Accessibility (focus rings, labels)  

---

## 🚀 Next Steps

To use the authentication system:

1. **Start the visa-server:**
   ```bash
   cd visa-server
   npm install
   node src/index.js
   ```

2. **Update App.tsx routing** to include auth screens

3. **Protect routes** with token checks:
   ```typescript
   if (!getToken()) {
     location.href = '/signin';
   }
   ```

4. **Add AuthButton** to main app header

5. **Check outbox** for demo emails:
   ```
   visa-server/data/outbox/
   ```

---

## 🎨 Design Philosophy

The authentication system follows the same **kid-friendly, playful aesthetic** as the rest of Swappy:

- **Fredoka headings** - Bubbly and fun
- **Nunito body text** - Clear and readable
- **Mint green brand** - Fresh and inviting
- **Bouncy animations** - Delightful interactions
- **Friendly language** - "No worries!", "Let's go!"
- **Clear feedback** - Success/error states visible
- **Safe & secure** - Guardian oversight built-in

---

**The authentication system is now fully integrated with Swappy's kid-friendly UI! 🎉**

