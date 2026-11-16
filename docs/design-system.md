# Pranora Design System Specification

> Systematic foundations, bilingual typography rules, color tokens, and component architecture for the Pranora (প্রাণোরা) ecosystem.

---

## 1. Principles & Voice

1. **Bangla-First Architecture**: Every component, container, and layout is stress-tested in Bangla first. Bangla typography requires ~20–30% more horizontal space and a minimum line-height of `1.65` to avoid clipping diacritics (কার/ফলা).
2. **Dual-Language Parity**: All interactive components must render equally well in Bangla (`bn`) and English (`en`) without layout shift, text truncation, or visual clipping.
3. **High-Trust & Emergency Visibility**: Emergency actions (red) and trust signals (verification badges, licensed vet stamps) have strict, reserved semantic color roles that cannot be overridden by cosmetic styles.
4. **Accessible by Default**: All touch targets meet or exceed 44×44px (with mobile actions targeting 48px). All text-to-background combinations meet WCAG AA standards (≥ 4.5:1 for body copy, ≥ 3.0:1 for large display text and UI controls).
5. **Atmospheric Depth**: Light mode is crisp, warm, and inviting with white cards on subtle tinted green backgrounds. Dark mode features a deep forest-green ambience with translucent glassmorphic surfaces (`backdrop-blur`).

---

## 2. Token Taxonomy & Standards

All design tokens follow the **W3C Community Group Design Tokens** specification format (`tokens.json`), making them directly importable into Figma via Tokens Studio, Style Dictionary, and Tailwind CSS.

### 2.1 Colors

#### Brand Green Palette
Pranora uses a 10-step primary green scale derived from nature and medical care:

| Token | Hex Value | Semantic Role | WCAG AA Ratio (on white) |
|---|---|---|---|
| `green-50` | `#E1F3E1` | Surface tint, active pill background, informational highlights | ~1.2:1 (background role) |
| `green-100` | `#B8E6B5` | Interactive hover surfaces, subtle progress track | ~1.4:1 (surface role) |
| `green-200` | `#8CD2A3` | Card borders, secondary outlines | ~1.9:1 (border role) |
| `green-300` | `#6BBF8B` | Decorative map clusters, illustrative accents | ~2.7:1 (non-text role) |
| `green-400` | `#4BA772` | Active status dots ("Open Now"), completed checkmarks | ~3.3:1 (large UI icons) |
| `green-500` | `#3A9A63` | Accent headings, focus indicator ring | ~4.1:1 (large text / icons) |
| `green-600` | `#2F7B53` | **Primary Brand Color** — buttons, tabs, links, small text on white | **5.2:1** (Passes AA for all text) |
| `green-700` | `#256E4C` | Button hover and pressed active states | **6.4:1** (Passes AAA) |
| `green-800` | `#1D5A3F` | Dark mode elevated card surfaces, high-contrast headings | **9.5:1** (Passes AAA) |
| `green-900` | `#154537` | Dark mode page background, deep footer sections | **13.4:1** (Passes AAA) |

#### Accents & Semantic Roles
- `lime-400`: `#A3E635` — Energetic accent for promotional highlights, notification pips, and dark mode focus glow.
- `lime-500`: `#84CC16` — High-contrast interactive lime outline.
- `red-500`: `#EF4444` / `red-600`: `#DC2626` — **Emergency & Destructive ONLY**. Used for the emergency floating action button (FAB), critical alerts, and overdue vaccines. Never used for decorative accents.
- `amber-400`: `#FBBF24` / `amber-500`: `#F59E0B` — Warning and pending state indicators.
- `blue-500`: `#3B82F6` — Informational callouts and external guidance links.

#### Neutral & Surface Roles (Light vs Dark Mode)
```css
:root {
  --bg-app: #FAFCFA;
  --surface-card: #FFFFFF;
  --surface-elevated: #FFFFFF;
  --text-primary: rgba(0, 0, 0, 0.90);
  --text-secondary: rgba(0, 0, 0, 0.62);
  --text-disabled: rgba(0, 0, 0, 0.38);
  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-active: #8CD2A3;
  --border-focus: #2F7B53;
}

[data-theme="dark"] {
  --bg-app: #0E231B;
  --surface-card: rgba(21, 69, 55, 0.75);
  --surface-elevated: #193D30;
  --text-primary: rgba(255, 255, 255, 0.96);
  --text-secondary: rgba(255, 255, 255, 0.68);
  --text-disabled: rgba(255, 255, 255, 0.40);
  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-active: #3A9A63;
  --border-focus: #A3E635;
}
```

---

## 3. Typography Standards

### 3.1 Type Families
- **Bangla (`bn`)**: `"Hind Siliguri", "Noto Sans Bengali", sans-serif`
  - Rendered with `font-feature-settings: "kern" 1;`
  - Strict line-height ratio: **≥ 1.62** across all scales.
- **English (`en`)**: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  - High x-height, optimized for dense UI screens.

