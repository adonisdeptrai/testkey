# 🔍 Comprehensive Code Audit Report

**Ngày audit:** 2026-01-25  
**Scope:** Full-stack application (Frontend React + Backend Node.js/Express + MongoDB)

---

## 📊 Executive Summary

**Tổng quan:** Application có foundation bảo mật khá tốt (helmet, rate limiting, mongo-sanitize) nhưng có **nhiều vấn đề nghiêm trọng** cần fix ngay:

| Severity       | Count | Category                   |
| -------------- | ----- | -------------------------- |
| 🔴 **CRITICAL** | 3     | Sensitive data exposure    |
| 🟠 **HIGH**     | 5     | Security & Configuration   |
| 🟡 **MEDIUM**   | 4     | Code Quality & Type Safety |
| 🟢 **LOW**      | 3     | Best Practices             |

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### ❌ CRIT-001: Credentials Exposed in Repository
**File:** `.env.production`  
**Severity:** 🔴 CRITICAL

**Vấn đề:**
```bash
# .env.production có commit lên repository
JWT_SECRET=f4eb5d06d86016a2977f883da4c8614486588a4422fc90623d24e526a7e0d37e
EMAIL_USER=qbuiminh1110@gmail.com
EMAIL_PASS=bfdnqgfvkrbjhbqc  # ← Gmail App Password bị lộ
```

**Risk:** Toàn bộ hệ thống JWT có thể bị compromise. Email credentials bị lộ → attacker có thể:
- Forge JWTs và impersonate bất kỳ user nào
- Gửi spam/phishing emails từ email của bạn
- Reset passwords của users

**Fix:**
1. **NGAY LẬP TỨC:**
   ```bash
   # Xóa file khỏi repo
   git rm --cached .env.production .env
   
   # Thêm vào .gitignore
   echo ".env*" >> .gitignore
   echo "!.env.example" >> .gitignore
   
   # Regenerate secrets
   JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ```

