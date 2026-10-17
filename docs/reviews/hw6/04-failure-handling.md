# Review 4: Silent errors and failure handling

## Scope and method

Whole repository exception/promise/fallback audit: runtime and browser modules, HTTP parser/session lifecycle, AI adapters, scripts/walkthroughs, tests, configuration, specifications and historical documentation/output. Enumerated `catch`, `.catch`, `void` and logging sites with `git grep`; traced error ownership, state release and player recovery. Examined both malformed provider output and network receipt loss. No paid provider calls.

## Confirmed finding and fix

**Medium, fixed: lost accusation receipt trapped the player in the modal.** In `web/src/components/AccusationDialog.jsx:16`, `decide` previously required `canAct` for cancellation, and Cancel was disabled whenever `canAct` was false. A failed/uncertain confirmation sets browser uncertainty, which makes `canAct` false. Escape called the same blocked function. If the API could not be refreshed, even reading local notes was inaccessible behind the modal. This affected both a committed ending with lost receipt and an unreceived request.

Added a local-only close path when no request is pending and actions are unavailable. Escape and the explicitly labeled **Close dialog** dismiss the modal without issuing another accusation, clearing uncertainty, claiming cancellation or reopening gameplay. An active ordinary Cancel still sends `confirmed:false`; pending commands keep dismissal gated. Existing refresh then reconciles the server's authoritative outcome.

Regression: `web/e2e/game.spec.js:85` makes the real server commit an accusation, drops only the response, then dismisses by Escape or Close dialog. It verifies game actions remain disabled, local notes can be navigated, explicit refresh recovers the correct ending and only one accusation POST occurred.

## Other paths and disposition

- Engine provider/validation failures choose a permitted deterministic fallback; stale fallback cannot commit (`src/game.js:173`). Cache invalidity deletes only the staged entry before reselection.
- Configured performer wraps provider failures in fixed errors, races abort/deadline and removes listeners/timers (`src/npc-performance.js:45`). Expected offline fallback remains intentionally quiet; provider detail/credentials are not logged.
- HTTP errors expose fixed envelopes, not exceptions/session tokens (`src/http-api.js:182`); session finally blocks release reservations and global question capacity (`src/investigation-sessions.js:89`). Transport error suppression is intentional after safe response/disconnect handling.
- Browser client catches network/protocol failures and explicitly marks uncertain receipt, preserves drafts/notes and never automatically replays mutations (`web/src/api/investigation-client.js:170`). Fire-and-forget form actions call this self-handling client. Artwork fallback is bounded to one replacement, not an infinite retry.
- Informational limitation: generic runtime provider/internal errors provide little operator diagnosis by design. No raw-error logging was added because messages can contain provider text or bearer paths. Historical experiment records intentionally contain diagnostic output; their future-write privacy is reviewed in category 7.

## Verification

Before fix: new Escape regression failed on desktop and mobile (modal count 1 instead of 0). After fix: **4/4 Chromium regressions passed**, covering both dismissal methods on both viewports, against isolated real API/Vite servers (`E2E_API_PORT=3002`, `E2E_ISOLATED=1`). Full browser suite will run in final verification. This is an integration regression for an observed recovery defect, not a test of the implementation's chosen strings alone.
