# Kế Hoạch: Migrate sang Supabase Auth System

Refactor toàn bộ authentication để sử dụng Supabase Auth thay vì custom JWT.

---

## Tại Sao Migrate?

**Vấn đề hiện tại:**
- Đang maintain 2 auth systems: Custom JWT + Supabase OAuth
- Phức tạp, dễ lỗi, khó scale
- Không tận dụng được Supabase features (RLS, session management)

**Lợi ích khi dùng Supabase Auth:**
- ✅ Unified authentication (email/password + OAuth)
- ✅ Auto session management & refresh tokens
- ✅ Built-in security (RLS, token rotation)
- ✅ Less code, easier maintenance
- ✅ Better integration với Supabase ecosystem

---

## Proposed Changes

### Backend Simplification

#### [MODIFY] [auth.js](file:///c:/Users/Adonis/Downloads/App/server/routes/auth.js)

**Current flow (Complex):**
```javascript
POST /api/auth/register
→ Hash password
→ Insert user vào Supabase DB manually
→ Send verification email manually  
→ Generate custom JWT token
```

**New flow (Simple):**
```javascript
POST /api/auth/register
→ supabase.auth.signUp({ email, password })
→ Supabase handles: password hashing, email verification, session creation
→ Return Supabase session token
```

**Changes:**
- Replace `bcrypt` logic với `supabase.auth.signUp()`
- Replace `jwt.sign()` với Supabase session
- Remove manual email verification code
- Supabase Auto-sends verification email

---

#### [MODIFY] [auth.js](file:///c:/Users/Adonis/Downloads/App/server/routes/auth.js) - Login

**Current:**
```javascript
POST /api/auth/login
→ Find user in DB
→ Compare password với bcrypt
→ Generate custom JWT
```

**New:**
```javascript
POST /api/auth/login
→ supabase.auth.signInWithPassword({ email, password })
→ Return Supabase session
```

---

#### [SIMPLIFY] [oauth.js](file:///c:/Users/Adonis/Downloads/App/server/routes/oauth.js)

**Current:** Backend callback route để sync user data + generate JWT

**New:** KHÔNG CẦN backend callback! Supabase handles OAuth completely:
- User clicks "Sign in with Google"
- Redirect to Supabase OAuth URL
- Supabase handles callback & creates session
- Frontend receives session automatically

**Action:** DELETE hoặc greatly simplify `oauth.js`

---

#### [MODIFY] [auth middleware](file:///c:/Users/Adonis/Downloads/App/server/middleware/auth.js)

**Current:** Verify custom JWT token

**New:** Verify Supabase session token
```javascript
const { data: { user }, error } = await supabase.auth.getUser(token);
```

---

### Frontend Refactoring

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/Adonis/Downloads/App/src/contexts/AuthContext.tsx)

**Current:**
- Manually call `/api/auth/login` và `/api/auth/register`
- Store JWT in localStorage
- Manual session management

**New:**
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: username + '@r4b.local', // hoặc dùng email field
  password
});

// Register  
const { data, error } = await supabase.auth.signUp({
  email,
  password
});

// Auto session sync
useEffect(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user || null);
  });
}, []);
```

---

#### [MODIFY] [AuthCallback.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/AuthCallback.tsx)

**New (Simplified):**
```typescript
useEffect(() => {
  // Supabase auto-detects session from URL
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // Sync additional user data if needed
      navigate('/shop');
    }
  });
}, []);
```

---

### Database Changes

#### Supabase Auth Table

Supabase tự động tạo table `auth.users`. Cần:
1. Migrate existing users từ `public.users` sang `auth.users`
2. Link `public.users.id` với `auth.users.id` (UUID)
3. Enable RLS policies

#### [MODIFY] Users Table Structure

```sql
ALTER TABLE public.users
  ADD COLUMN auth_id UUID REFERENCES auth.users(id);

-- Link existing users
-- Migrate data strategy TBD
```

---

## Verification Plan

### Automated Tests

```bash
# Test flow locally
npm run dev
```

### Manual Verification

1. **Register flow:**
   - Register với email/password
   - Receive verification email từ Supabase
   - Click verify link
   - Login thành công

2. **Login flow:**
   - Login với verified account
   - Session auto-persists
   - Refresh page → still logged in

3. **Google OAuth:**
   - Click "Sign in with Google"
   - Complete OAuth
   - Auto redirect với session
   - Data synced

4. **Session management:**
   - Token auto-refreshes
   - Logout clears session
   - Cannot access protected routes when logged out

---

## Migration Strategy

> [!WARNING]
> **Breaking Change**: Existing users sẽ không thể login với old JWT tokens

**Options:**

**Option 1: Hard Reset (Recommended for Development)**
- Drop existing `users` table
- Recreate với Supabase Auth integration
- All users re-register

**Option 2: Gradual Migration**
- Keep both auth systems temporarily
- Require users to "re-verify" account
- Migrate users batch by batch

**Recommendation:** Option 1 vì đang dev phase