2. **Revoke Gmail App Password** tại [Google Account Security](https://myaccount.google.com/apppasswords)

3. **Rotate JWT_SECRET** → Force logout toàn bộ users

---

### ❌ CRIT-002: Passwords Stored in Plaintext (Database)
**File:** `server/models/Settings.js`  
**Severity:** 🔴 CRITICAL

**Vấn đề:**
```javascript
bank: {
    password: { type: String, default: '' },  // ← TPBank password plaintext
},
binance: {
    secretKey: { type: String, default: '' }, // ← Binance Secret Key plaintext
}
```

**Risk:** Nếu MongoDB bị breach, attacker có full access vào:
- TPBank account → Rút tiền
- Binance account → Trade crypto, withdraw funds

**Fix:**
```javascript
// server/utils/encryption.js
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };
```

**Update Settings model:**
```javascript
// Pre-save hook để encrypt
SettingsSchema.pre('save', function(next) {
    if (this.isModified('bank.password') && this.bank.password) {
        this.bank.password = encrypt(this.bank.password);
    }
    if (this.isModified('binance.secretKey') && this.binance.secretKey) {
        this.binance.secretKey = encrypt(this.binance.secretKey);
    }
    next();
});
```

---

### ❌ CRIT-003: Hardcoded Backend URLs (35+ instances)
**Files:** `src/pages/*.tsx`, `src/components/admin/*.tsx`  
**Severity:** 🔴 CRITICAL (cho Production)

**Vấn đề:**
```typescript
// Hardcoded everywhere
const res = await fetch('http://localhost:5000/api/products');
```

**Instances Found:** 35+ occurrences

**Risk:** 
- Production sẽ fail (localhost không tồn tại)
- Không thể deploy lên different environments

**Fix:**
1. Create `src/config/api.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    PRODUCTS: `${API_BASE_URL}/api/products`,
    ORDERS: `${API_BASE_URL}/api/orders`,
    AUTH: `${API_BASE_URL}/api/auth`,
    // ...
} as const;
```

2. Update `.env.production`:
```bash
VITE_API_URL=https://api.mmopro.click
```

3. Global find/replace:
```bash
# Find all occurrences
rg "http://localhost:5000" src/ -l

# Replace with API_BASE_URL import
```

---

## 🟠 HIGH PRIORITY ISSUES

### ⚠️ HIGH-001: JWT in localStorage (XSS Vulnerable)
**File:** `src/contexts/AuthContext.tsx`  
**Severity:** 🟠 HIGH

**Vấn đề:**
```typescript
localStorage.setItem('token', data.token);  // Line 41
localStorage.setItem('user', JSON.stringify(data.user));
```

**Risk:** Nếu có XSS vulnerability, attacker có thể steal JWT token

**Fix Options:**
1. **HttpOnly Cookies** (Recommended):
```javascript
// Backend: Set cookie instead
res.cookie('token', token, {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
});
```

2. **Keep localStorage** nhưng add XSS protection:
   - Implement Content Security Policy (CSP)
   - Sanitize all user inputs
   - Use `DOMPurify` for HTML rendering

---

### ⚠️ HIGH-002: No Input Validation on Settings Routes
**File:** `server/routes/settings.js`  
**Severity:** 🟠 HIGH

**Vấn đề:**
```javascript
router.put('/', auth, async (req, res) => {
    // No validation!
    if (req.body.binance) settings.binance = req.body.binance;
    if (req.body.crypto) settings.crypto = req.body.crypto;
});
```

**Risk:** 
- NoSQL injection via nested objects
- Type confusion attacks
- Unexpected data shapes

**Fix:**
```javascript
const { body, validationResult } = require('express-validator');

router.put('/', auth, [
    body('bank.accountNo').optional().isNumeric().isLength({ min: 10, max: 20 }),
    body('bank.accountName').optional().isAlpha('en-US', { ignore: ' ' }),
    body('binance.apiKey').optional().isAlphanumeric().isLength({ min: 32, max: 64 }),
    body('exchangeRate').optional().isNumeric().isInt({ min: 1000, max: 100000 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // ... proceed
});
```

---

### ⚠️ HIGH-003: Console.log in Production (156+ instances)
**Files:** `server/**/*.js`  
**Severity:** 🟠 HIGH

**Vấn đề:**
- `server/workers/tpbankWorker.js`: Line 10
- `server/utils/tpbank.js`: Line 158
- `server/test*.js`: Multiple files
- `src/contexts/AuthContext.tsx`: Lines 29, 40

**Risk:**
- Logs sensitive data (passwords, tokens, user data)
- Performance degradation
- Information disclosure

**Fix:**
1. Use proper logger:
```bash
npm install winston
```

2. Create `server/utils/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
```

3. Replace all `console.log`:
```javascript
// Before
console.log('User logged in:', username);

// After
logger.info('User logged in', { username });
```

---

### ⚠️ HIGH-004: Missing CORS Configuration
**File:** `server/index.js`  
**Severity:** 🟠 HIGH

**Vấn đề:**
```javascript
app.use(cors());  // Line 14 - Allow ALL origins!
```

**Risk:** Any website có thể call API của bạn → CSRF attacks

**Fix:**
```javascript
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

---

### ⚠️ HIGH-005: No Rate Limiting on Critical Routes
**File:** `server/routes/auth.js`  
**Severity:** 🟠 HIGH

**Vấn đề:**
- Login route has `authLimiter` ✅
- Register, verify, reset-password có rate limit ✅
- **Nhưng** `/verify-email/:token` (GET) KHÔNG có rate limit ❌

**Risk:** Brute-force token enumeration

**Fix:**
```javascript
router.get('/verify-email/:token', strictLimiter, async (req, res) => {
    // ...
});
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### ⚠️ MED-001: No TypeScript Strict Mode
**File:** `tsconfig.json`  
**Severity:** 🟡 MEDIUM

**Vấn đề:**
```json
{
  "compilerOptions": {
    // Missing:
    // "strict": true,
    // "noImplicitAny": true,
    // "strictNullChecks": true
  }
}
```

**Impact:** Type errors không được catch, dẫn đến runtime errors

**Fix:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

### ⚠️ MED-002: @ts-ignore Usage
**File:** `src/pages/AdminDashboard.tsx`  
**Lines:** 752, 824

**Vấn đề:**
```typescript
// @ts-ignore
const { username, password, deviceId } = settings.bank;
```

**Fix:** Proper typing
```typescript
interface BankSettings {
    username?: string;
    password?: string;
    deviceId?: string;
    accountNo?: string;
    accountName?: string;
    bankId?: string;
}

// Then
const { username = '', password = '', deviceId = '' } = settings.bank as BankSettings;
```

---

### ⚠️ MED-003: No Error Boundary (Frontend)
**File:** `src/App.tsx`

**Vấn đề:** Nếu component crash, toàn bộ app sẽ white screen

**Fix:**
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    state = { hasError: false, error: undefined };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-screen">
                    <h1>Đã xảy ra lỗi</h1>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()}>
                        Tải lại trang
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Wrap App
<ErrorBoundary>
    <App />
