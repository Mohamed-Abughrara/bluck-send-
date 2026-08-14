---
name: Kinetic Minimalist
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
---

## Brand & Style

The design system is engineered for high-velocity focus and executive clarity. It targets professionals who value efficiency over ornamentation, drawing heavy inspiration from the "Utility-Sophistication" movement. The UI evokes a sense of calm control, reducing cognitive load through extreme decluttering.

The aesthetic blends **Minimalism** with **Modern SaaS** sensibilities. It utilizes high-quality typography, generous whitespace to separate functional groups, and a restrained color palette to ensure the primary action is always self-evident. Movement is subtle and functional, reinforcing the user's flow rather than distracting from it.

## Colors

The palette is anchored by a sophisticated Teal (#0D9488) primary accent, used sparingly to denote intent and primary progression. The foundation is built on a Slate scale, utilizing a very soft background (#F8FAFC) to allow white cards and surfaces to "pop" with subtle distinction.

- **Primary:** Teal used for "Send" actions, primary buttons, and active states.
- **Surface:** Pure white (#FFFFFF) is reserved for interactive cards and input areas.
- **Background:** Soft Slate (#F8FAFC) provides a low-contrast canvas that reduces eye strain.
- **Typography:** Deep Slate (#0F172A) for headers to ensure maximum legibility, with medium grays (#475569) for secondary data.

## Typography

This design system exclusively uses **Inter** to leverage its systematic, utilitarian precision. The hierarchy is strictly enforced to guide the user through complex email workflows.

- **Scale:** High contrast between headlines and body text ensures information density remains readable.
- **Weight:** Use Semibold (600) for interactive elements and titles to provide a sturdy structural feel.
- **Letter Spacing:** Headlines utilize slight negative tracking (-0.01em to -0.02em) for a more "designed" and compact appearance typical of modern professional tools.

## Layout & Spacing

The layout utilizes a **Fixed-Fluid hybrid** model. A sleek, narrow sidebar (240px) remains fixed to the left, while the main content area utilizes a max-width container (1200px) centered in the remaining viewport to prevent line lengths from becoming unreadable on ultra-wide monitors.

- **Rhythm:** A 4px baseline grid governs all spacing. 
- **Grouping:** Use `lg` (32px) spacing to separate major sections and `sm` (16px) for elements within a card.
- **Mobile:** On devices below 768px, the sidebar collapses into a bottom-bar or hamburger menu, and horizontal margins shrink to 16px.

## Elevation & Depth

Depth is communicated through **Tonal layering** and **Ambient shadows**. Rather than heavy drop shadows, this design system uses extremely diffused, low-opacity shadows that suggest the surface is barely lifted off the background.

- **Level 0 (Background):** #F8FAFC - The base canvas.
- **Level 1 (Cards/Sidebar):** #FFFFFF - White surfaces with a 1px border (#E2E8F0) and a subtle 4px blur shadow at 2% opacity.
- **Level 2 (Modals/Popovers):** #FFFFFF - Focused elements with a more pronounced 12px blur shadow at 5% opacity to indicate priority.
- **Interactions:** Hover states on interactive cards should slightly deepen the shadow rather than changing the background color, maintaining a "tactile" response.

## Shapes

The shape language is defined by "Large Softness." By using `rounded-xl` (1.5rem) for primary containers and `rounded-lg` (1rem) for components like buttons and inputs, the UI feels approachable and high-end.

- **Container Corners:** 24px (xl) for the main content area and dashboard cards.
- **Component Corners:** 8px to 12px for buttons and form fields to maintain a professional balance.
- **Exceptions:** Status badges and "chips" use a full pill-shape (999px) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Background #0D9488, text #FFFFFF. No gradient. On hover, darken by 5%. 
- **Secondary:** Background #FFFFFF, border 1px #E2E8F0, text #0F172A. 
- **Ghost:** No background or border, Teal text. Used for secondary navigation within cards.

### Input Fields
- Height: 40px. 
- Border: 1px #E2E8F0. 
- Focus: 1px #0D9488 with a 2px Teal glow at 10% opacity.
- Placeholder text: #94A3B8.

### Sidebar Navigation
- Width: 240px. 
- Active state: Subtle Teal left-border (2px) and a light Teal background wash (#F0FDFA).
- Icons: 20px size, stroke weight 1.5px.

### Status Chips
- Small, uppercase label-md font. 
- Success: Light green background, dark green text. 
- Error: Light red background, dark red text.

### Cards
- White background, 24px padding, 24px corner radius. 
- Always include a subtle 1px border (#F1F5F9) to define the edge against the off-white background.