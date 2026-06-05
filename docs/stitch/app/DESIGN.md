---
name: Pitch Elite
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c6c9ac'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#909379'
  outline-variant: '#454933'
  surface-tint: '#b5d300'
  primary: '#ffffff'
  on-primary: '#2b3400'
  primary-container: '#cff100'
  on-primary-container: '#5b6b00'
  inverse-primary: '#566500'
  secondary: '#ffb3b2'
  on-secondary: '#680012'
  secondary-container: '#ff525c'
  on-secondary-container: '#5b000f'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cff100'
  primary-fixed-dim: '#b5d300'
  on-primary-fixed: '#181e00'
  on-primary-fixed-variant: '#404c00'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b2'
  on-secondary-fixed: '#410008'
  on-secondary-fixed-variant: '#92001e'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-hero:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-card:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  stat-value:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.02em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  container-padding: 1.25rem
  element-gap: 1rem
  section-margin: 2.5rem
  card-stack-offset: 0.5rem
---

## Brand & Style

This design system is engineered to capture the high-octane energy of professional football, specifically drawing from the "Ultimate Team" and "FC" aesthetic. The brand personality is aggressive, aspirational, and digitally native, targeting youth athletes and scouts who live in a high-speed social media environment.

The visual style is a fusion of **High-Contrast / Bold** and **Glassmorphism**. It utilizes heavy geometric layering, italicized motion-heavy typography, and "shards" of light to create a sense of forward momentum. The UI should feel like a premium digital collectible—tactile yet futuristic. Use angled clipping masks and repeating patterns (halftones and chevrons) to fill negative space and reinforce the athletic narrative.

## Colors

The palette is anchored in a "Void Black" (`#050505`) base to allow neon accents to vibrate. The primary color is **Volt Green**, used for critical actions and performance metrics. **Vibrant Red** serves as a high-energy secondary for "Live" indicators, recording states, or competitive stats.

Tertiary greys are used for container backgrounds to provide separation from the pure black canvas. Backgrounds should not be flat; use gradients that transition from deep charcoal to black, or subtle dark-on-dark geometric patterns to maintain depth without distracting from the player content.

## Typography

Typography is the primary driver of the system's "High-Energy" feel. Headlines must be set in **Epilogue**, using its heaviest weights and forced italics to simulate speed. This font's geometric construction mimics the angles of football pitch markings.

For readability within data-heavy player cards and bio sections, **Lexend** provides an athletic, wide-stanced clarity. **Space Grotesk** is reserved for technical data, stats, and labels, providing a futuristic, "scouter" feel. All "Display" and "Headline" levels should be transformed to uppercase by default to maintain the bold, editorial intensity of a player profile.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Tonal Layering** rather than traditional shadows. 

1.  **Background Layer:** Deep black with noise texture or subtle geometric watermarks.
2.  **Mid Layer:** Semi-transparent "Glass" cards (20% opacity white or black) with a heavy backdrop blur (20px-30px). These should have a subtle 1px border with a gradient stroke to catch the "light."
3.  **Top Layer:** High-fidelity player cutouts with "glow" outer-layer effects in the primary or secondary color.
4.  **Overlay Layer:** Floating UI elements (chips, tags) that use high-saturation solid colors to pop against the blurred backgrounds.

## Shapes

The shape language is dominated by **Sharp (0)** edges and **Angled Geometry**. While containers use sharp corners to feel aggressive and precise, specific "Player Card" motifs should utilize a "clipped corner" or hexagonal aesthetic—specifically cutting the top-left or bottom-right corners at a 45-degree angle.

Buttons and chips are rectangular and sharp. Avoid circles unless they are used for social icons, but even then, consider housing them in octagonal frames to stay consistent with the "FC" design language.

## Components

### Player Card Motif
The central component. A vertical card featuring a large, high-contrast player cutout. The background of the card should feature a "shining" gradient (using Primary and Secondary colors) and a large, low-opacity number (the player's jersey number) behind the athlete.

### Action Buttons
Primary buttons should be solid Volt Green with black text. They must use the "Epilogue" Bold Italic font. Secondary buttons should be "Ghost" style with a 2px white border and a hover state that fills with a gradient.

### Performance Stats
A horizontal or grid-based display of key metrics (Pace, Shooting, Passing, etc.). Each stat consists of a Space Grotesk value and an uppercase label. Include a small progress bar below each value using a neon-to-dark gradient.

### Social Link Chips
Rectangular, full-width links with a semi-transparent glass background. Include a subtle chevron on the right side and use the "Lexend" font for the link text.

### Dynamic Overlays
Small "Badge" components (e.g., "MOTM," "TOP SCORER") that are positioned at an angle (typically -5 to -10 degrees) to create visual tension and energy.