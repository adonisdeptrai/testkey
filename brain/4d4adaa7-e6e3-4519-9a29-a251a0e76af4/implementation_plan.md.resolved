# Professional Admin Overview Dashboard - Implementation Plan

## Goal

Upgrade Admin Overview dashboard từ mock data sang real database data với visual charts/diagrams và professional design.

## User Review Required

> [!IMPORTANT]
> **Chart Library:** Sẽ sử dụng **recharts** library cho charts (lightweight, React-friendly). Alternative: Chart.js hoặc Victory nếu user prefer.

> [!IMPORTANT]
> **Stats Endpoint:** Sẽ tạo `/api/stats/overview` để aggregate data từ orders, users collections.

## Proposed Changes

### Backend - Stats API

#### [NEW] [routes/stats.js](file:///c:/Users/Adonis/Downloads/App/server/routes/stats.js)

**Create stats endpoint:**
- `GET /api/stats/overview` - Returns dashboard stats
  - Total revenue (sum of completed orders)
  - Orders by status (pending, completed counts)
  - User count and recent growth
  - Revenue trend (last 7/30 days)
  - Recent transactions

**Response format:**
```javascript
{
  revenue: {
    total: 12459,
    trend: [{ date, amount }], // Last 7 days
    growth: 12 // Percentage
  },
  orders: {
    total: 245,
    pending: 12,
    completed: 220,
    byStatus: { Pending: 12, Completed: 220, ... }
  },
  users: {
    total: 5201,
    growth: 180 // New this month
  },
  recentOrders: [...] // Last 5 orders
}
```

---

### Frontend - Charts & Components

#### [MODIFY] [package.json](file:///c:/Users/Adonis/Downloads/App/package.json)

Add recharts dependency:
```json
"recharts": "^2.10.3"
```

#### [MODIFY] [AdminDashboard.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/AdminDashboard.tsx)

**Replace AdminOverview component (lines 144-270):**

**New Features:**
1. **Stat Cards** với real data
   - Revenue card với growth indicator
   - Orders card với status breakdown
   - Users card với growth trend
   - Trending product

2. **Revenue Chart** (Line/Area Chart)
   - 7-day revenue trend
   - Gradient fill
   - Animated tooltips

3. **Orders Distribution** (Donut Chart)
   - Orders by status
   - Color-coded segments
   - Interactive hover

4. **Recent Transactions Table**
   - Last 5 orders
   - Quick status view
   - User info

**Layout:**
```
┌─────────────────────────────────────────┐
│  Stat Cards (4 columns)                 │
│  Revenue | Orders | Users | Trending    │
└─────────────────────────────────────────┘
┌──────────────────┬──────────────────────┐
│ Revenue Chart    │ Orders Distribution  │
│ (Area Chart)     │ (Donut Chart)        │
└──────────────────┴──────────────────────┘
┌─────────────────────────────────────────┐
│ Recent Transactions Table               │
└─────────────────────────────────────────┘
```

**Implementation Details:**

1. **Fetch Stats on Mount:**
```typescript
React.useEffect(() => {
  fetchStats();
}, []);

const fetchStats = async () => {
  const res = await fetch('/api/stats/overview', { headers });
  const data = await res.json();
  setStats(data);
};
```

2. **Stat Cards with Animation:**
- Counter animation using state increment
- Gradient backgrounds
- Icon với glow effect
- Growth percentage display

3. **Revenue Chart (recharts):**
```typescript
<AreaChart data={stats.revenue.trend}>
  <defs>
    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="amount" stroke="#10b981" fill="url(#colorRevenue)" />
</AreaChart>
```

4. **Orders Donut Chart:**
```typescript
<PieChart>
  <Pie
    data={ordersData}
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={80}
    dataKey="value"
  >
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

---

### Server Entry Point

#### [MODIFY] [index.js](file:///c:/Users/Adonis/Downloads/App/server/index.js)

Mount stats routes:
```javascript
const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);
```

---

## Verification Plan

### Automated Tests

```bash
# Install recharts
npm install recharts

# Rebuild Docker
docker-compose up -d --build
```

### Manual Verification

1. **Stats Endpoint:**
   - Test: `GET /api/stats/overview` with admin token
   - Verify: Returns aggregated data from DB

2. **Dashboard Load:**
   - Navigate to Overview tab
   - Check: Stats cards show real numbers
   - Check: Charts render with data

3. **Responsiveness:**
   - Test on mobile/tablet viewports
   - Check: Charts scale properly
   - Check: Grid layout adapts

4. **Loading States:**
   - Refresh page
   - Check: Loading skeletons show
   - Check: Smooth transition to data

5. **Real-time Updates:**
   - Create new order
   - Check: Stats update on refresh
   - Check: Charts reflect new data
