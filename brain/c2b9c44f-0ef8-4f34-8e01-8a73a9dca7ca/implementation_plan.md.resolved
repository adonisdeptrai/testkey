# Migration MongoDB → Supabase Postgres

Migrate toàn bộ R4B Application từ MongoDB sang Supabase Postgres, bao gồm database schema, backend logic, authentication, và file storage.

---

## User Review Required

> [!IMPORTANT]
> **Authentication Strategy Decision**
> - **Current**: Custom JWT với email verification và password reset flows
> - **Option A**: Giữ nguyên JWT custom (ít thay đổi code, control hoàn toàn)
> - **Option B**: Migrate sang Supabase Auth (native support password reset, email verification, RLS policies)
> 
> **Recommendation**: Start với Option A (giữ JWT custom) để minimize breaking changes. Có thể migrate sang Supabase Auth sau.

> [!WARNING]
> **Data Migration & Downtime**
> - Migration này sẽ KHÔNG copy data từ MongoDB hiện tại
> - Bắt đầu với fresh Supabase database
> - Nếu cần migrate data hiện có, cần thêm 1 data migration script riêng (confirm với user)

> [!WARNING]
> **External Dependencies Impact**
> - TPBank Worker và Binance Worker sẽ cần update database connections
> - Encryption/Decryption logic trong Settings cần được migrate sang Postgres functions hoặc giữ trong application layer

---

## Proposed Changes

### Database Layer - Supabase Migrations

#### [NEW] [create_users_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/001_create_users_table.sql)

Tạo bảng `users` với schema:
- `id` (uuid, primary key)
- `username` (text, unique)
- `email` (text, unique)
- `password` (text, hashed)
- `role` (enum: user/admin)
- `balance` (numeric, default 0)
- `avatar` (text, nullable)
- `is_verified` (boolean, default false)
- `verification_token` (text, nullable)
- `reset_password_token` (text, nullable)
- `reset_password_expires` (timestamp, nullable)
- `is_banned` (boolean, default false)
- `created_at` (timestamp with time zone)

Indexes: username, email, role, created_at

---

#### [NEW] [create_products_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/002_create_products_table.sql)

Tạo bảng `products`:
- `id` (uuid, primary key)
- `title` (text)
- `type` (enum: 'Automation Script', 'MMO Tool', 'Course', 'License Key')
- `price` (numeric)
- `original_price` (numeric, nullable)
- `description` (text)
- `image` (text)
- `features` (jsonb, array of strings)
- `stock` (integer, default 0)
- `unlimited_stock` (boolean, default false)
- `platform_id` (text)
- `rating` (numeric, default 5.0)
- `created_at` (timestamp)

---

#### [NEW] [create_product_keys_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/003_create_product_keys_table.sql)

Tạo bảng `product_keys` với Foreign Keys:
- `id` (uuid, primary key)
- `product_id` (uuid, FK → products.id ON DELETE CASCADE)
- `key` (text, unique)
- `status` (enum: available/sold/reserved)
- `order_id` (uuid, FK → orders.id, nullable)
- `user_id` (uuid, FK → users.id, nullable)
- `assigned_at` (timestamp, nullable)
- `created_at` (timestamp)

Indexes: product_id, status, compound (product_id + status)

---

#### [NEW] [create_orders_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/004_create_orders_table.sql)

Tạo bảng `orders`:
- `id` (uuid, primary key)
- `order_id` (text, unique, auto-generated "ORD-XXXXXX")
- `user` (text, username)
- `product` (text, product name)
- `amount` (numeric)
- `status` (enum: pending/completed/processing/paid/refunded/pending_verification/failed)
- `method` (text)
- `order_type` (enum: product_purchase/balance_topup)
- `verified_at` (timestamp, nullable)
- `manual_verify` (jsonb: verified, verifiedBy, verifiedAt, transactionId, note, receivedAmount)
- `assigned_keys` (jsonb, array of key IDs)
- `date` (timestamp)
- `created_at` (timestamp)

