# Homework 9 — Impeccable shape brief

Status: DRAFT FOR USER CONFIRMATION. No final page code, design variant or publication is approved by this brief.

Prepared 2026-11-13 using installed Impeccable 4.9.0: context loader, init, shape and the new-work guidance for a whole surface inheriting an existing visual identity. PRODUCT.md records the confirmed product context. The user selected code-first browser design. This is a planning brief, not a direction contract or completed design system.

## Job, audience and outcome

Mode: Persuade. A classmate, teacher or mystery-game newcomer should understand the game within the first viewport, see genuine gameplay, and find accurate local-play instructions. The main message is “Question the suspects. Examine the evidence. Find out who is lying.” The complete Ashcroft investigation leads; Greyhaven remains a separate playable preview.

Primary action: **Try it locally**, linking to the setup section. Secondary action: **View on GitHub**, linking to the actual repository. “Runs on your computer; Node.js and the local game server required” belongs beside these actions. There is no hosted-game Play button.

## Visual authority and direction

Inherit the illustrated game's established world rather than inventing a separate brand: charcoal and deep blue-black grounds, warm brass emphasis, occasional paper surfaces, elegant serif titles and clear supporting text. Existing room scenes and public portraits connect the promo to the game. The page should read as a modern game introduction rather than a software-service template.

The physical scene is a visitor examining a lamplit investigation at their desk; dark surfaces should support the illustrations, while light paper-like panels can distinguish readable instructions and case notes. Texture stays subtle and decorative detail stays sparse. Do not imply an interactive investigation board exists in the game.

Typography approach: a characterful, readable serif for game titles and a quiet sans serif for body text, navigation and commands. Fonts and exact sizes remain implementation choices to resolve in actual variants. Avoid decorative script, cramped uppercase body copy and long tracked labels. Prefer local/system resources or properly sourced self-hosted fonts; no private information in font/assets metadata.

Color roles, not finalized tokens: near-black/charcoal for the main ground; muted navy for room depth; warm parchment for selected reading surfaces; brass/gold for emphasis and primary action; sufficiently light neutral text. Focus and links must remain recognizable beyond color alone. Final values require contrast checks.

## Content and layout structure

Use the approved investigation-led copy in page-copy.md. Every actual design variant must carry the same factual content:

1. Hero: title, short premise, genuine game proof, local-play and repository actions.
2. How it works: Explore → Inspect → Question → Compare → Accuse.
3. Meet the suspects: public-only descriptions of Alice, Ben and Clara.
4. The investigation: room, evidence-inspection and dialogue screenshots with useful captions.
5. Character responses: distinct knowledge, conversation memory and evidence-dependent follow-ups, with bounded AI/offline explanation.
6. Greyhaven: a small, clearly separate preview section.
7. Try locally: verified commands and two-terminal instructions.
8. About: university course context and repository link.

The hero and proof should form one deliberate composition. Alternate dense screenshots with short readable explanations; avoid an uninterrupted grid of equal cards. Navigation should reach gameplay, screenshots and local setup without requiring a full-page scroll. Long commands wrap or scroll within a labelled code block without creating page-wide horizontal overflow.

## Composition exploration for the browser round

The structure remains deliberately open until the user reviews actual Impeccable generate variants. Before running the surface-concept command, the grounded candidates were derived from the approved content and existing visual identity: cinematic scene introduction, annotated gameplay walkthrough, suspect-to-evidence editorial sequence, open case-file spread, illustrated location sequence, contact-sheet game showcase, and room-led theatre composition. These are planning candidates, not generated variants.

Impeccable concept-seed ran successfully with scope surface, mode persuade and seven candidates; it dealt positions 4, 2 and 7 (seed:0cf309faf8da8f81). The corresponding candidates for the next round are:

- **Open case-file spread:** the premise and local-play action share an opening case-file composition with genuine screenshot proof. Strong investigation atmosphere; risk is overusing paper decoration or compressing copy.
- **Annotated gameplay walkthrough:** one genuine screenshot leads into a clear sequence of player actions. Strongest explanation for a newcomer; risk is making an inviting game page feel like a manual.
- **Room-led theatre composition:** a broad illustrated scene anchors the title and action, with game proof below. Strong visual connection to the game; risk is allowing scenery to overpower the local-play explanation.

User instruction takes precedence over generic new-work ordering: this shape step stops at a brief, and actual browser design variants must be created through Impeccable generate after confirmation. The concept roll did not create or approve browser variants. No substitute workflow, generated screenshot or fabricated session is claimed. Meaningful differences in hierarchy and arrangement, rather than palette swaps, are required in that later round. The user may steer or reject these planning candidates before generation.

## Screenshot strategy

Use genuine captures from the repository, individually inspect each at full size, and choose only spoiler-safe public scenes. Retain captions that describe an action, never infer the culprit or identify testimony as a lie. Prefer a fresh or clearly representative current-interface capture when historical screenshots miss later UI changes.

Already reviewed: desktop study, Alice's opening interview, the newer dialogue-initial screen and Greyhaven preview. The first three contain no solution verdict. The Greyhaven screenshot shows a received statement and extensive preview instructions; a fresh start-state capture would explain the preview more cleanly. No evidence-inspection screenshot is selected yet. Avoid conclusion captures and mystery-deduction supported-ending images.

Optimize selected screenshots for web delivery without altering gameplay content. Include intrinsic dimensions and descriptive alt text. Existing vector illustrations can remain SVG. Do not fabricate gameplay screenshots. No raster generation is needed for the chosen code-first approach.

## Accessibility and responsive behavior

- Semantic landmarks, one main title and logical section headings; a working skip link.
- Keyboard-operable navigation and links with visible focus; no hover-only content or mandatory drag interaction.
- Text contrast of at least 4.5:1 for normal text and 3:1 for large text; meaningful controls and focus indicators meet relevant contrast requirements.
- Readable body type, comfortable line lengths and touch targets; no essential text embedded only in images.
- Responsive proof images and a coherent single-column reading sequence on mobile. Verify at approximately 360px, 390px and desktop widths, plus enlarged text/reflow.
- Respect reduced motion; no parallax, autoplay video, flashing or scroll-locked introduction is necessary.
- Captions explain screenshots while alt text describes their relevant visual content. No private state, tokens or hidden solution data in the DOM or alt text.

## Technical boundaries and states

Build an isolated static promo compatible with GitHub Pages project-site hosting at /Detective-game-with-AI-agents/. Existing game Vite proxy, Node API, sessions and mechanics stay outside its build graph. Use relative assets or the correct base path. The static page must load and navigate with the game API stopped.

States are simple: ordinary page reading, navigation/focus, direct anchor visits, mobile menu if one is necessary, and image-loading fallback text. Do not add forms, accounts, model calls or simulated gameplay. No broken video or slides links; future additions can be accommodated structurally without visible placeholders.

Before publishing: review the site artifact and relevant repository history for sensitive material; verify public visibility, Pages permissions, real deployed URL, images/links, local setup and independence from the game API. Repository-wide source disclosure and a spoiler-free site artifact are distinct checks. Stop and report any sensitive finding before publication.

## Confirmation needed

Confirm this brief or request corrections. Then run genuine Impeccable generate in the browser, show the resulting variants with tradeoffs, commit the generation step and stop for the user's visual selection. Shape does not write page code or select a final variant.