### 3.2 Scale & Vertical Rhythm

| Style | Font Size | Line Height (EN) | Line Height (BN) | Weight | Minimum Tap Target |
|---|---|---|---|---|---|
| **Display** | 36px (2.25rem) | 44px (1.22) | 58px (1.62) | 700 Bold | — |
| **Heading 1** | 28px (1.75rem) | 36px (1.28) | 46px (1.64) | 700 Bold | — |
| **Heading 2** | 20px (1.25rem) | 28px (1.40) | 34px (1.70) | 600 SemiBold | — |
| **Heading 3** | 18px (1.125rem) | 26px (1.44) | 30px (1.66) | 600 SemiBold | — |
| **Body Default** | 16px (1.0rem) | 24px (1.50) | 26px (1.63) | 400 Regular / 500 Med | 44px container |
| **Body Small** | 14px (0.875rem) | 20px (1.43) | 24px (1.71) | 400 Regular / 500 Med | 44px container |
| **Caption** | 12px (0.75rem) | 16px (1.33) | 20px (1.67) | 600 SemiBold | English badge / metadata only |

> ⚠️ **Rule**: Never use Caption (12px) for Bangla body copy. Bangla characters at 12px become unreadable and diacritics blend into baseline strokes.

### 3.3 Numerals & Currency Formatting
- Currency amounts must include the Taka sign: `৳ ১,২৫০` in Bangla mode; `৳1,250` in English mode.
- Distances: `২.৫ কি.মি.` in Bangla mode; `2.5 km` in English mode.
- Telephone numbers: Always maintain Western digits (`+880 1712-345678`) to ensure instant recognizability for system dialing.

---

## 4. Spacing, Elevation & Glassmorphism

### 4.1 Spacing Scale
Based on a clean 4px baseline grid:
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px (Standard screen padding on mobile 390px)
- `space-6`: 24px (Section padding, tablet gutter 768px)
- `space-8`: 32px (Desktop container padding 1280px)
- `space-12`: 48px (Macro section separators)

### 4.2 Corner Radii
- `radius-sm`: 8px — Form inputs, filter chips, compact tags.
- `radius-md`: 12px — Standard cards, list items, alert banners.
- `radius-lg`: 20px — Category tiles, promotional hero banners.
- `radius-xl`: 28px — Bottom sheets, modal dialog containers.
- `radius-pill`: 9999px — Buttons, avatars, search pills, floating buttons.

### 4.3 Elevation & Dark-Mode Glassmorphism
- **Level 1 (`elevation-1`)**: `0 1px 3px rgba(0, 0, 0, 0.08)` (resting cards).
- **Level 2 (`elevation-2`)**: `0 4px 16px rgba(0, 0, 0, 0.10)` (interactive hover cards, dropdowns).
- **Level 3 (`elevation-3`)**: `0 8px 32px rgba(0, 0, 0, 0.16)` (modals, bottom navigation bar).
- **Glassmorphic Surface (`glass`)**:
  - Light mode: `bg-white/80 backdrop-blur-md border border-black/[0.06]`
  - Dark mode: `bg-green-900/75 backdrop-blur-md border border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.3)]`

---

## 5. Component Usage & Guidelines

### 5.1 Buttons
- **Primary**: Solid `green-600` background, white text. Maximum 1 per viewport fold.
- **Secondary**: `green-600` border, `green-600` text (dark mode: `lime-400` border & text).
- **Ghost**: Transparent background, text only, for tertiary actions.
- **Danger / Emergency**: Solid `red-600` background, white text. Reserved for urgent reporting, medical emergency, cancellation.
- **FAB (Floating Action Button)**: Circular 56×56px button pinned at bottom-right or centered in bottom navigation.

### 5.2 Form Inputs
- Must always present a persistent label above the field.
- Placeholder text is supplementary and must never replace the label.
- Error messages must provide actionable correction guidance in the current language.
- Touch targets must be at least 44px high.

### 5.3 Bottom Navigation & Top Bar
- **Top App Bar**: 56px height, includes optional back navigation, clear screen title, and optional utility action (notification bell / language switch).
- **Bottom Navigation**: 64px height with safe area inset, contains 4 primary destinations + elevated center FAB (`+` or `🚨`).

---

## 6. Naming Conventions & Do / Don't

### Do's ✅
- **DO** use responsive container classes (`max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8`).
- **DO** test every button with the longest conceivable Bangla translation before approving design specs.
- **DO** provide visible `:focus-visible` rings with at least a 2px offset.
- **DO** ensure all clickable elements have `cursor-pointer` and proper ARIA labels.

### Don'ts ❌
- **DON'T** use emoji characters as system icons. Use standard `lucide-react` icons for consistency.
- **DON'T** use pure red (`#FF0000`) for decorative graphics; red is strictly reserved for emergency and critical error states.
- **DON'T** truncate critical labels in Bangla mode; use wrapping auto-layout containers.
- **DON'T** drop below 14px font size for any Bangla text.
