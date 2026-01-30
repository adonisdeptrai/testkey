# Implementation Plan - Dashboard API Connection

## Goal
Connect `UserDashboard.tsx` to the backend API to display real orders and assets instead of mock data.

## Proposed Changes

### Backend (`server/routes/orders.js`)
1.  **Add Endpoint**: `GET /my-orders`
    *   Protected route (verify token).
    *   Fetch orders where `user: req.user.id` (or username, matching the schema).
    *   **Note**: Current schema uses `user` string field in `seed.js` ("Alex_T88"), but `Order` model should ideally link to `User` ObjectId.
    *   *Correction*: `Order` model in `seed.js` uses strings. I should check `models/Order.js` to see the actual schema. If it's a string, I'll filter by the username from the token.

### Frontend (`src/pages/UserDashboard.tsx`)
1.  **Fetch Data**: Use `useEffect` to fetch `/api/orders/my-orders`.
2.  **State Management**: Replace `RECENT_ORDERS` constant with `orders` state.
3.  **Asset Logic**:
    *   Currently `MY_ASSETS` is hardcoded.
    *   Logic: Derive assets from `orders`. If user bought "GenLogin Auto-Farmer", show it in "My Assets".
    *   *Constraint*: This requires mapping product titles to asset types (Script/Course/Key). I will add a helper function to `UserDashboard.tsx` to transform `Order` items into `Asset` objects.

## Verification Plan

### Automated
1.  **Backend Test**: Use `curl` (via Node script) to hit `/api/orders/my-orders` with a valid user token and verify it returns an empty list (or seeded orders if matched).

### Manual
1.  **Browser**: Log in as `audituser`.
2.  **Purchase**: Buy an item in the Shop.
3.  **Dashboard**: Verify the new item appears in "Recent Activity" and "My Assets".
