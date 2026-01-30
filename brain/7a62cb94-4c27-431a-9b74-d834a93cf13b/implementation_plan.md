# Checkout & Order Flow Overhaul Plan

## Goal
Fix UI alignment issues in the product grid, update "Buy Now" behavior to skip cart, redesign the Checkout page to be more professional, and implement a detailed Order Order Confirmation page.

## User Review Required
- **Order Confirmation**: Will include order ID, product list, total, etc. as requested.
- **Buy Now**: Will bypass the cart drawer and go straight to `/checkout`.

## Proposed Changes

### Shop Page (`src/pages/Shop.tsx`)
- **Fix Logic**: Update `ProductDetailModal`'s "Buy Now" button handler.
    - Logic: `addItem(product)` -> `onClose()` -> `onNavigate('checkout')`.
- **Fix UI**: Check `ProductCardMini` for divider alignment. It currently uses a gradient divider. I will ensure it spans the full width or has correct margins.

### Checkout Page (`src/pages/Checkout.tsx`)
#### [MODIFY] [Checkout.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/Checkout.tsx)
- **Redesign**:
    - Use a 2-column layout (Order Summary vs Payment Details).
    - Apply "Dark Liquid Glass" theme (glassmorphism/blur).
    - Improve input field styling.
    - clearly list items with quantities and totals.

### Order Confirmation Page (`src/pages/OrderSuccess.tsx`)
#### [NEW] [OrderSuccess.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/OrderSuccess.tsx)
- **Purpose**: Display after successful checkout.
- **Content**:
    - Order ID (generated or mock).
    - Success Message/Icon.
    - Itemized List (Product, Qty, Price).
    - Total Amount.
    - "Continue Shopping" button.

### Routing (`src/App.tsx`)
- Add route for `/order-success`.

## Verification Plan
1. **Divider**: Visual check on grid view.
2. **Buy Now Link**: Click "Buy Now" -> Verify redirection to Checkout.
3. **Checkout UI**: Verify new design and responsiveness.
4. **Order Flow**: Complete a purchase -> Verify redirection to Order Success -> Verify Order Details.
