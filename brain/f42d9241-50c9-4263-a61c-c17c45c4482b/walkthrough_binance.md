# Binance Pay Integration Walkthrough

This guide explains the new Binance Pay "Auto Payment" feature.

## Feature Overview

1.  **Auto-generated QR**: Uses Binance Pay API to generate a dynamic QR code for each order.
2.  **Auto-Confirmation**: System polls Binance every 5 seconds to check payment status.
3.  **No Manual Upload**: Users scan and pay; the system handles the rest.

## How to Test (Localhost)

1.  **Configure API Keys**:
    *   Go to Admin Dashboard -> Settings.
    *   Enter your **Binance API Key** and **Secret Key**.
    *   Save.

2.  **Checkout Flow**:
    *   Go to Shop -> Add Item -> Checkout.
    *   Select **Binance Pay** (Yellow Icon).
    *   Wait for QR Code to generate.
    *   **Simulate Payment**: Since this is a test environment, you can't actually pay with real Mainnet funds easily without a Merchant account.
    *   *Note: If you have a real Binance Merchant account, scanning this QR with the Binance App will work and complete the order automatically.*

3.  **Verification**:
    *   The system actively checks status.
    *   In `binancePay.js` logs, you'll see "Order Status: PENDING" until paid.

## Troubleshooting

- **Error: Binance Pay not configured**: Ensure you added keys in Admin Dashboard.
- **Error: Signature Invalid**: Check API Secret is correct (no extra spaces).
- **Polling Timeout**: The system stops checking after 15 minutes.
