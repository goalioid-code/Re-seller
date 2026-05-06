---
name: Premium Athletic Commerce
colors:
  surface: '#fff8f7'
  surface-dim: '#ecd5d2'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#ffe9e6'
  surface-container-high: '#fbe3e0'
  surface-container-highest: '#f5dddb'
  on-surface: '#251817'
  on-surface-variant: '#58413f'
  inverse-surface: '#3b2d2c'
  inverse-on-surface: '#ffedeb'
  outline: '#8c716e'
  outline-variant: '#e0bfbc'
  surface-tint: '#ac322e'
  primary: '#690008'
  on-primary: '#ffffff'
  primary-container: '#8b1a1a'
  on-primary-container: '#ff9a91'
  inverse-primary: '#ffb3ac'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#402e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c4300'
  on-tertiary-container: '#dcaf4d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#8a1a1a'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdea0'
  tertiary-fixed-dim: '#eec05c'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#fff8f7'
  on-background: '#251817'
  surface-variant: '#f5dddb'
typography:
  h1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  subheadline:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The design system is anchored in a "Premium Reseller" aesthetic that balances the high-energy world of sportswear with the sophisticated, trustworthy nature of a professional business platform. It targets Indonesian entrepreneurs and sneaker enthusiasts who value authenticity, speed, and status. 

The visual direction follows a **Modern Minimalist** approach. By utilizing a warm cream foundation instead of a sterile pure white, the UI feels more approachable and "friendly Indonesian," while the deep maroon and gold accents signal exclusivity and reward. The interface prioritizes clarity and heavy whitespace to allow high-quality product photography to remain the focal point.

## Colors

The palette is designed to feel grounded and prestigious. 
- **Primary Maroon (#8B1A1A):** Used for primary actions and brand-heavy moments to convey passion and strength.
- **Accent Gold (#D4A847):** Reserved strictly for rewards, "Calsub Coins," and premium tier indicators to ensure these elements feel high-value.
- **Background Cream (#FAFAF7):** Softens the overall interface, reducing eye strain and providing a sophisticated alternative to default white.
- **Neutral Palette:** High-contrast black for readability and a muted grey for secondary metadata.

Avoid the use of gradients. Depth should be achieved through solid color blocking and subtle shadow work rather than color transitions.

## Typography

This design system utilizes **Inter** for its exceptional readability and neutral, modern character. 

The typographic hierarchy is led by a bold 28pt headline that establishes clear section entry points. The 15pt subheadline is the workhorse of the system, using a generous 1.5 line height to ensure that product descriptions and reseller instructions are easy to digest. Use uppercase for labels and small metadata to provide a "catalog" feel to the commerce experience.

## Layout & Spacing

The layout utilizes a **fluid 4-column grid** for mobile devices, emphasizing vertical rhythm and generous margins. 

A 24px standard margin is preferred for top-level screens to enhance the feeling of "premium whitespace." Components should follow an 8px (2-unit) incremental system for internal padding, ensuring a consistent and structured appearance across the reseller dashboard and product feeds.

## Elevation & Depth

Hierarchy in the design system is conveyed through **ambient shadows** and **tonal layering**. 

- **Surface Tiers:** Cards and interactive containers are pure white (#FFFFFF) set against the Cream background (#FAFAF7). This subtle tonal shift creates immediate depth without requiring heavy borders.
- **Shadows:** Use extremely diffused, low-opacity shadows (e.g., Blur 20px, Y: 8px, 4% Opacity Black). Shadows should feel like a soft glow rather than a hard drop, mimicking natural light hitting high-quality paper.
- **Interactive Depth:** On press, elements should shift slightly in elevation—either by deepening the shadow or subtly scaling—to provide tactile feedback to the user.

## Shapes

The shape language is characterized by **soft, inviting curves** that lean toward a pill-shaped aesthetic for primary actions.

- **Primary Buttons:** Fixed at a 28px corner radius, creating a friendly, modern "capsule" look.
- **Cards & Containers:** Utilize a 24px corner radius to maintain a consistent visual flow with the buttons while feeling substantial and professional.
- **Small Elements (Inputs/Chips):** Use a 12px or 16px radius to ensure they feel part of the same family without appearing overly circular at smaller scales.

## Components

### Buttons
- **Primary:** Maroon (#8B1A1A) background with White text. 28px corner radius. High-emphasis.
- **Secondary:** Transparent background with a 1px Maroon border. For less critical actions.
- **Ghost:** Text-only for navigation within headers.

### Input Fields
- White background with a very subtle #E0E0E0 border.
- Floating labels using Text Secondary (#666666) at the 12px label size.
- 16px corner radius for a modern, approachable feel.

### Cards (Product & Inventory)
- Pure white surface with a soft 20px blur shadow.
- Generous internal padding (16px).
- Status badges (e.g., "Ready Stock") should use Maroon or Black with small, bold text.

### Reward Chips
- Accent Gold (#D4A847) used for backgrounds of small coin-balance indicators.
- Icons within these chips should use a slightly darker shade of gold for contrast.

### Lists
- Use thin dividers in a lightened version of the Cream background to separate reseller transactions.
- Chevron icons should be used to indicate drill-down actions, colored in Text Secondary.