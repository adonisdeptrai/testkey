# Implementation Plan - TPBank Monitor UI

## Goal
Create a dedicated interface in the Admin Panel to monitor the TPBank Background Worker, view logs, and inspect raw transaction history from the bank.

## User Review Required
- **Storage**: Logs will be stored in MongoDB (`SystemLog` collection) to persist across restarts.
- **Access**: Admin only.

## Proposed Changes

### Backend

#### [NEW] [SystemLog.js](file:///c:/Users/Adonis/Downloads/App/server/models/SystemLog.js)
- Schema: `{ type: String, message: String, details: Object, timestamp: Date }`.

#### [MODIFY] [tpbankWorker.js](file:///c:/Users/Adonis/Downloads/App/server/workers/tpbankWorker.js)
- Import `SystemLog`.
- Save "Worker Started", "Match Found", "Error" events to DB.

#### [MODIFY] [settings.js](file:///c:/Users/Adonis/Downloads/App/server/routes/settings.js)
- `GET /api/settings/tpbank-logs` - Fetch recent logs.
- `GET /api/settings/tpbank-history` - Fetch raw history from Bank API.

### Frontend

#### [NEW] [TPBankMonitor.tsx](file:///c:/Users/Adonis/Downloads/App/src/components/admin/TPBankMonitor.tsx)
- UI Component to verify API connection.
- Table to show Transaction History (Amount, Content, Date).
- Log Viewer terminal-like console.

#### [MODIFY] [AdminDashboard.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/AdminDashboard.tsx)
- Add "Bank Monitor" tab.
- Render `TPBankMonitor` component.

## Verification
- Start server.
- Go to Admin > Bank Monitor.
- Click "Check Connection" -> see success.
- Wait for 60s -> see "Worker Running" log appear.
- View History -> see list of transactions.
