# Hybrid dialogue review ? 2026-10-16

Phase 3 preserves the illustrated rooms and large figures. Only server-issued options and received performance text are rendered; the browser has no testimony catalog or dialogue generator.

## Screenshots

- [Desktop interrogation, 1440?900 viewport](dialogue-screenshots/desktop-performance.png)
- [Mobile interrogation, 390?844 viewport](dialogue-screenshots/mobile-performance.png)
- [360px interrogation](dialogue-screenshots/mobile-360px.png)
- [200% CSS zoom/reflow](dialogue-screenshots/desktop-200-percent.png)
- [Mobile history](dialogue-screenshots/mobile-history.png)
- [Long option at 360px](dialogue-screenshots/long-option-360px.png)
- [Long reply, no options and null narration](dialogue-screenshots/long-reply-no-options-360px.png)
- [Twelve-contact fixture and generic portraits](dialogue-screenshots/twelve-contacts.png)

Captures are full-page PNGs; the viewport sizes describe the window before scrolling. Original room/HW4/HW5 captures and evidence were left intact. Synthetic layouts are test fixtures, not additions to the case.

## Visual observations

The assistant inspected actual PNGs: the room and figure remain prominent above the integrated dialogue overlay; narration is italic and separated from speech; labels and choices wrap without horizontal scrolling at 360px. Mobile uses a vertical option list and requires scrolling to the free-text form. History keeps each actual question, optional gesture and attributed answer together. Long speech scrolls within its focusable reply region; null narration leaves no blank box. Twelve contacts use existing overview flow and generic portraits. No numerical emotion values or truth badges appear.

The first zoom capture revealed that bottom-aligned figure artwork could put the face behind the dialogue. Top alignment corrected this; the regenerated 200% capture was inspected. CSS zoom plus narrow-viewport checks exercise reflow, but are not a claim of testing every browser's native zoom or assistive technology.

## Repeatable walkthrough

Run `node web/scripts/dialogue-walkthrough.mjs` from the repository root with locked dependencies and Chromium installed. It starts its own offline API on 127.0.0.1:3002 and Vite on IPv6 localhost:5173, refuses occupied ports, and stops only its own children. It captures the PNGs above and writes [observations](dialogue-screenshots/observations.txt). It never invokes a real model. Automated browser journeys additionally cover stale choices, delayed replies, independent sessions, lost replies and privacy attempts.

## Manual playtest checklist

Use `npm.cmd run start:api` and `npm.cmd run dev:web` in separate terminals (see README). This checklist is supplied for human review; the walkthrough exercised the corresponding controls automatically, followed by assistant visual inspection of the captures. No human or screen-reader certification is claimed.

- [ ] Start offline and open Alice. Confirm the large figure, room art and typography still feel cinematic.
- [ ] Type a draft, choose an offered question, and confirm that the draft remains untouched.
- [ ] Ask in free text with Enter. Check that speech is useful and remains distinct from optional italic narration.
- [ ] Choose clarification, repeat a topic, and read the history. Check actual questions, speaker attribution, optional gestures and guidance labels.
- [ ] Visit Ben before inspecting footprints: no footprint confrontation should appear. Inspect them in the garden and return: the authorized option should appear.
- [ ] Receive Alice's sighting, then Clara's sighting. Confirm that the engine offers the reviewed comparison without declaring either account true.
- [ ] Watch demeanor change through conversation. Confirm it supplies no numbers, guilt cues or hidden prerequisites.
- [ ] While a question is pending, read history/dossiers. Check that mutations stay disabled and the eventual reply belongs to its original speaker.
- [ ] Simulate connection loss or a stale option. Confirm the draft/notes remain and refresh is explicit; no command should replay automatically.
- [ ] Tab to choices and activate with Enter/Space. Check focus after changed options, return to room, dialog Close/Escape, and accusation cancellation. Repeat cancellation several times on desktop.
- [ ] At 390px, 360px and 200% native browser zoom, check wrapping, vertical scrolling, readable speech, visible figure, focus rings and reachable free text.
- [ ] Cancel an accusation, then confirm a correct or incorrect accusation in separate investigations. Review notes afterward; questioning, inspection and travel must remain disabled.
- [ ] Start a replacement investigation and verify that history, drafts and inspection notes reset.

## Contract and recovery

`client.ask(suspectId, question)` and `client.choose(suspectId, choiceId)` both POST to `/api/investigations/:id/questions` with `expectedRevision` and exactly one input field. The browser submits no choice label, inferred topic or clue meaning. `dialogue_option_unavailable` requires deliberate refresh, without replay.

Public `dialogue` contains `inspectedEvidenceIds` and per-suspect `demeanor`, `recentTurns` and `options`. A substantive result has `turnId`, `topic`, `cached`, `narration`, `dialogue`, `demeanor` and the compatibility `text` (equal to dialogue). Client validation enforces the public schema and limits, projects nested fields explicitly, and requires the result to match its attributed server turn. Narration and speech render as escaped text. No server catalog is imported by React.

Accepted snapshots merge turns by suspect and turn ID. A GET can recover a committed lost reply only within the server's eight-turn window; older actually received turns remain in browser memory. Guidance remains a clearly labeled local note. Reload loses the capability and all local notes. The API session remains in memory until expiry/restart, with no browser recovery mechanism. An inspected ID without an actually received description is labeled honestly and can be inspected again in its room while active; ended review never fetches missing descriptions.

Text and choices share the synchronous mutation gate, revisions, room/session generations and lifecycle checks. Refresh cannot clear a still-pending mutation indicator. Obsolete/ended-late question deliveries cannot append performance or change demeanor. Accusation focus returns after React removes the dialog and enables its trigger, rather than racing an animation frame.

Current expression mappings retain neutral placeholder artwork. No live-provider run, voice output, persistence, new case/cast, dialogue critic or full screen-reader audit was added. Alice's debt testimony/annotation inconsistency remains documented and unchanged; no private debt-letter or library facts became public. GitHub issue #3 remains open.

## Recorded verification

| Check | Actual result |
| --- | --- |
| Full Node suite | 207 passed, 0 failed/skipped; 10 added client/reducer regressions |
| Full Chromium desktop/mobile suite | 30 passed; 18 retained and 12 added journey executions |
| Production build | 39 modules; JS 257.87 kB / 79.32 kB gzip; CSS 26.86 kB / 6.47 kB gzip |
| Privacy | Browser source/import, runtime canaries/bearer/escaped markup, built-artifact markers and no-source-map checks passed |
| Strict OpenSpec | add-hybrid-dialogue-interface valid |
| Whitespace | git diff --check passed |
| Offline walkthrough | Both viewport modes passed; 15 PNG captures generated, selected captures visually inspected |

The desktop focus-return regression passed in both the retained full browser runs and the separate walkthrough; these results do not prove the absence of every possible timing or assistive-technology issue. Historical backend/case evidence remains unchanged by Phase 3.
