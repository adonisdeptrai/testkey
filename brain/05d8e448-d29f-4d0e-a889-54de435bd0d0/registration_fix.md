# Registration Hanging - Debug & Fix Guide

**Issue:** Registration button shows infinite loading spinner

**Root Cause:** Supabase Auth email confirmation blocking the flow

---

## Quick Diagnosis

### Symptoms
- ✅ Form fields filled correctly
- ✅ No console errors
- ❌ Button shows loading spinner infinitely
- ❌ No success/error message

### Root Causes (Possible)

1. **Supabase Auth Not Enabled** (Most Likely)
   - Auth provider not activated in Supabase Dashboard
   - Email confirmation required but email service not configured

2. **Email Confirmation Blocking**
   - Supabase waits for email confirmation before completing registration
   - Frontend doesn't handle "check your email" state

3. **Duplicate User Creation**
   - Frontend creates in `auth.users`
   - Frontend also tries to create in `public.users`
   - Conflict if user already exists

---

## QUICK FIX (Immediate)

### Option 1: Disable Email Confirmation (Recommended for Dev)

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/okalizcwyzpwaffrkbey
   - Navigate to: Authentication → Providers → Email

2. **Disable "Confirm email":**
   ```
   ☐ Confirm email
   ```

3. **Save changes**

4. **Test registration again** → Should work immediately

---

### Option 2: Update Frontend to Handle Email State

Update `AuthContext.tsx` registration to not wait for email confirmation:

```typescript
const register = async (username: string, email: string, password: string) => {
  
if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
        // IMPORTANT: Don't wait for email confirmation
        emailConfirmation: false
      }
    });

    if (signUpError) throw signUpError;

    // Check if user was created (might be pending confirmation)
    if (authData.user) {
      // Create user record ONLY if it doesn't exist
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            username,
            email,
            role: 'user',
            balance: 0,
            is_verified: authData.user.confirmed_at ? true : false
          }]);

        if (insertError) {
          console.error('Error creating user record:', insertError);
          throw new Error('Failed to create user profile');
        }
      }
    }

    // Return immediately without waiting for confirmation
    return authData;

  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};
```

---

## LONG-TERM FIX (Production Ready)

### 1. Enable Supabase Auth Properly

**Supabase Dashboard Steps:**

1. **Enable Email Auth:**
   - Authentication → Providers → Email → Enable

2. **Configure Email Templates:**
   - Authentication → Email Templates
   - Customize "Confirm Signup" template
   - Set sender name: "R4bbit"

3. **Set Site URL:**
   - Authentication → URL Configuration
   - Site URL: `https://r4bbit-hub.vercel.app`
   - Redirect URLs:
     - `http://localhost:8080/verify-email`
     - `https://r4bbit-hub.vercel.app/verify-email`

4. **Enable Google OAuth (Optional):**
   - Authentication → Providers → Google
   - Add Client ID & Secret from Google Cloud Console
   - See: [oauth_branding_guide.md](file:///C:/Users/Adonis/.gemini/antigravity/brain/05d8e448-d29f-4d0e-a889-54de435bd0d0/oauth_branding_guide.md)

---

### 2. Fix Frontend Registration Flow

Update `src/pages/Auth.tsx` to show proper feedback:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...

  try {
    if (mode === 'register') {
      await register(username, email, password);
      
      // Show success message
      setSuccess('Account created! Please check your email to verify.');
      setIsVerifying(true); // Show verification code input
      
      // Don't auto-login - wait for email verification
    }
  } catch (err: any) {
    setError(err.message || "Authentication failed");
  }
  setIsLoading(false);
};
```

---

### 3. Remove Backend `/register` Route (Optional)

Since frontend handles Supabase Auth directly, backend route is redundant:

**server/routes/auth.js:**

```javascript
// OPTION A: Keep for compatibility but simplify
router.post('/register', authLimiter, async (req, res) => {
  // Deprecated: Frontend should use Supabase Auth directly
  res.status(410).json({ 
    message: 'This endpoint is deprecated. Please use Supabase Auth directly.' 
  });
});

// OPTION B: Remove entirely
// Delete the route
```

---

## VERIFICATION CHECKLIST

After applying fix:

- [ ] **Supabase Dashboard:**
  - [ ] Email provider enabled
  - [ ] Email confirmation setting configured
  - [ ] Site URL set correctly

- [ ] **Frontend:**
  - [ ] Registration shows success message
  - [ ] Email verification prompt displays
  - [ ] No infinite loading

- [ ] **Database:**
  - [ ] Check `auth.users` table → New user created
  - [ ] Check `public.users` table → Profile created
  - [ ] User `is_verified` = false initially

- [ ] **Email:**
  - [ ] Verification email received (check spam)
  - [ ] Click verification link → `is_verified` = true

---

## TEST PROCEDURE

1. **Clean State:**
   ```sql
   -- Run in Supabase SQL Editor
   DELETE FROM auth.users WHERE email = 'test@example.com';
   DELETE FROM public.users WHERE email = 'test@example.com';
   ```

2. **Register:**
   - Username: `testuser123`
   - Email: `test@example.com`
   - Password: `Test123456`

3. **Expected Flow:**
   - ✅ Loading spinner shows
   - ✅ Success message appears (< 3 seconds)
   - ✅ "Check your email" prompt displays
   - ✅ Email received in inbox

4. **Verify in Database:**
   ```sql
   SELECT * FROM auth.users WHERE email = 'test@example.com';
   SELECT * FROM public.users WHERE email = 'test@example.com';
   ```

---

## DEBUGGING TIPS

### Check Supabase Logs

**Supabase Dashboard → Logs → Auth Logs**

Look for:
- `user_signedup` event
- Any error messages
- Email delivery status

### Check Browser Console

Press F12 → Console tab:

```javascript
// Should see:
"Registration error: ..." // If error
// or
"User created successfully" // If success  
```

### Check Network Tab

F12 → Network tab:

- POST to `supabase.co/auth/v1/signup` → Status 200
- If 400/500 error → Check response body for details

---

## COMMON ERRORS

### "Email already registered"

**Solution:**
```sql
DELETE FROM auth.users WHERE email = 'your@email.com';
DELETE FROM public.users WHERE email = 'your@email.com';
```

### "User already exists" (public.users)

**Solution:** Frontend trying to insert duplicate. Check if user already exists before insert:

```typescript
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('id', authData.user.id)
  .single();

if (!existingUser) {
  // Insert new user
}
```

### "Invalid API key"

**Solution:** Check `.env.local`:
```env
VITE_SUPABASE_URL=https://okalizcwyzpwaffrkbey.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## IMMEDIATE ACTION

**Right now, do this:**

1. **Supabase Dashboard** → Authentication → Providers → Email
2. **Uncheck "Confirm email"**
3. **Save**
4. **Try registration again** → Should work!

Then you can enable email confirmation later and implement proper verification flow.

---

**Screenshot of issue:**

![Registration Loading State](file:///C:/Users/Adonis/.gemini/antigravity/brain/05d8e448-d29f-4d0e-a889-54de435bd0d0/uploaded_media_1769749862066.png)
