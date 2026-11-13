# Detective game promotional page

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Classmates, the Advanced Programming teacher, and visitors who enjoy detective mysteries and have not encountered this project or AI agents. The user confirmed this framing during the Impeccable product-context / gstack premise interview on 2026-11-13.

## Product Purpose

Introduce the existing detective game, explain what players do, show genuine gameplay, and help visitors try it locally. Homework 9 requires a publicly accessible promotional page on GitHub Pages by November 14, 2026, 20:00 Europe/Budapest.

## Positioning

An illustrated investigation combining room exploration, evidence inspection, suggested and free-text questioning, separate character knowledge and conversation memory, and comparisons between testimony and evidence. Responses are reviewed and authorized; optional AI selects permitted performances rather than inventing the mystery.

## Operating Context

The complete Ashcroft case is the lead experience. The separate Greyhaven repair-dispute preview demonstrates a narrower investigation and must remain labelled as a preview. Players install and run the game locally with Node and npm; the browser game needs both a local API and Vite. A static GitHub Pages deployment does not host that API.

## Capabilities and Constraints

- Ashcroft: Alice Mercer, Ben Carter and Clara Voss; study, library and garden; torn contract, silver cufflink and muddy footprints; a final accusation and result.
- Greyhaven preview: Mara Vale and Owen Vale, reception and boathouse, two repair records, evidence-dependent account revision and contextual clarification, without a complete murder accusation or ending.
- Deterministic offline play is supported. Optional AI performance selection is configured only on the server.
- No game mechanics, game API configuration changes, promotional video, or slides are in scope.
- No public play button unless an actual hosted game exists. No fabricated screenshots, private case information, solution spoilers, credentials, personal contact details, or unsupported claims.
- The user must choose from genuine Impeccable browser variants before selected-design implementation or publication.

## Brand Commitments

Use concise, natural English appropriate for a student project. The visual brief calls for a detective-mystery atmosphere connected to the existing illustrated game, with readable typography, restrained details and responsive layouts. Detailed visual choices remain open until the required Impeccable steps.

## Evidence on Hand

README.md documents local setup and current scope. src/data/case.js supplies public Ashcroft dossiers; only public fields may inform suspect introductions. src/cases/greyhaven-preview.js and docs/greyhaven-preview describe preview boundaries. web/src/presentation/asset-manifest.js maps existing public illustrations. Genuine screenshots are available under docs/room-screenshots, docs/dialogue-screenshots, docs/browser-screenshots and docs/greyhaven-preview; each selected image requires spoiler review.

## Product Principles

- Lead with the investigation and the player's actions.
- Explain AI behavior in ordinary language and keep claims bounded by the implementation.
- Distinguish the complete case, playable preview, and local-play setup.
- Show real gameplay and preserve the mystery.
- Document genuine tool contributions and user decisions in PROCESS.md.

## Accessibility & Inclusion

Readable desktop and mobile layouts, keyboard navigation, visible focus, descriptive image alternatives, clear link labels and restrained motion are required. Visitors should understand the game without technical knowledge.
