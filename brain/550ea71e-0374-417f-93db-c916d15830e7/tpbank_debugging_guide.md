# TPBank API Connection - Debugging Report

## 🔍 Issues Identified

### 1. JSON Syntax Error in Postman Request

**Error:**
```
SyntaxError: Expected ',' or '}' after property value in JSON at position 99
```

**Cause:** Missing comma or invalid JSON format in request body.

**Solution:** Use correct JSON format:

```json
{
  "username": "anhnadeeds1",
  "password": "Vjxzduaa168@",
  "deviceId": "B89A8P0GPQB-4bp2a4bNe4Tdng38-z344f8BtBBt-goltGI3BftRGPkX95L-8f5Rqq2bNhfA4AOlXgvT0Tgrw"
}
```

> [!WARNING]
> DO NOT include `accountId` field in `/test-tpbank` endpoint - it's not required

---

### 2. TPBank API Blocking Requests

**Error:**
```html
This page can't be displayed. Contact support for additional information.
Incident ID: 7525906546050143565
```

**Possible Causes:**
1. **DeviceID mismatch** - DeviceID từ browser không khớp với IP của Docker container
2. **TPBank WAF/Firewall** - TPBank chặn requests từ Docker environment
3. **Rate Limiting** - Quá nhiều requests trong thời gian ngắn

---

## ✅ Solutions Implemented

### 1. Enhanced Authentication Middleware

Updated [`auth.js`](file:///c:/Users/Adonis/Downloads/App/server/middleware/auth.js) to support both formats:
- ✅ `x-auth-token: <token>` (original)
- ✅ `Authorization: Bearer <token>` (standard REST API)

### 2. Postman Collection Documentation

Created comprehensive API testing guide: [`postman_collection.md`](file:///c:/Users/Adonis/.gemini/antigravity/brain/550ea71e-0374-417f-93db-c916d15830e7/postman_collection.md)

---

## 🧪 Testing Recommendations

### Option A: Test from Frontend Admin Dashboard

Thay vì dùng Postman, test trực tiếp từ Admin Dashboard:

1. Login admin: `http://localhost:3000/admin`
2. Navigate to **Settings** tab
3. Fill in TPBank credentials
4. Click **Test Connection**

**Ưu điểm:** Request đi từ browser thật, có thể bypass TPBank security checks

### Option B: Get Fresh DeviceID

DeviceID phải được lấy từ **cùng IP/environment** sẽ gọi API:

1. Mở browser đã login TPBank
2. Vào `https://ebank.tpb.vn/retail/vX/`
3. F12 → Console → gõ: `localStorage.deviceId`
4. Copy giá trị mới
5. Update trong Admin Settings

### Option C: Disable Auto-Check During Testing

1. Tắt toggle "Auto-Check" trong Transfer History
2. Test manually qua Admin Dashboard
3. Tránh spam requests bị TPBank block

---

## 📊 Backend Logs Analysis

```
[TPBank Worker] [WORKER] Checking bank for 9 pending orders...
TPBank Login Error: <HTML Error Page>
[TPBank Worker] [ERROR] Failed to fetch TPBank history
```

**Interpretation:** 
- Worker đang chạy background checks mỗi 2 phút
- Mỗi lần đều bị TPBank block
- Có 9 orders đang pending payment

**Action:** Cập nhật credentials hợp lệ trong Settings hoặc disable auto-check

---

## 🎯 Next Steps

1. **Lấy DeviceID mới** từ browser đã login TPBank
2. **Test từ Admin Dashboard** thay vì Postman
3. **Verify credentials** - ensure username/password đúng
4. **Monitor logs**: `docker logs app-server-1 -f`

---

## 📝 Valid Postman Request Example

**Endpoint:** `POST http://localhost:5000/api/settings/test-tpbank`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "your_tpbank_username",
  "password": "your_tpbank_password",
  "deviceId": "FRESH_DEVICE_ID_FROM_BROWSER"
}
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Connection Successful! Authenticated with TPBank."
}
```
