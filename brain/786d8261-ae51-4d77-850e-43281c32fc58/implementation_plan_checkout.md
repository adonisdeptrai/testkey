# Implementation Plan - Integrate Checkout API

## Goal
Replace the mock checkout process in `Checkout.tsx` with a real API call to `POST /api/orders` to persist orders in the database.

## Proposed Changes

### Frontend (`src/pages/Checkout.tsx`)
1.  **State Management**: Add `loading` and `error` states.
2.  **API Call**: Inside `handleConfirmPayment`:
    *   Construct the payload:
        ```json
        {
          "user": "current_username", // From auth context or token
          "product": "Item Titles...", // Join item titles for now (Backend schema limit)
          "amount": total,
          "status": "Pending Verification", // Default for crypto/bank
          "method": paymentMethod
        }
        ```
    *   **Note**: The backend `Order` schema defines `product` as a String (singular). Since the cart can have multiple items, I will join their titles with a comma for now. Ideally, the backend should accept an array of items, but I must adhere to "No backend refactor unless necessary" rules or minimum changes. The `seed.js` examples show single products.
    *   *Correction*: The `OrderSchema` in `models/Order.js` has `product: { type: String }`.
    *   *Constraint*: To support multiple items without changing schema, I will join titles: `Item A, Item B`.
3.  **Auth Handling**: Retrieve `token` from `localStorage` and decode `user` (or store username in localStorage upon login).
    *   *Check*: `Login.tsx` stores `token` and `user` object? I need to verify `Login.tsx`.

### Verification Plan

### Automated
1.  **Browser Test**:
    *   Login as `testuser`.
    *   Add items to cart.
    *   Go to Checkout.
    *   Click "Confirm Payment".
    *   Verify "Order Confirmed" screen.
    *   Go to Dashboard.
    *   Verify new order appears with correct Total and Items.

### Manual
1.  User can perform the same flow.
