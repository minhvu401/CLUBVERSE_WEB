```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Obsidian Academy"
This design system moves away from the sterile, utilitarian nature of traditional administrative tools. The Creative North Star is **"The Digital Observatory."** It envisions the university’s data not as a spreadsheet, but as a celestial map—vast, deep, and illuminated by points of vital intelligence.

By leveraging intentional asymmetry, cinematic lighting, and deep tonal layering, we transform "admin work" into an avant-garde experience. We break the grid by allowing glass containers to overlap and using "light leaks" (subtle neon glows) to guide the eye toward critical actions, ensuring the interface feels like a high-end, bespoke command center rather than a generic template.

## 2. Colors & Surface Architecture
The palette is built on a foundation of "Obsidian Depth." We do not use "Grey." We use filtered blacks and indigos to maintain a mystical, cinematic atmosphere.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for defining sections. Boundaries must be felt, not seen. Use background shifts between `surface-container-low` and `surface-container-high` to denote changes in context. If a visual break is required, use a `3.5` (1.2rem) vertical gap from the spacing scale to let the background breathe.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of frosted obsidian sheets.
*   **Base Layer:** `surface` (#131319) — The infinite void.
*   **Section Layer:** `surface-container-low` (#1b1b22) — Large structural areas.
*   **Card Layer:** `surface-container` (#1f1f26) — The primary interaction zone.
*   **Elevated/Active Layer:** `surface-container-highest` (#35343b) — Used for active states or floating modals.

### The "Glass & Glow" Rule
To achieve the "mystical" vibe, any element that floats (modals, dropdowns, hovered cards) must use **Glassmorphism**:
*   **Fill:** `surface-variant` (#35343b) at 60% opacity.
*   **Backdrop Blur:** 20px to 40px.
*   **Edge:** A "Ghost Border" using `outline-variant` (#494456) at 15% opacity.
*   **The Signature Glow:** Use `primary` (Electric Violet) or `secondary` (Neon Cyan) for a 20px outer blur with 10% opacity to create a "subtle crimson or violet heat" behind high-priority data points.

## 3. Typography: Sophisticated Authority
We pair **Manrope** for high-impact displays with **Inter** for dense administrative data. The high contrast between the `on-surface` (#e4e1ea) text and the obsidian background ensures elite readability.

*   **Display (Manrope):** Use `display-lg` for hero stats (e.g., total enrollment). It should feel editorial—large, bold, and authoritative.
*   **Headlines (Manrope):** `headline-md` is the standard for dashboard widgets. Use wide letter-spacing (-0.02em) for a high-tech feel.
*   **Body & Labels (Inter):** All functional data uses Inter. `body-md` is your workhorse. `label-sm` should be used for metadata, often in `on-surface-variant` (#cbc3d9) to create a clear hierarchy.

## 4. Elevation & Depth
In this system, depth is a product of light and transparency, not shadows.

*   **Layering Principle:** Instead of shadows, nest a `surface-container-lowest` card inside a `surface-container-high` section. This creates a "recessed" look that feels integrated into the dashboard’s "glass" engine.
*   **Ambient Shadows:** Where a shadow is unavoidable (e.g., a floating Action Button), use a tinted shadow: `rgba(109, 59, 215, 0.15)` (a primary-tinted shadow) with a 40px blur. Never use pure black shadows.
*   **Ghost Borders:** For accessibility in input fields, use `outline-variant` at 20% opacity. This provides a "whisper" of a boundary that disappears into the cinematic aesthetic.

## 5. Components

### Buttons
*   **Primary:** A gradient fill from `primary` (#d0bcff) to `primary-container` (#622ccc). Roundness: `full`. Text should be `on-primary-fixed` (#23005c) for maximum punch.
*   **Secondary (Neon Cyan):** No fill. A 1px "Ghost Border" using `secondary` (#4cd7f6) at 40% opacity. On hover, the border goes to 100% and a subtle `secondary` glow appears behind the button.
*   **Tertiary:** Text-only using `on-surface-variant`. No background.

### Cards & Data Lists
*   **Forbid Dividers:** Do not use lines between list items. Use a background shift of `surface-container-low` on hover, or a `1.5` (0.5rem) spacing gap between items.
*   **Roundness:** All cards must use `lg` (2rem) corner radius. This creates the "premium, smooth" feel of high-end hardware.

### Input Fields
*   **Styling:** Fields should be `surface-container-lowest` (#0e0e14) with a `sm` (0.5rem) radius.
*   **Focus State:** The border transitions to `secondary` (Neon Cyan) with a 4px soft glow. The label moves to `title-sm` typography.

### Academic Glow-Chips
*   Used for status (e.g., "Active Semester").
*   A semi-transparent background of the status color (e.g., `tertiary_container` for alerts) with a high-saturation `on-tertiary-container` text.

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Let a "Featured Research" card take up 65% of the width, leaving 35% for a "Global Alerts" column.
*   **Use Neon Accents Sparingly:** A single `neon cyan` spark in a sea of `midnight black` is more powerful than a screen full of bright colors.
*   **Think in Layers:** Always ask, "Is this element sitting *on* the glass or *under* it?"

### Don't:
*   **Don't use pure #000000:** It kills the cinematic "mist" effect. Always use the `surface` tokens.
*   **Don't use sharp corners:** Anything less than `DEFAULT` (1rem) radius will break the "premium" avant-garde vibe.
*   **Don't use high-opacity borders:** This is a "No-Line" system. If you can see the line clearly from a distance, it's too heavy. Reduce opacity to 10-20%.
*   **Don't crowd the UI:** Use the spacing scale aggressively. High-end design requires the "luxury of space."```