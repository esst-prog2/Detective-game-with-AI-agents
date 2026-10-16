# Browser playtest — 2026-10-16

This checklist was created before the visual walkthrough. Automated browser tests are separate from the assistant's real-browser walkthrough and screenshot inspection below. No external human usability or screen-reader certification is claimed.

## Expected observations

1. Offline API and Vite: illustrated moonlit title, readable typography, exactly one session from Start.
2. Public introduction: three locations, three contacts and three globally available clues. Study/library/garden artwork differs; browsing sends no commands.
3. Ben: “Where were you?” returns greenhouse-window testimony; unsupported wording is guidance; history preserves the addressed character.
4. All three clues: descriptions arrive only after successful inspection; rereading notes sends no mutation. No discovery locks.
5. Clara: button cancellation and Escape each preserve active play. Confirmation closes exactly once and shows the server explanation.
6. Ended: known notes remain readable, unreceived inspection/questioning/accusation disabled. New investigation clears history; incorrect accusation shows no murderer reveal.
7. Recovery: network loss, stale revision and expiry preserve drafts/known notes, require deliberate recovery and never replay accusations.
8. Keyboard: visible focus; dialog Cancel first, Tab/Shift+Tab wrap, Escape cancels, active trigger regains focus, conclusion heading receives focus.
9. Layout: desktop 1440×900, mobile 390×844, width 360 and 200% zoom; no page overflow; controls remain usable; reduced motion removes transitions; art fallback keeps labels.
10. Privacy: no secret canaries or unintended bearer exposure in DOM/console/storage/bundles; no remote model/art/font calls, executable HTML responses or backend imports.

## Actual observations

The assistant drove Chromium against the real deterministic API through Vite, separately from the Playwright suite, using `node web/scripts/visual-walkthrough.mjs`. The helper injects canaries into an in-memory server-only case clone and never constructs an OpenAI adapter. No historical case/evidence files are changed. [Walkthrough observations](browser-screenshots/walkthrough.txt) are reproducible with both local ports free.

| Check | Actual result |
| --- | --- |
| Start and locations | One session per Start; public introduction and all three scenes available. Browsing makes no gameplay request. Study desk, library shelves and moonlit garden have distinct compositions. |
| Dialogue | Ben's greenhouse-window testimony received; unsupported wording explicitly labeled guidance, including in the suspect overview. Original-suspect history preserved while navigating. Over-limit input disables submit and shows the 1,000-character limit. |
| Journal | All three descriptions received through inspection, all retained visibly in the parchment cards. Inspection count changes after success; Review observation makes no API mutation. |
| Accusations and ending | Cancel button and Escape each continue active play; correct and incorrect server verdicts displayed. Ended gameplay disabled, received notes readable, replacement session clears history. Wrong-result text does not name the murderer. Cleared the stale cancellation notice from the conclusion. |
| Keyboard | Cancel-first focus; Tab/Shift+Tab wrap; Escape submits cancellation; original Accuse trigger regains focus. Confirmation moves focus to the conclusion heading. Fixed native focus-wrap/return behavior found by the first browser runs. |
| Layout and motion | Reviewed 1440×900 and 390×844 screenshots; 360px width, 720×450 reflow and desktop CSS zoom 200% have no page-level horizontal overflow. Reduced-motion removes transitions. Primary visible buttons are at least 44px high; labeled touch controls have adequate widths. Browser-chrome zoom shortcuts and external assistive technology were not separately tested. |
| Contrast | Palette checks pass: muted/panel 8.21:1, brass/panel 7.50:1, ivory/oxblood 7.14:1, journal secondary/paper 5.62:1; essential panel border 3.35:1. Art uses dark overlays with ivory/brass text. |
| Recovery | Actual API process termination retains the question draft and shows a friendly explicit-refresh path without retrying. Controlled browser fixtures cover stale revision, expiry and delayed replies. Pure-client tests cover timeout, lower revision, equal-revision ending and old-session completion rejection. |
| Privacy | Canary absent from public responses; DOM/console/storage do not contain session capabilities. Text resembling HTML remains inert. Server module and test-helper URL requests denied. Build/module-graph scan finds no forbidden server markers or source maps. Vite proxy errors now omit bearer URLs and internal stacks. |
| Fallbacks/collections | Missing Ben artwork and five synthetic public identities use the generic local portrait. Eight-card overview wraps correctly without changing the actual cast. No external art/font/model calls are required. |

Screenshots were opened and inspected for typography, distinct art, portrait identity, overlays, journal readability, dialog controls, focus and clipping. This is an assistant-operated browser walkthrough and visual review; it is not an external human playtest or a claim of screen-reader/browser certification.

Representative captures:

- [Desktop title](browser-screenshots/desktop-title.png), [locations](browser-screenshots/desktop-locations.png), [dialogue](browser-screenshots/desktop-dialogue.png).
- [Desktop journal](browser-screenshots/desktop-journal.png), [accusation](browser-screenshots/desktop-accusation.png), [conclusion](browser-screenshots/desktop-conclusion.png).
- [Mobile title](browser-screenshots/mobile-title.png), [dialogue](browser-screenshots/mobile-dialogue.png), [journal](browser-screenshots/mobile-journal.png), [accusation](browser-screenshots/mobile-accusation.png), [conclusion](browser-screenshots/mobile-conclusion.png).
- [Reflow](browser-screenshots/desktop-reflow.png), [200% CSS zoom](browser-screenshots/desktop-zoom.png). Additional full-page scene and overview captures are kept in the same directory. Native modal captures are full-page images; the dialog itself remains constrained to the visible viewport.

Remaining limits: page-memory notes are lost on reload; expired/restarted API sessions cannot be resumed; lost question replies cannot be reconstructed by GET. Current six-topic dialogue, global contacts and scene-only navigation reflect existing backend capabilities. Local SVG placeholders are intentionally replaceable. Verification uses Chromium only, with no external accessibility audit or live paid-model run.