Auto-generate `order_id` với Postgres function hoặc application layer.

Indexes: user, status, date (desc), order_id, method, compound indexes

---

#### [NEW] [create_transactions_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/005_create_transactions_table.sql)

Tạo bảng `transactions`:
- `id` (uuid, primary key)
- `user_id` (uuid, FK → users.id)
- `type` (enum: topup/purchase/refund/admin_adjustment)
- `amount` (numeric)
- `balance_before` (numeric)
- `balance_after` (numeric)
- `description` (text)
- `related_order` (uuid, FK → orders.id, nullable)
- `created_by` (uuid, FK → users.id, nullable)
- `created_at` (timestamp)

Compound index: (user_id, created_at DESC)

---

#### [NEW] [create_tickets_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/006_create_tickets_table.sql)

Tạo bảng `tickets`:
- `id` (uuid, primary key)
- `ticket_id` (text, unique, auto-generated "TKT-XXXX")
- `user_id` (uuid, FK → users.id)
- `subject` (text, max 200 chars)
- `category` (enum)
- `priority` (enum: Low/Medium/High/Critical)
- `status` (enum: Open/In Progress/Resolved/Closed)
- `messages` (jsonb array: sender, senderRole, message, timestamp)
- `assigned_to` (uuid, FK → users.id, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Auto-generate `ticket_id` with trigger.

---

#### [NEW] [create_settings_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/007_create_settings_table.sql)

Tạo bảng `settings` (singleton table):
- `id` (uuid, primary key)
- `bank_config` (jsonb: bankId, accountNo, accountName, username, password, deviceId)
- `binance_config` (jsonb: apiKey, secretKey)
- `crypto_config` (jsonb: enabled, networks array)
- `exchange_rate` (numeric, default 25000)
- `is_auto_check_enabled` (boolean, default true)
- `updated_at` (timestamp)

**Encryption Strategy**: 
- Store encrypted values trong JSONB
- Encrypt/decrypt trong application layer (giữ nguyên utils/encryption.js)
- HOẶC sử dụng Postgres pgcrypto extension

---

#### [NEW] [create_system_logs_table.sql](file:///C:/Users/Adonis/Downloads/App/server/supabase/migrations/008_create_system_logs_table.sql)

Tạo bảng `system_logs`:
- `id` (uuid, primary key)
- `type` (enum: INFO/SUCCESS/WARNING/ERROR/WORKER)
- `message` (text)
- `details` (jsonb, nullable)
- `timestamp` (timestamp)

**Auto-deletion**: Sử dụng `pg_cron` extension để delete logs > 7 days, HOẶC implement cleanup job trong application.

---

### Backend Layer - Supabase Client Integration

#### [NEW] [supabase.js](file:///C:/Users/Adonis/Downloads/App/server/config/supabase.js)

Tạo Supabase client configuration:
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service key cho backend

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false } // Backend không cần session
});
```

---

#### [MODIFY] server/routes/auth.js, users.js, products.js, orders.js, payment.js, settings.js, tickets.js, stats.js

**Refactoring Pattern**: Replace Mongoose calls với Supabase queries

**Example transformation**:
```javascript
// BEFORE (Mongoose)
const user = await User.findOne({ username });

// AFTER (Supabase)
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .single();
```

**Key Changes**:
- Replace `Model.find()` → `supabase.from('table').select()`
- Replace `Model.create()` → `supabase.from('table').insert()`
- Replace `Model.updateOne()` → `supabase.from('table').update()`
- Replace `Model.deleteOne()` → `supabase.from('table').delete()`
- Handle Supabase error responses (check `error` object)
- Replace ObjectId references với UUID
- Maintain existing business logic (validation, encryption, authorization)

---

#### [MODIFY] server/workers/tpbankWorker.js

Update database connection:
- Replace Mongoose models với Supabase client
- Update Order status checks
- Update SystemLog creation

---

#### [DELETE] server/models/*.js

Remove all Mongoose models after full migration and verification.

---

### Environment Configuration

#### [MODIFY] [.env](file:///C:/Users/Adonis/Downloads/App/.env)

Replace MongoDB connection với Supabase credentials:
```env
# Remove
# MONGO_URI=mongodb://mongo:27017/r4b_db