</ErrorBoundary>
```

---

### ⚠️ MED-004: No Database Indexes on Foreign Keys
**File:** `server/models/Order.js`

**Current:** Indexes trên `user`, `status`, `date` ✅  
**Missing:** Indexes cho `assignedKeys` array lookup

**Fix:**
```javascript
OrderSchema.index({ assignedKeys: 1 }); // For key lookups
OrderSchema.index({ 'manualVerify.verified': 1 }); // For filtering
```

---

## 🟢 LOW PRIORITY (Best Practices)

### ✅ LOW-001: Missing API Response Standards
**Impact:** Inconsistent error messages

**Fix:** Standardize responses
```javascript
// server/utils/response.js
class APIResponse {
    static success(data, message = 'Success') {
        return { success: true, message, data };
    }

    static error(message, code = 400, errors = []) {
        return { success: false, message, errors, code };
    }
}
```

---

### ✅ LOW-002: No Request Logging Middleware
**Fix:**
```javascript
const morgan = require('morgan');
app.use(morgan('combined', { stream: logger.stream }));
```

---

### ✅ LOW-003: Missing Health Check Metrics
**Current:** Basic `/api/health` ✅  
**Improvement:** Add DB status, memory usage

```javascript
app.get('/api/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const memoryUsage = process.memoryUsage();
    
    res.json({
        status: 'OK',
        timestamp: new Date(),
        database: dbStatus,
        memory: {
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
        },
        uptime: process.uptime()
    });
});
```

---

## ✅ POSITIVE FINDINGS (Good Practices)

| Area                   | Status        | Notes                           |
| ---------------------- | ------------- | ------------------------------- |
| ✅ Helmet Config        | **GOOD**      | CSP, HSTS configured properly   |
| ✅ MongoDB Sanitization | **GOOD**      | `express-mongo-sanitize` active |
| ✅ Rate Limiting        | **GOOD**      | Auth routes protected           |
| ✅ Password Hashing     | **GOOD**      | bcrypt với salt=10              |
| ✅ JWT Expiry           | **GOOD**      | 1 day expiration                |
| ✅ Password Reset Flow  | **EXCELLENT** | Hashed tokens, 30min expiry     |
| ✅ Email Verification   | **GOOD**      | 6-digit OTP                     |
| ✅ Database Indexes     | **GOOD**      | Proper indexes trên User, Order |
| ✅ Error Handling       | **GOOD**      | Try-catch toàn bộ routes        |

---

## 📋 ACTION PLAN (Priority Order)

### 🚨 IMMEDIATE (Today)
1. [ ] **Remove `.env.production` from git** → Revoke exposed credentials
2. [ ] **Encrypt passwords in Settings model**
3. [ ] **Fix hardcoded localhost URLs** → Environment variables

### 📅 THIS WEEK
4. [ ] **Implement proper logging** (replace console.log)
5. [ ] **Add input validation** cho Settings routes
6. [ ] **Fix CORS** configuration
7. [ ] **Add rate limiting** to `/verify-email/:token`

### 📅 THIS MONTH
8. [ ] **Enable TypeScript strict mode** + fix type errors
9. [ ] **Remove @ts-ignore** với proper typing
10. [ ] **Add Error Boundary** (Frontend)
11. [ ] **Implement JWT in HttpOnly cookies** (optional but recommended)
12. [ ] **Add request logging middleware**

---

## 📊 Metrics Summary

| Metric                         | Value |
| ------------------------------ | ----- |
| **Total Files Scanned**        | 50+   |
| **Security Issues**            | 8     |
| **Code Quality Issues**        | 4     |
| **Best Practice Improvements** | 3     |
| **Hardcoded URLs**             | 35+   |
| **Console.log Statements**     | 156+  |
| **@ts-ignore Usages**          | 2     |

---

## 🎯 Recommendations

### Security
1. **Implement WAF** (Web Application Firewall) như Cloudflare
2. **Setup security headers monitoring** ([SecurityHeaders.com](https://securityheaders.com))
3. **Regular dependency audits**: `npm audit` weekly
4. **Penetration testing** trước khi production launch

### Performance
1. **Add Redis caching** cho frequently accessed data
2. **Implement pagination** cho orders/products lists
3. **Database query optimization** với `.explain()`
4. **CDN** cho static assets

### Monitoring
1. **Sentry** cho error tracking
2. **New Relic / DataDog** cho APM
3. **MongoDB Atlas monitoring** cho database metrics
4. **Uptime monitoring** (UptimeRobot, Pingdom)

---

**Prepared By:** Antigravity AI Agent  
**Report Version:** 1.0  
**Next Review:** After fixes implemented
