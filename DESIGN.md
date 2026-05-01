# Fluent Core AI - Design System

## Typography
- **Headlines / Display**: Noto Serif
- **Body**: Plus Jakarta Sans
- **Labels**: Plus Jakarta Sans

## Core Settings
- **Color Mode**: LIGHT
- **Roundness**: ROUND_FULL
- **Primary Color (Custom)**: `#7c3aed` (Purple)

## Color Palette Tokens (Hex)
| Token | Hex Code |
|-------|----------|
| `primary` | `#630ed4` |
| `primary_container` | `#7c3aed` |
| `primary_fixed` | `#eaddff` |
| `primary_fixed_dim` | `#d2bbff` |
| `on_primary` | `#ffffff` |
| `on_primary_container` | `#ede0ff` |
| `secondary` | `#5f5e5e` |
| `secondary_container` | `#e2dfde` |
| `secondary_fixed` | `#e5e2e1` |
| `background` | `#f9f9f9` |
| `surface` | `#f9f9f9` |
| `surface_bright` | `#f9f9f9` |
| `surface_container` | `#eeeeee` |
| `surface_container_highest` | `#e2e2e2` |
| `surface_container_high` | `#e8e8e8` |
| `surface_container_low` | `#f3f3f3` |
| `surface_container_lowest` | `#ffffff` |
| `surface_dim` | `#dadada` |
| `on_background` | `#1a1c1c` |
| `on_surface` | `#1a1c1c` |
| `on_surface_variant` | `#4a4455` |
| `outline` | `#7b7487` |
| `outline_variant` | `#ccc3d8` |
| `error` | `#ba1a1a` |
| `error_container` | `#ffdad6` |

---

# The Editorial Scholar (Original Design Markdown)

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**

This design system moves away from the "utility-first" appearance of standard e-learning platforms. It is built to feel like a high-end digital monograph or a curated gallery. By combining the prestige of traditional editorial design (bold serifs and generous margins) with cutting-edge digital techniques (glassmorphism and organic motion), we create an immersive environment where the content is the masterpiece.

The system breaks the "template" look by favoring **intentional asymmetry** and **tonal depth** over rigid grids. We don't just present information; we curate a learning journey that feels premium, fluid, and profoundly intentional.

---

## 2. Colors & Surface Philosophy
The palette is a study in high-contrast sophistication. We use a deep "Deep Charcoal" (#1A1A1A) against "Alabaster" (#F8F8F8) to create a canvas that feels like expensive stationery.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Traditional lines create visual noise and "box in" the learner. Instead:
*   **Background Shifts:** Define boundaries by placing a `surface-container-low` section against a `surface` background.
*   **Negative Space:** Use the Spacing Scale to create "gutters" of white space that act as invisible dividers.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper or frosted glass.
*   **Base:** `surface` (#F9F9F9) for the primary canvas.
*   **Sections:** Use `surface-container-low` (#F3F3F3) to block out large content areas.
*   **Interactive Elements:** Nest `surface-container-lowest` (#FFFFFF) cards within these sections to create a natural, soft "lift."

### The Glass & Gradient Rule
To achieve the Cuberto-inspired immersive feel:
*   **Glassmorphism:** Use `surface` colors at 70-80% opacity with a `24px` backdrop-blur for floating navigation or overlays.
*   **Signature Textures:** Main CTAs should utilize a subtle linear gradient from `primary` (#630ED4) to `primary-container` (#7C3AED) at a 135-degree angle. This provides a tactile "glow" that flat colors lack.

---

## 3. Typography
The typography is the voice of the system: an authoritative Serif for storytelling and a precision Sans-Serif for instruction.

*   **Display & Headlines (Noto Serif):** These are the "Editorial" anchors. Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to create a bold, confident presence. Headlines should often be center-aligned or dramatically offset to break the grid.
*   **Body & UI (Plus Jakarta Sans):** The workhorse. This modern sans-serif provides exceptional legibility. Use `body-lg` for primary instructional content and `label-md` for metadata.
*   **Hierarchy Tip:** Never pair a large Serif headline with a large Sans-Serif subhead. Let the Serif lead the narrative, and the Sans-Serif support the functional details.

---

## 4. Elevation & Depth
We eschew the "material" shadow approach in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card sitting on a `surface-container-low` background creates a "Ghost Lift"—visible but effortless.
*   **Ambient Shadows:** When a card must float (e.g., during a drag-and-drop interaction), use a shadow with a `64px` blur, 0px offset, and 6% opacity of the `on-surface` color (#1A1C1C). It should look like a soft glow, not a drop shadow.
*   **The "Ghost Border" Fallback:** If a layout requires a container for accessibility (e.g., in Dark Mode), use the `outline-variant` token at **15% opacity**. This provides a hint of structure without breaking the minimal aesthetic.

---

## 5. Components

### Cards (The Primary Vehicle)
*   **Styling:** Use `rounded-xl` (3rem) or `rounded-lg` (2rem). No borders. Use `surface-container-lowest` for the card body.
*   **Layout:** Generous internal padding (minimum 40px). Content should be staggered—text aligned left, imagery or icons floating or partially overlapping the card edge for an asymmetrical look.

### Buttons
*   **Primary:** Pill-shaped (`rounded-full`), using the signature gradient. Large horizontal padding (32px).
*   **Secondary:** Ghost style. No border. Use `primary` text with a subtle `primary-fixed-dim` background that appears only on hover.
*   **Motion:** On hover, buttons should subtly scale (1.02x) with a fluid `cubic-bezier(0.4, 0, 0.2, 1)` transition.

### Input Fields
*   **Visuals:** Modern "Underline" style or very soft `surface-container-highest` fills. 
*   **Focus State:** Instead of a heavy border, the label should transform and the background should shift to `primary-fixed-dim`.

### Navigation (The Floating Bar)
*   **Design:** A centered, floating pill-shaped bar using the Glassmorphism rule. 
*   **Interaction:** Icons should use "Active State" fills in `Electric Violet` with a small dot indicator below.

### Lists
*   **Constraint:** Forbid the use of divider lines.
*   **Execution:** Use vertical white space (32px+) to separate items. If separation is visually unclear, use alternating tonal shifts (e.g., Item 1: `surface`, Item 2: `surface-container-low`).

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Place a large headline on the left and a small body paragraph on the far right. Let the eye travel.
*   **Embrace White Space:** If a section feels "busy," double the padding. This design system breathes.
*   **Organic Motion:** Every hover and transition should feel like it has weight and inertia—never use "linear" easing.

### Don't:
*   **Don't Use Borders:** Unless it's a "Ghost Border" for accessibility, keep the UI border-free.
*   **Don't Use Pure Grey Shadows:** Shadows must always be tinted with the `on-surface` color to maintain tonal harmony.
*   **Don't Cram Content:** This is an editorial experience. If you can't fit it on one screen, create a fluid scroll or a multi-step immersive transition.
*   **Don't Use Sharp Corners:** Every interaction point should feel soft and approachable; keep radius values high (`lg` to `xl`).
