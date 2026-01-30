# Implementation Plan - Binance Pay Auto-Integration

## Goal Description
Integrate Binance Pay API to allow "Auto Payment" for crypto transactions. 
- **Flow**: User selects "Binance Pay (Auto)" -> System generates Dynamic QR Code from Binance -> User scans -> System polls for status -> Success.
- **Backup**: "Crypto (Manual)" remains available.
- **Constraint**: Localhost environment uses Polling instead of Webhooks.

## User Review Required
> [!NOTE]
> We will use **Polling** (checking status every 5 seconds) as the primary verification method for now since localhost cannot receive Webhooks.

## Proposed Changes

### Backend (`server/`)

#### [MODIFY] [binancePay.js](file:///c:/Users/Adonis/Downloads/App/server/utils/binancePay.js)
- Add `queryOrder(apiKey, secretKey, merchantTradeNo)` method to fetch real-time status from Binance.

#### [NEW] [payment.js](file:///c:/Users/Adonis/Downloads/App/server/routes/payment.js)
- `POST /api/payment/binance/create`: 
    - validation
    - `binancePay.createOrder`
    - return `universalUrl`, `qrCodeUrl`, `prepayId`.
- `GET /api/payment/binance/query/:orderId`:
    - `binancePay.queryOrder`
    - return status (`PAID`, `PENDING`).

#### [MODIFY] [index.js](file:///c:/Users/Adonis/Downloads/App/server/index.js)
- Mount `app.use('/api/payment', require('./routes/payment'));`

### Frontend (`src/`)

#### [MODIFY] [Checkout.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/Checkout.tsx)
- Update `PaymentMethod` type to include `'BINANCE_PAY'`.
- Add a new payment selection button for **Binance Pay (Auto)**.
- Implement the Auto-Pay Logic:
    - Call `create` endpoint on selection.
    - Display QR using `qrcode.react` (using `qrCodeLink` from API) or display the image returned by Binance.
    - `setInterval` to poll status.
    - On `PAID`, redirect to `/order-success`.

## Verification Plan

### Automated Tests
- N/A (Manual integration test required).

### Manual Verification
1.  **Configuration**: Ensure Binance Keys are set in Admin Dashboard.
2.  **Checkout Flow**: 
    - Select "Binance Pay".
    - Verify QR Code appears (Dynamic).
    - Scan with Test App or Real App (Small amount).
    - Verify "Success" screen appears automatically within 5-10s.
