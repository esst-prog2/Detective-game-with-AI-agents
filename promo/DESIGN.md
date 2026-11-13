---
name: The Ashcroft Manor Murder
description: Illustrated detective atmosphere with a readable gameplay walkthrough.
colors:
  ground: "#131719"
  surface: "#20282c"
  ink: "#f3ecdc"
  muted: "#c7c5bd"
  brass: "#d6b16d"
  paper: "#e9dfc9"
  line: "#576064"
  code-ground: "#0c1012"
  button-ink: "#141719"
typography:
  display:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(3rem,6vw,5.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(2rem,4vw,3.6rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-.025em"
  title:
    fontFamily: "Georgia, serif"
    fontSize: "1.6rem"
    fontWeight: 400
    lineHeight: 1.08
  body:
    fontFamily: '"Segoe UI", sans-serif'
    fontSize: "16px"
    lineHeight: 1.65
  code:
    fontFamily: "Consolas, monospace"
    fontSize: ".85rem"
    lineHeight: 1.6
spacing:
  half: ".5rem"
  small: "1rem"
  medium: "1.5rem"
  large: "2rem"
  section-gap: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.button-ink}"
    padding: ".85rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.paper}"
  code-block:
    backgroundColor: "{colors.code-ground}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    padding: "1.5rem"
---

# Design System: The Ashcroft Manor Murder

## Overview

**Creative North Star: "Gameplay walkthrough"**

The adopted concept is the user-selected gameplay walkthrough, implemented code-first. Illustrated detective atmosphere meets a modern, professional introduction: elegant serif headings, readable supporting text, restrained charcoal and brass, and genuine game imagery.

This records the built promo, not a new identity proposal. Source evidence is `index.html` and the final cascade in `style.css`; product constraints remain in `../PRODUCT.md`, with the approved surface brief in `../docs/homework-9/design-brief.md`.

**Key Characteristics:**
- Broad genuine gameplay proof.
- Serif hierarchy and quiet sans serif reading.
- Restrained brass emphasis on dark grounds.
- Clear local-play instructions.

## Colors

### Primary

Brass highlights the main action, hook, step numbers, roles, image links and focus indicators. Paper supplies the primary action's hover surface and skip-link background.

### Neutral

Ground is the page canvas; surface distinguishes the character-response section. Ink carries headings and important text; muted carries supporting copy and captions. Line defines section dividers and screenshot borders. Code-ground supports commands and the contained hero image; button-ink is the primary action's text.

## Typography

Georgia supplies the display, headings, brand and hook; Segoe UI supplies body and navigation; Consolas supplies commands. Headings are regular weight and balanced; paragraph text is limited to 70ch, with selected supporting text using pretty wrapping.

Display and headline roles follow the frontmatter. The hook uses 1.6rem; numbered steps use 1.8rem titles, suspect names 2rem, and ordinary subsection titles the title role. Captions use .85rem; local notes use .875rem. At the mobile breakpoint the hero display becomes clamp(2.7rem,10vw,4rem), and suspect names become 1.5rem.

## Layout

The final content container is 1280px, centered with 4vw side padding. The hero stacks copy above full-width gameplay proof. Its copy uses a 1.3fr/1fr grid with a 5rem column gap; title, premise, actions and local-play note share this opening composition.

Main sections use 4.5rem vertical padding. The walkthrough, screenshot, preview and setup sections pair .85fr/1.5fr columns with a 5rem gap. Suspects use three columns with a 4rem gap. At 800px and below, content becomes a single-column reading sequence with 3rem/5vw section padding; portraits sit beside their text. Setup headings are sticky at 2rem on desktop and static on mobile.

## Elevation & Depth

There are no box shadows. Dark tonal surfaces, thin dividers and the illustrated screenshots supply depth. Images retain their content rather than receiving decorative overlays; hero proof is contained within a maximum height of 580px.

## Shapes

Controls and code blocks have square corners. One-pixel lines separate sections and outline screenshots. Portraits use contained artwork rather than framed cards. The page has no card, chip or input component system.

## Components

### Buttons

The primary action is a square brass link with semibold text and the frontmatter padding. Hover changes its surface to paper. Text actions remain recognizable links; the hero repository action has a minimum height of 44px.

### Navigation

A serif brand sits opposite a plain sans serif anchor row. Navigation links have a minimum height of 44px, .5rem vertical padding and brass hover text. The row wraps on mobile below the brand. All links use a 3px brass focus outline with 6px offset. The skip link becomes visible when focused.

### Gameplay proof

Screenshots are responsive, bordered figures with muted captions. Both each image and its explicit full-size link open the original asset; hover outlines the image in brass. The gallery has a 2rem gap and aligns to its start.

### Numbered walkthrough

The ordered player actions use brass Georgia counters in a 3rem column, a 1rem column gap, and 1.5rem vertical padding with bottom dividers. Copy follows its heading in the second column.

### Command blocks

Commands sit on code-ground with wrapping and overflow handling, a 1.5rem inset and the code typography role. Supporting paragraphs distinguish server and interface terminals and explain local execution.

## Do's and Don'ts

### Do:
- **Do** preserve genuine, spoiler-safe gameplay images with descriptive alternatives and full-size links.
- **Do** retain visible keyboard focus, reachable navigation and the mobile reading sequence.
- **Do** describe the game as locally run and preserve the two-terminal setup explanation.
- **Do** consult the existing source and PRODUCT.md for claims, preview limits and AI behavior.

### Don't:
- **Don't** imply that the static promo hosts a playable game.
- **Don't** fabricate game imagery, case facts, solutions or AI capabilities.
- **Don't** replace the illustrated atmosphere with decorative interface effects unsupported by the built page.
