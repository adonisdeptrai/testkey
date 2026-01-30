# Crypto Configuration Refactor Walkthrough

This walkthrough explains the changes made to the Crypto Configuration system, allowing for manual QR code uploads per network, multiple network management, and improved checkout experience.

## key Changes

### 1. Multi-Network Support
- **Admin Dashboard**: You can now configure multiple crypto networks (e.g., TRC20, BEP20, ERC20) instead of a single global setting.
- **Checkout Page**: Users can select their preferred network from a dropdown list. The wallet address and QR code update dynamically based on the selection.

### 2. Manual QR Code Uploads
- **Upload Feature**: For each network, you can upload a specific QR code image.
- **Display Logic**: 
  - If a **QR Code Image** is uploaded, it takes priority and is displayed to the user.
  - If **no image** is uploaded, the system falls back to generating a standard QR code from the wallet address.
  - If no wallet address is set, a placeholder is shown.

### 3. Removal of Network Fee
- The "Network Fee" field has been removed from the Admin Dashboard and Checkout UI as requested.

## How to Configure (Admin Guide)

1.  **Login** to the Admin Dashboard.
2.  Navigate to **Settings** -> **System Settings**.
3.  Scroll down to **Crypto Configuration**.
4.  **Enable Crypto Payment**: Toggle the switch to enable/disable the entire crypto payment method at checkout.
5.  **Manage Networks**:
    *   **Add Network**: Click the "Add Network" button to create a new configuration.
    *   **Edit Network**:
        *   **Network Name**: Enter the network name (e.g., "USDT - TRC20").
        *   **Currency**: Enter the currency symbol (e.g., "USDT").
        *   **Wallet Address**: Enter your receiving wallet address.
        *   **Enable/Disable**: Toggle individual networks on or off.
    *   **Upload QR Code**: Click the file input (or camera icon) to upload a custom QR code image for that network.
    *   **Remove**: Click the trash icon to delete a network configuration.
6.  Click **Save Changes** at the top top right to apply updates.

## Verification Checklist

- [ ] **Admin Dashboard**: Verify you can add multiple networks and upload images for them.
- [ ] **Checkout**: Verify the network dropdown appears (if >1 network) and the correct QR code/address is shown for each.
- [ ] **Persistence**: Refresh the Admin Dashboard to ensure settings are saved correctly.
