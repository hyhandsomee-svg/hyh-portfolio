# HMI Portfolio Website

## Intent

The website is an immersive recruiter-facing case-study experience. It follows the project's own reasoning path: driving context, user research, interaction architecture, competitive mechanisms, capability systems, and high-fidelity outcomes.

## Presentation rules

- Every portfolio frame is displayed once and remains in the original Figma order.
- Frames preserve their full 16:9 composition with `object-fit: contain` and no crop, split, lightbox, or internal recomposition.
- Web-native chapter transitions and captions explain how each frame advances the argument.
- A four-step intent sequence, live chapter state, ambient frame light, and scroll choreography make the system logic perceptible.
- The browser controls reading rhythm, atmosphere, navigation, and responsive fit; the Figma frame remains the source of visual evidence.
- No link or button sends the reader to Figma.

## Visual system

- Canvas: `#050506`
- Supporting surface: `#0D0D0F`
- Primary text: white
- Secondary text: white at 70%
- Structural lines: white at 14%
- Accent: `#FFAB3D`
- Corners remain square and restrained.
- Typography uses MiSans when locally available, with system CJK fallbacks.

## Responsive behavior

- Frames never exceed their 1920px natural width.
- Below the natural width they scale proportionally as complete images.
- Captions move from a three-part desktop grid to a compact mobile stack.
- The personal profile remains readable while the portrait functions as an unframed background subject.
