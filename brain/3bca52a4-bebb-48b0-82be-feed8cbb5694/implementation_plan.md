# Bổ Sung Middleware Auth Backend

Tăng cường bảo mật cho API bằng cách áp dụng authentication và authorization middleware cho các endpoints nhạy cảm.

---

## Phân Tích Hiện Trạng

### Middleware đã có
- [auth.js](file:///c:/Users/Adonis/Downloads/App/server/middleware/auth.js) - Kiểm tra JWT token, trả về `req.user` với `id` và `role`

### Routes cần bảo vệ

| File | Endpoint | Method | Trạng thái | Đề xuất |
|------|----------|--------|------------|---------|
| products.js | `/api/products` | POST | ❌ Không auth | Admin only |
| products.js | `/api/products/:id` | PUT | ❌ Không auth | Admin only |
| products.js | `/api/products/:id` | DELETE | ❌ Không auth | Admin only |
| orders.js | `/api/orders` | GET | ❌ Không auth | Admin only |
| orders.js | `/api/orders/:id` | PUT | ❌ Không auth | Admin only |
| orders.js | `/api/orders/:id/verify` | PUT | ❌ Không auth | Admin only |
| settings.js | `/api/settings` | PUT | ❌ Không auth | Admin only |
| settings.js | `/api/settings/test-tpbank` | POST | ❌ Không auth | Admin only |

### Public endpoints (giữ nguyên)
- `GET /api/products` - Danh sách sản phẩm (public shop)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/settings` - Lấy settings cho checkout
- `POST /api/orders` - User tạo đơn hàng (xem xét thêm auth)
- `GET /api/orders/my-orders` - ✅ Đã có auth

---

## Proposed Changes

### Middleware

#### [NEW] [adminAuth.js](file:///c:/Users/Adonis/Downloads/App/server/middleware/adminAuth.js)
Middleware mới kiểm tra user có role `admin`:
```javascript
module.exports = function (req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};
```

---

### Routes

#### [MODIFY] [products.js](file:///c:/Users/Adonis/Downloads/App/server/routes/products.js)
- Import `auth` và `adminAuth` middleware
- Áp dụng `[auth, adminAuth]` cho POST, PUT, DELETE

#### [MODIFY] [orders.js](file:///c:/Users/Adonis/Downloads/App/server/routes/orders.js)
- Import `adminAuth` middleware
- Áp dụng `[auth, adminAuth]` cho GET `/`, PUT `/:id`, PUT `/:id/verify`

#### [MODIFY] [settings.js](file:///c:/Users/Adonis/Downloads/App/server/routes/settings.js)
- Uncomment import `auth`
- Import `adminAuth` middleware
- Áp dụng `[auth, adminAuth]` cho PUT `/` và POST `/test-tpbank`

---

## Verification Plan

### Manual Testing (Browser/cURL)

**Bước 1: Khởi động server**
```powershell
cd c:\Users\Adonis\Downloads\App\server
npm run dev
```

**Bước 2: Test Unauthorized (không có token)**
```powershell
# Phải trả về 401 - No token
curl -X POST http://localhost:5000/api/products -H "Content-Type: application/json" -d "{\"name\":\"test\"}"

curl -X PUT http://localhost:5000/api/settings -H "Content-Type: application/json" -d "{\"exchangeRate\":25000}"
```

**Bước 3: Test với User token (role=user)**
```powershell
# Login với user thường, lấy token
# Sử dụng token để test - phải trả về 403 - Access denied. Admin only.
```

**Bước 4: Test với Admin token (role=admin)**
```powershell
# Login với admin (mquyendeptrai/mquyendeptrai), lấy token  
# Sử dụng token để test - phải thành công (200/201)
```

**Bước 5: Test Public endpoints vẫn hoạt động**
```powershell
# Không cần token
curl http://localhost:5000/api/products
curl http://localhost:5000/api/settings
```
