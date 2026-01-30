# Visual Script Builder Implementation Plan

## Goal Description
Implement a new section in `Landing.tsx` that showcases the "Visual Script Builder" interface, mimicking the node-based UI provided in the reference image. This will demonstrate the "No-Code" automation capabilities.

## User Review Required
> [!NOTE]
> This section will be purely visual (mockup) and not functional.

## Proposed Changes

### [NEW] [components/ScriptBuilderSection.tsx](file:///c:/Users/Adonis/Downloads/landing-page---v3/components/ScriptBuilderSection.tsx)
- **Structure**: A full-width section with a "canvas" background (grid).
- **Nodes**:
  - `StartNode` (Green Circle)
  - `ActionNode` (Blue Rectangle with input/output dots) - Variations: Open URL, Click, Type Text, etc.
  - `LogicNode` (Orange/Green Rects) - Variables, If, Javascript.
- **Animation**:
  - Nodes float slightly.
  - Connection lines (SVG) animate/pulse.
  - "Cursor" or "Active State" simulation to show flow execution.

### [MODIFY] [components/ScriptBuilderSection.tsx](file:///c:/Users/Adonis/Downloads/landing-page---v3/components/ScriptBuilderSection.tsx)
- **Refinement**:
  - Update Node colors to match RPA reference (Start: Green, Action: Blue, Stop: Red).
  - Update Connection styles (Bezier curves, Cyan/Light Gray).
  - Enhance "If" node with distinct True/False ports.
  - Position "Variables" button in corner.

### [MODIFY] [Landing.tsx](file:///c:/Users/Adonis/Downloads/landing-page---v3/Landing.tsx)
- Import `ScriptBuilderSection`.
- Insert it **after** `<PartnersTicker />` and **before** `<Features />`.

## Verification Plan

### Manual Verification
- **Visual Check**: Verify the node graph looks like the reference image.
- **Responsiveness**: Ensure the diagram scales or scrolls on mobile (likely scrollable container).
- **Animation**: Verify the "flow" animation works smoothly.

## Admin Dashboard Redesign
### [MODIFY] [AdminDashboard.tsx](file:///c:/Users/Adonis/Downloads/landing-page---v3/AdminDashboard.tsx)
- **Theme Conversion**: Light Mode (`bg-white`) -> Dark Mode (`bg-slate-900/50`).
- **Glassmorphism**: Add `backdrop-blur-xl`, `border-white/10`.
- **Typography**: `text-brand-dark` -> `text-white`, `text-slate-500` -> `text-slate-400`.
- **Components**:
  - `AdminOverview`: Stats cards with glowing gradients.
  - `AdminProducts`: Dark table with hover effects.
  - `KeyManagement`: Amber glowing glass cards.
  - `Modals`: Dark glass overlays and content.

