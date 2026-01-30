# TPBank API - Postman Collection

## Base Configuration

**Base URL:** `http://localhost:5000`

**Headers Required:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication

### Login (Get Token)

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "mquyendeptrai",
  "password": "mquyendeptrai"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "mquyendeptrai",
    "role": "admin"
  }
}
```

> ⚠️ **Copy the token** from response and use it in `Authorization` header for other requests.

---

## 2. Settings Management

### Get Settings

**Endpoint:** `GET /api/settings`

**Headers:** No auth required (Public)

**Response:**
```json
{
  "_id": "...",
  "bank": {
    "accountNo": "26032004888",
    "accountName": "LE VAN BAO TRONG",
    "bankName": "TPBank",
    "username": "tpbank_username",
    "password": "tpbank_password",
    "deviceId": "device_id_from_browser"
  },
  "exchangeRate": 1000,
  "isAutoCheckEnabled": true
}
```

### Update Settings

**Endpoint:** `PUT /api/settings`

**Headers:** 
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "bank": {
    "accountNo": "26032004888",
    "accountName": "LE VAN BAO TRONG",
    "bankName": "TPBank",
    "username": "your_tpbank_username",
    "password": "your_tpbank_password",
    "deviceId": "your_device_id"
  },
  "exchangeRate": 1000
}
```

**Response:** Updated settings object

---

## 3. TPBank Connection Test

### Test Connection

**Endpoint:** `POST /api/settings/test-tpbank`

**Headers:** 
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "username": "your_tpbank_username",
  "password": "your_tpbank_password",
  "deviceId": "your_device_id"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Connection Successful! Authenticated with TPBank."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials or connection failed"
}
```

---

## 4. TPBank Transaction History

### Get Transaction History

**Endpoint:** `POST /api/settings/tpbank-history`

**Headers:** 
```
Authorization: Bearer <admin_token>
```

**Request Body:** Empty `{}`

**Response:**
```json
[
  {
    "id": "13712911687",
    "arrangementId": "26032004888,VND-1709897676349-...",
    "reference": "065V602240682698",
    "description": "LE VAN BAO TRONG chuyen tien FT24068710833711",
    "bookingDate": "2024-03-08",
    "valueDate": "2024-03-08",
    "amount": "2000",
    "currency": "VND",
    "creditDebitIndicator": "CRDT",
    "runningBalance": "21000"
  }
]
```

---

## 5. System Logs

### Get TPBank Worker Logs

**Endpoint:** `GET /api/settings/tpbank-logs`

**Headers:** 
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "_id": "...",
    "type": "SUCCESS",
    "message": "Auto-matched Order #123 with TPBank transaction",
    "timestamp": "2024-03-08T10:30:00.000Z",
    "metadata": {
      "orderId": "123",
      "amount": 50000,
      "transactionId": "065V602240682698"
    }
  }
]
```

---

## Quick Test Workflow

### Step 1: Login as Admin
```bash
POST http://localhost:5000/api/auth/login
Body:
{
  "username": "mquyendeptrai",
  "password": "mquyendeptrai"
}
```

### Step 2: Copy Token
Save the token from response.

### Step 3: Test TPBank Connection
```bash
POST http://localhost:5000/api/settings/test-tpbank
Headers:
  Authorization: Bearer <your_token>
Body:
{
  "username": "tpbank_username",
  "password": "tpbank_password",
  "deviceId": "device_id"
}
```

### Step 4: Get Transaction History
```bash
POST http://localhost:5000/api/settings/tpbank-history
Headers:
  Authorization: Bearer <your_token>
Body: {}
```

### Step 5: View System Logs
```bash
GET http://localhost:5000/api/settings/tpbank-logs
Headers:
  Authorization: Bearer <your_token>
```

---

## Notes

> [!IMPORTANT]
> - All admin routes require valid JWT token in `Authorization` header
> - Token expires based on backend configuration (default: 7 days)
> - `deviceId` is obtained from TPBank browser console: `localStorage.deviceId`

> [!TIP]
> Use Postman environment variables:
> - `{{base_url}}`: `http://localhost:5000`
> - `{{admin_token}}`: Your JWT token
> - This allows quick switching between environments

> [!WARNING]
> DO NOT commit real TPBank credentials to version control
