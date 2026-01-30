# Task: Migrate sang Supabase Auth System

## Mục tiêu
Thay thế custom JWT authentication bằng Supabase Auth built-in để tận dụng:
- Session management tự động
- Email/Password auth + Google OAuth unified
- Row Level Security (RLS) integration
- Refresh token handling
- Built-in security features

---

## Phase 1: Backend Refactoring
- [x] Remove custom JWT logic khỏi `/api/auth/login`
- [x] Remove custom JWT logic khỏi `/api/auth/register`
- [x] Update auth middleware để verify Supabase session
- [x] Simplify OAuth callback route
- [x] Remove `JWT_SECRET` dependency

## Phase 2: Frontend Refactoring
- [x] Update `AuthContext` để sử dụng Supabase session hooks
- [x] Update `login()` method → `supabase.auth.signInWithPassword()`
- [x] Update `register()` method → `supabase.auth.signUp()`
- [x] Auto-sync Supabase session với React state
- [x] Update logout để clear Supabase session
- [x] Fix type errors với User interface
- [x] Update Auth.tsx để use email cho login

## Phase 3: Database & Migration
- [/] Enable Supabase Auth trong Dashboard
- [ ] Migrate existing users sang Supabase Auth
- [/] Setup RLS policies cho tables
- [/] Update `users` table structure nếu cần

## Phase 4: Testing & Cleanup
- [/] Test email/password login flow
- [/] Test Google OAuth flow
- [ ] Test session persistence
- [x] Remove unused JWT code
- [ ] Update documentation
