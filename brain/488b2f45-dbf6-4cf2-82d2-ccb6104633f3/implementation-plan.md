# Coupon/Discount System - Implementation Plan

## Goal

Implement complete **Coupon/Discount System** để:
1. Admin create promotional codes (percentage/fixed amount discounts)
2. Users apply coupons at checkout
3. Automatic discount calculation
4. Usage tracking (max uses, per-user limits)
5. Expiration handling
6. Campaign management

## User Review Required

> [!IMPORTANT]
> **Coupon Stacking**: Current plan does NOT support multiple coupons per order. Users can apply 1 coupon only.

> [!WARNING]
> **Minimum Order Value**: Coupons có thể có minimum order requirement (e.g., "$10 off for orders $50+"). Free orders (100% discount) sẽ cần special handling.

## Proposed Changes

### Backend Changes

#### 1. [NEW] [Coupon.js](file:///c:/Users/Adonis/Downloads/App/server/models/Coupon.js)

**Create Model:**
```javascript
const CouponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true,
        uppercase: true,
        trim: true
    },
    description: { type: String },
    type: { 
        type: String, 
        enum: ['percentage', 'fixed'], 
        required: true 
    },
    value: { 
        type: Number, 
        required: true,
        min: 0 
    },
    minOrderValue: { 
        type: Number, 
        default: 0 
    },
    maxDiscount: { 
        type: Number // For percentage coupons
    },
    usageLimit: { 
        type: Number, 
        default: null // null = unlimited
    },
    usedCount: { 
        type: Number, 
        default: 0 
    },
    perUserLimit: { 
        type: Number, 
        default: 1 
    },
    validFrom: { 
        type: Date, 
        default: Date.now 
    },
    validUntil: { 
        type: Date 
    },
    applicableProducts: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }], // Empty = all products
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdAt: { type: Date, default: Date.now }
});
```

**Validation Examples:**
- `SAVE20` = 20% off
- `WELCOME10` = $10 fixed discount
- `FLASH50` = 50% off, max $100 discount
- `NEWYEAR2026` = $50 off for orders $200+

---

#### 2. [NEW] [CouponUsage.js](file:///c:/Users/Adonis/Downloads/App/server/models/CouponUsage.js)

**Track Coupon Usage:**
```javascript
const CouponUsageSchema = new mongoose.Schema({
    couponId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Coupon', 
        required: true,
        index: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true 
    },
    discountAmount: { 
        type: Number, 
        required: true 
    },
    usedAt: { type: Date, default: Date.now }
});

// Compound index for per-user limit checks
CouponUsageSchema.index({ couponId: 1, userId: 1 });
```

---

#### 3. [MODIFY] [Order.js](file:///c:/Users/Adonis/Downloads/App/server/models/Order.js)

**Add Fields:**
```javascript
couponCode: { type: String },
discountAmount: { type: Number, default: 0 },
finalAmount: { type: Number } // amount after discount
```

---

#### 4. [NEW] [coupons.js](file:///c:/Users/Adonis/Downloads/App/server/routes/coupons.js)

**Create Routes:**

**a) POST /api/coupons/validate** (User)
```javascript
// Validate coupon code for checkout
// Input: { code, productId, orderAmount }
// Returns: { valid: true, discount: 20, finalAmount: 80 }
```

**b) POST /api/coupons** (Admin)
```javascript
// Create new coupon
// Input: { code, type, value, validUntil, ... }
```

**c) GET /api/coupons** (Admin)
```javascript
// List all coupons với filters
// Filters: isActive, type, validUntil
```

**d) PUT /api/coupons/:id** (Admin)
```javascript
// Update coupon (edit value, expiry, etc.)
```

**e) DELETE /api/coupons/:id** (Admin)
```javascript
// Soft delete (set isActive=false)
```

**f) GET /api/coupons/:id/usage** (Admin)
```javascript
// Get usage statistics
// Returns: { usedCount, users, totalDiscount }
```

---

#### 5. [MODIFY] [orders.js](file:///c:/Users/Adonis/Downloads/App/server/routes/orders.js)

**Update Order Creation:**

