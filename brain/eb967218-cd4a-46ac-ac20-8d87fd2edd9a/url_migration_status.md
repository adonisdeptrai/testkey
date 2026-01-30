# URL Migration Status

## Summary
Need to replace 35+ hardcoded `http://localhost:5000` URLs with API config imports.

## Affected Files (12 total)

### ✅ Infrastructure - DONE
- [x] `src/config/api.ts` - Created centralized config
- [x] `.env.local` - Added VITE_API_URL

### ⚠️ Critical - NEEDS FIX
- [ ] `src/contexts/AuthContext.tsx` (2 instances)
- [ ] `src/pages/Checkout.tsx` (6 instances)
- [ ] `src/pages/Shop.tsx` (1 instance)

### 📋 Recommended Approach

**Option 1: Critical Files Only** (Quick fix for production)
Fix Auth + Checkout + Shop = 9 critical instances

**Option 2: Complete Migration** (Comprehensive)
Fix all 35+ instances across all 12 files

User should review `audit_report.md` for detailed list of all instances.
