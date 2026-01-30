# MMO Liquid Glass Frontend Implementation Plan (No-Build)

Goal: Create a modern, visually stunning Frontend for an MMO App featuring a "Liquid Glass" theme and demo products, using standard web technologies (no build tools required).

## Proposed Changes

### Project Structure
- Directory: `C:\Users\Adonis\.gemini\antigravity\scratch\mmo-liquid-glass`
- **Core Files**:
    - `index.html`: Main entry point with semantic structure.
    - `style.css`: All styles including the Liquid Glass system and animations.
    - `app.js`: Interactivity, data for demo products, and dynamic rendering.

### Design System: "Liquid Glass"
- **Background**: CSS-based moving mesh gradients (using absolute positioned blobs with CSS animations).
- **Glass Effect**:
    - `backdrop-filter: blur(16px)`
    - `background: rgba(255, 255, 255, 0.05)` (High transparency)
    - `border: 1px solid rgba(255, 255, 255, 0.15)`
    - **Highlight**: `box-shadow: inset 0 0 20px rgba(255,255,255,0.05)`
- **Typography**: 'Outfit' or 'Inter' via Google Fonts CDN.
- **Theme**: Dark, cosmic/mystical vibe (Deep blues, purples, cyans).

### Content Structure (Demo Product)
1.  **UI Shell**:
    - Sticky unique Glass Sidebar/Nav.
    - Floating User Status panel.
2.  **Hero Area**: "Season of Reflections" banner with parallax effect.
3.  **Store/Inventory Grid**:
    - **JS Driven**: Array of item objects (Name, Rarity, ImageUrl, Price).
    - **Cards**: 3D tilt effect on hover.

### Mobile Optimization (New)
- **Layout**: Switch `app-layout` from `flex-row` to `flex-column` on screens < 768px.
- **Navigation**: 
    - Convert Sidebar to a **fixed bottom navigation bar** for easier thumb access.
    - Hide Logo and Profile in the bottom bar, move Profile to top right header.
- **Hero**: Reduce font sizes (`4rem` -> `2.5rem`) and stack text/visuals.
- **Grid**: Force 1 column for product cards.

## Verification Plan

### Manual
- Open `index.html` in browser.
- Verify:
    - Animations play smoothly.
    - Glass effect blurs background effectively.
    - Hover states work on items.
    - Responsiveness (mobile/desktop).
