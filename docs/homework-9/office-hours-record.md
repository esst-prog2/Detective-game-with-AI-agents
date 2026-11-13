# Design: Homework 9 promotional content

Generated through the installed gstack office-hours workflow on 2026-11-13.
Branch: feature/homework-9-promo-page
Repo: esst-prog2/Detective-game-with-AI-agents
Status: CONTENT APPROACH APPROVED; visual design pending Impeccable
Mode: Builder

## Problem statement and appeal

The existing university game needs a public page that explains its appeal and lets a new visitor try it. A reader should immediately recognize a detective investigation: explore illustrated rooms, inspect clues, ask suspects questions, compare accounts and accuse.

## Confirmed premises

- User confirmed the audience: classmates, teacher and mystery newcomers.
- Lead with the complete Ashcroft case, player actions, genuine screenshots, local-play instructions and the GitHub repository.
- Greyhaven is a separate, explicitly incomplete repair-dispute preview.
- AI uses reviewed responses; offline play requires no model key. GitHub Pages hosts the promo, not the local Node API.
- User approved general-category research and chose the investigation-led content approach and code-first Impeccable build path.

## Approaches considered

- A, investigation-led, selected: easiest route from premise through gameplay proof to local setup; reuses genuine screenshots and documented commands, smallest isolated page. Low risk; estimated human author/design effort one day, assistant-assisted content work under an hour excluding human decisions.
- B, case-file-led, declined in favor of A: more atmospheric suspect/evidence storytelling but slower gameplay explanation; reuses public dossiers, adds editorial sequencing work.
- C, project-led, declined in favor of A: stronger academic/technical explanation but less immediate appeal for a new player; reuses README and implementation reports.

## Independent perspective and synthesis

User requested the optional second opinion. Claude Code was unavailable (resolver returned null); gstack's prescribed Codex in-host sub-agent fallback supplied a fresh-context review. Full output and synthesis: [second-opinion.md](second-opinion.md). Do not describe this as a completed cross-model review. Its four findings reinforce existing premises: put local-play wording beside the primary CTA, bound AI claims, label the preview and use player verbs.

## Content deliverable

[page-copy.md](page-copy.md) contains the page copy; [claim-audit.md](claim-audit.md) maps its assertions to source evidence. Keep suspect introductions within public dossiers. No technical mystery internals or solution interpretation are public copy.

## Workflow scope and explicit deviation

The user's workflow explicitly assigns content to gstack, then requires Impeccable shape before page code and Impeccable generate for actual browser variants. Therefore gstack's generic Phase 4.25 visual mockups/sketches are deliberately deferred to Impeccable rather than run as competing design variants. No gstack image/sketch generation is claimed. Builder questions already answered by the user's detailed initial plan were smart-skipped per Phase 2B. Premise and approach gates received actual user answers.

Research reviewed official Guilty or Not, Interrogation and YouDetective pages, via general-category search with permission. Familiar action-led explanations apply; no claim of a novel marketing discovery or user research result is made.

## Distribution and success

Create an isolated static artifact compatible with the /Detective-game-with-AI-agents/ base path. Review intended site files and relevant tracked history for sensitive material before publishing. Configure GitHub Pages only after the user's design selection; verify the actual public URL and deployed assets. Visibility and administrative authentication remain unverified.

Done means a responsive, keyboard-accessible, spoiler-safe page independent of the local API, genuine documented tool usage, separate pushed step commits and an actually verified public URL. Local instructions need final smoke verification. Required workflow: Impeccable shape, browser variants, user choice, selected implementation, three-perspective critique, publication.

## What the user's answers establish

- “Builder mode for the university demo” fixes the session's purpose.
- “Confirm this framing” approves the game-first explanation and honest local-play boundary.
- “Get an independent AI second opinion” prompted a separate-context content review.
- “A — Investigation-led” chooses the content sequence; it does not approve a visual variant.

## Next steps

1. Finish the Impeccable shape brief without page implementation.
2. Confirm that brief and generate actual browser variants using Impeccable.
3. Ask the user to choose the visual variant before selected-design work and publication.