**In `POST /api/orders` và `POST /api/orders/checkout-with-balance`:**
```javascript
// Add coupon validation
if (req.body.couponCode) {
    const validation = await validateAndApplyCoupon(
        req.body.couponCode, 
        req.user.id, 
        productId, 
        orderAmount
    );
    
    if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
    }
    
    order.couponCode = validation.code;
    order.discountAmount = validation.discount;
    order.finalAmount = validation.finalAmount;
    order.amount = validation.finalAmount; // Update amount
    
    // Create usage record
    await CouponUsage.create({
        couponId: validation.couponId,
        userId: req.user.id,
        orderId: order._id,
        discountAmount: validation.discount
    });
    
    // Increment usage count
    await Coupon.findByIdAndUpdate(validation.couponId, {
        $inc: { usedCount: 1 }
    });
}
```

**Helper Function:**
```javascript
async function validateAndApplyCoupon(code, userId, productId, orderAmount) {
    const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isActive: true 
    });
    
    if (!coupon) {
        return { valid: false, error: 'Invalid coupon code' };
    }
    
    // Check expiry
    const now = new Date();
    if (coupon.validFrom > now || (coupon.validUntil && coupon.validUntil < now)) {
        return { valid: false, error: 'Coupon has expired' };
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, error: 'Coupon usage limit reached' };
    }
    
    // Check per-user limit
    const userUsageCount = await CouponUsage.countDocuments({
        couponId: coupon._id,
        userId
    });
    
    if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
        return { valid: false, error: 'You have already used this coupon' };
    }
    
    // Check minimum order value
    if (orderAmount < coupon.minOrderValue) {
        return { valid: false, error: `Minimum order value is $${coupon.minOrderValue}` };
    }
    
    // Check applicable products
    if (coupon.applicableProducts.length > 0) {
        if (!coupon.applicableProducts.includes(productId)) {
            return { valid: false, error: 'Coupon not applicable to this product' };
        }
    }
    
    // Calculate discount
    let discount;
    if (coupon.type === 'percentage') {
        discount = (orderAmount * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    } else {
        discount = coupon.value;
    }
    
    // Ensure discount doesn't exceed order amount
    if (discount > orderAmount) {
        discount = orderAmount;
    }
    
    const finalAmount = orderAmount - discount;
    
    return {
        valid: true,
        couponId: coupon._id,
        code: coupon.code,
        discount,
        finalAmount
    };
}
```

---

### Frontend Changes

#### 6. [MODIFY] [Checkout.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/Checkout.tsx)

**Add Coupon Input:**
```typescript
const CouponInput = ({ orderAmount, onApply }) => {
    const [code, setCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [error, setError] = useState('');
    
    const handleApply = async () => {
        setValidating(true);
        setError('');
        
        const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code, orderAmount, productId })
        });
        
        const data = await res.json();
        
        if (data.valid) {
            setAppliedCoupon(data);
            onApply(data);
        } else {
            setError(data.error);
        }
        
        setValidating(false);
    };
    
    return (
        <div className="coupon-section">
            {!appliedCoupon ? (
                <div className="input-group">
                    <input 
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                    />
                    <button onClick={handleApply} disabled={validating}>
                        Apply
                    </button>
                </div>
            ) : (
                <div className="applied-coupon">
                    ✓ {appliedCoupon.code} applied! -${appliedCoupon.discount}
                    <button onClick={() => { setAppliedCoupon(null); onApply(null); }}>
                        Remove
                    </button>
                </div>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

// Usage in Checkout
<div className="order-summary">
    <div>Subtotal: ${product.price}</div>
    <CouponInput orderAmount={product.price} onApply={handleCouponApply} />
    {discount > 0 && <div className="discount">Discount: -${discount}</div>}
    <div className="total">Total: ${finalAmount}</div>
</div>
```

---

#### 7. [MODIFY] [AdminDashboard.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/AdminDashboard.tsx)

**Add "Coupons" Tab:**

**CouponManagement Component:**
```typescript
const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // List coupons với filters
    // Create/Edit/Disable buttons
    // Usage statistics
};

const CreateCouponModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: 0,
        minOrderValue: 0,
        maxDiscount: null,
        usageLimit: null,
        perUserLimit: 1,
        validUntil: '',
        applicableProducts: []
    });
    
    const handleSubmit = async () => {
        await fetch('/api/coupons', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        onSuccess();
    };
    
    // Form UI: code input, type selector, value, limits, expiry date picker
};
```