# Add
SUPABASE_URL=https://okalizcwyzpwaffrkbey.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
SUPABASE_ANON_KEY=<anon_key>

# Keep existing
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
CLIENT_URL=...
```

---

#### [MODIFY] [.env.example](file:///C:/Users/Adonis/Downloads/App/.env.example)

Update template documentation.

---

### Package Dependencies

#### [MODIFY] [server/package.json](file:///C:/Users/Adonis/Downloads/App/server/package.json)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0", // ADD
    // REMOVE: "mongoose": "^8.0.3",
    // ... keep existing
  }
}
```

---

### Docker Configuration

#### [MODIFY] [docker-compose.yml](file:///C:/Users/Adonis/Downloads/App/docker-compose.yml)

Remove MongoDB service:
```yaml
# REMOVE entire mongo service block
# services:
#   mongo:
#     image: mongo:7.0
#     ...
```

Update backend environment variables to use Supabase.

---

#### [MODIFY] [docker-compose.prod.yml](file:///C:/Users/Adonis/Downloads/App/docker-compose.prod.yml)

Same as docker-compose.yml - remove MongoDB dependency.

---

## Verification Plan

### Automated Tests

**Database Migrations**:
```bash
# 1. Apply all migrations to Supabase
# (Using MCP tools or Supabase CLI)

# 2. Verify schema structure
python .agent/skills/database-design/scripts/schema_validator.py
```

**Backend Integration Tests**:
```bash
# 1. Install dependencies
cd server && npm install

# 2. Run existing tests (if any)
npm test

# 3. Manual API testing với provided PowerShell scripts
# Test authentication
./test-email-verification.ps1

# Test payment flows
./test-history-api.ps1
./test-password-reset.ps1
```

### Manual Verification

**Admin Dashboard Testing**:
1. Start application: `docker compose up`
2. Login với admin credentials: `mquyendeptrai` / `mquyendeptrai`
3. Verify:
   - Dashboard stats loading
   - Orders & Payments tab
   - Settings configuration (Bank, Crypto, Binance)
   - Product management (CRUD operations)
   - User management

**User Flow Testing**:
1. Login với user credentials: `mlyeee` / `mlyeee`
2. Verify:
   - Browse products
   - Add to cart
   - Checkout flow (crypto payment)
   - Order history
   - Balance operations

**Worker Testing**:
1. Configure TPBank credentials trong Settings
2. Monitor worker logs: `docker compose logs -f backend`
3. Verify transaction detection và order auto-verification

### Performance Testing

**Database Query Performance**:
```bash
# Run performance profiling
python .agent/skills/performance-profiling/scripts/bundle_analyzer.py
```

**Lighthouse Audit**:
```bash
# Run web performance audit
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py --url http://localhost:8080
```

---

## Migration Execution Order

1. **Database Setup** (Phase 1)
   - Apply migrations to Supabase project `okalizcwyzpwaffrkbey`
   - Verify schema creation
   
2. **Backend Refactoring** (Phase 2-3)
   - Install Supabase client
   - Refactor routes one-by-one
   - Update workers
   
3. **Environment Config** (Phase 4)
   - Update .env files
   - Update Docker configs
   
4. **Testing & Validation** (Phase 5)
   - Run automated tests
   - Manual testing flows
   - Performance benchmarks
   
5. **Cleanup** (Phase 6)
   - Remove Mongoose models
   - Remove MongoDB from Docker
   - Update documentation

