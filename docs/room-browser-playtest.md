# Room and character playtest

Expected checks, recorded before the walkthrough:

1. Restart the API and frontend for the new contracts. Start in the illustrated study with Alice and the contract/cufflink; no Ben/Clara immediate interrogation.
2. Inspect study clues. Travel to the library: Clara, no clues. Travel to the garden: Ben and footprints. Returning retains notes; positions are current interview locations, not alibi proof.
3. Open each public dossier: only reviewed role/employment/partnership/background. No invented family links, debts, dismissal threat or concealed losses.
4. Select each present person: dominant separate large figure within the room, name and cinematic reply/input overlay, natural Return to room. Figures are temporary SVG placeholders, not enlarged cameo assets.
5. Ask supported/unsupported questions; confirm actual received replies/guidance. Check 1,000-character limit, long-text scrolling, drafts, pending state, history/dossier focus and clear errors.
6. Read received notes globally. Remote unreceived clues/contacts offer travel; no automatic questioning or inspection. Empty and multiple-inhabitant fixtures wrap and remain navigable.
7. Cancel accusations by button/Escape, then confirm each outcome in independent investigations. Review known notes, reject post-game travel and reset history on new investigation.
8. Use Tab/Shift+Tab/Enter/Escape. Check readable contrast, 44×44 primary controls, mobile 390×844/360px, desktop 1440×900, reflow/200% zoom, reduced motion and no horizontal overflow.
9. Check pending travel/question overlap, stale revision/session expiry, interrupted API recovery and no automatic replay; retain drafts/known notes.
10. Inspect screenshots, console/storage/DOM/network/build and public canaries; no private canon/prompts/credentials, remote model calls or unintended bearer logging. Missing figures retain a named usable fallback.

## Actual observations

The assistant completed the separate Chromium walkthrough using `node web/scripts/room-walkthrough.mjs` with the actual deterministic HTTP API and browser controls. Its server helper constructs no model adapter, regardless of ambient model settings. [Recorded observations](room-screenshots/observations.txt) cover both desktop and mobile journeys. Existing manual-play processes were left running; the walkthrough used a separate API port and IPv6 local frontend listener.

| Area | Actual result |
| --- | --- |
| Rooms | Study starts with Alice/contract/cufflink; library has Clara/no evidence; garden has Ben/footprints. All navigation explicitly travels; room card headings are not treated as successful arrival. |
| Dossiers | Authored public role, employment/partnership and short background only. No family links invented or private character fields published. |
| Cinematic composition | Each person has a separate dominant standing figure over the existing illustrated room and a bottom dialogue/input overlay. Cameos remain in overview/room entries. Refined Alice's pinned-up silhouette and Clara's longer hair after image review; all four figures are explicitly temporary placeholders. |
| Dialogue/history | Actual supported replies and unsupported guidance, 1,000-character limit, secondary history/dossier, Escape/Close and focus return all worked. Controlled long-text browser fixtures verify bounded readable scrolling without hiding input or replacing the NPC answer. |
| Evidence/endings | All clues inspected in the correct rooms; notes stay globally readable. Button/Escape cancellation remain active. Correct and incorrect endings in separate sessions retain server text; post-game travel is disabled and new sessions clear notes. |
| Races/recovery | Direct engine/HTTP tests cover remote/cache/guidance rejection, leave-and-return epoch checks, cached-answer commit races, overlap in both directions, revision/expiry and independent sessions. Actual API process loss retained the draft, offered refresh and did not replay a mutation or log bearer/stack data. Out-of-page ending is reconciled to its authoritative conclusion on refresh. |
| Responsive/accessibility | Reviewed 1440×900 desktop and 390×844 mobile imagery, 360/720px reflow, desktop CSS zoom 200% and reduced motion. Keyboard dialog/history focus and primary touch controls pass browser checks; existing palette contrast checks remain passing. No page-level horizontal overflow. Native browser-chrome zoom shortcuts and external assistive technology were not separately audited. |
| Privacy/fallbacks | Public canaries, DOM/console/storage checks, escaped HTML-like text, denied server/test-helper URLs and build graph/artifact checks pass. Missing figures/cameos use local generic art; synthetic empty/multiple-inhabitant collections do not expand the real cast. |

Screenshots opened for actual visual inspection include [desktop study](room-screenshots/desktop-study.png), [Alice](room-screenshots/desktop-alice.png), [Clara](room-screenshots/desktop-clara.png), [Ben](room-screenshots/desktop-ben.png), [history](room-screenshots/desktop-history-ben.png), [mobile Alice](room-screenshots/mobile-alice.png), [mobile Ben](room-screenshots/mobile-ben.png), [journal](room-screenshots/mobile-journal.png), [conclusion](room-screenshots/desktop-conclusion.png) and [200% CSS zoom](room-screenshots/desktop-zoom.png). Other room/figure/mobile captures are retained in the same directory. Long-text fixture captures are generated in ignored Playwright test output.

An intermediate walkthrough was interrupted by a development hot reload while source files were being edited; the final complete run was performed after those edits and passed. This is an assistant-operated real-browser walkthrough and visual review, distinct from automated assertion counts. No external human usability, cross-browser or screen-reader certification is claimed.

Remaining limits: static placements and one case; no NPC movement, emotions, expression inference or new knowledge system. Figure artwork is temporary. Notes/session capability live only in page memory; reload/development full reload, API restart and expiry lose resumption. Lost replies cannot be reconstructed from GET. An invalidated provider operation may still finish/bill server-side, but cannot publish/cache obsolete dialogue. Existing dialogue safety limitations and issue #3 remain unchanged.