---

## Verification Plan

### Manual Testing

**Test Script:** `test-coupon-system.ps1`

**Scenario 1: Create Coupon**
```powershell
# Admin creates percentage coupon
POST /api/coupons
Body: {
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "validUntil": "2026-12-31"
}

# Expected: Coupon created
```

**Scenario 2: Apply Valid Coupon**
```powershell
# User at checkout
POST /api/coupons/validate
Body: {
  "code": "SAVE20",
  "orderAmount": 100,
  "productId": "abc123"
}

# Expected: { valid: true, discount: 20, finalAmount: 80 }

# Create order với coupon
POST /api/orders
Body: {
  "product": "GPM Login",
  "amount": 100,
  "couponCode": "SAVE20"
}

# Expected: Order created với finalAmount=80
```

**Scenario 3: Expired Coupon**
```powershell
# Coupon validUntil = yesterday
POST /api/coupons/validate
Body: { "code": "EXPIRED20", ... }

# Expected: { valid: false, error: "Coupon has expired" }
```

**Scenario 4: Usage Limit**
```powershell
# Coupon usageLimit = 10, usedCount = 10
# User tries to apply
# Expected: Error "Coupon usage limit reached"
```

**Scenario 5: Per-User Limit**
```powershell
# Coupon perUserLimit = 1
# User đã dùng 1 lần
# User tries again
# Expected: Error "You have already used this coupon"
```

---

## Database Schema Changes

**New Models:**
- Coupon (code, type, value, limits, expiry)
- CouponUsage (track usage)

**Modified Models:**
- Order (add couponCode, discountAmount, finalAmount)

---

## Implementation Order

1. **Backend Foundation** (Day 1)
   - Create Coupon model
   - Create CouponUsage model
   - Update Order model
   - Create /api/coupons routes

2. **Validation Logic** (Day 1-2)
   - validateAndApplyCoupon function
   - All validation rules
   - Usage tracking

3. **Checkout Integration** (Day 2)
   - Update order creation endpoints
   - Apply discount calculation
   - Create usage records

4. **Admin Coupon Management** (Day 2-3)
   - CouponManagement component
   - CreateCouponModal
   - List/Edit/Disable UI

5. **User Checkout UI** (Day 3)
   - CouponInput component
   - Discount display
   - Error handling

6. **Testing & Polish** (Day 3)
   - Manual test script
   - Edge cases
   - UI polish

---

## Security Considerations

1. **Coupon Code Generation:**
   - Use uppercase and alphanumeric only
   - Recommend random codes for security (avoid predictable patterns)

2. **Race Conditions:**
   - Use atomic operations for usage count increment
   - Consider using transactions for order + usage creation

3. **Validation Placement:**
   - Validate on both frontend (UX) và backend (security)
   - Never trust client-side discount calculations

4. **Fraud Prevention:**
   - Per-user limits prevent abuse
   - Usage tracking for audit trail

---

## File Summary

**Created:** 3 files
- `server/models/Coupon.js` - Coupon model
- `server/models/CouponUsage.js` - Usage tracking
- `server/routes/coupons.js` - Coupon routes

**Modified:** 3 files
- `server/models/Order.js` - Add coupon fields
- `server/routes/orders.js` - Integrate coupon validation
- `src/pages/Checkout.tsx` - Add coupon input
- `src/pages/AdminDashboard.tsx` - Add Coupons tab

**Total Code Changes:** ~500-600 lines

---

## Known Limitations

1. **No Coupon Stacking**: One coupon per order
2. **No Auto-Apply**: Users must manually enter code
3. **No Gift Cards**: Separate from coupon system
4. **Basic Analytics**: Simple usage count only

---

## Future Enhancements

- Auto-apply best coupon at checkout
- Coupon stacking rules (e.g., 1 brand + 1 seasonal)
- Gift card/store credit system
- Advanced analytics (ROI, conversion rate)
- Referral codes (give referrer + referee discounts)
- Time-based coupons (flash sales, happy hour)
- Tiered discounts (spend $100 get 10%, $200 get 20%)

---

*Plan created: 2026-01-25*
