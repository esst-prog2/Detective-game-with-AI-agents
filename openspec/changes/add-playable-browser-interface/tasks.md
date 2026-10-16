# Tasks

## 1. Frontend boundary and visual foundation

- [x] 1.1 Create the isolated web package with React/Vite/JavaScript/CSS and Playwright dev tooling, web-only import/file access, strict local port/proxy and root convenience scripts while preserving existing start/API/test scripts; verify dependency compatibility, frontend build and no backend imports or extra runtime frameworks.
- [x] 1.2 Implement the plain-JavaScript API client/reducer and React provider with memory-only session capability, exact request bodies/public projections, immediate mutation gate, 15-second timeout, revision/generation/request checks and uncertainty recovery; verify duplicate submits, malformed envelopes, old-session/lower-revision results, equal-revision ending, expiry and no accusation replay with focused Node tests.
- [x] 1.3 Add centralized visual tokens, responsive primitives, local illustrated title/three scene assets, distinct portrait cameos, neutral clue icons and replaceable presentation manifest with accessible missing-asset fallbacks; verify all manifest content is public/decorative, artwork is distinct and no image service, external fonts or solution metadata are required.

## 2. Complete current-case browser experience

- [x] 2.1 Implement main menu, public introduction, location-card selection, scene stage and global navigation/contact/clue trays; verify starting creates exactly one session and scene browsing changes presentation without gameplay requests, location locks or invented NPC/evidence placement.
- [x] 2.2 Implement suspect overview and portrait dialogue form/history using only public identities, generic roles and actual received testimony/guidance; verify typed supported/unsupported questions, loading/error states, question limits, correct attribution when navigating during requests and no fabricated replies/private profile fields.
- [x] 2.3 Implement the evidence journal with available/inspected-in-this-browser labels and received descriptions; verify inspection markers update only after success, repeated note viewing makes no mutation, all clues remain available from every scene and post-game review uses only known observations.
- [x] 2.4 Implement selection/confirmation dialog, Boolean confirm/cancel/Escape commands, authoritative correct/incorrect conclusion and explicit new investigation; verify focus/duplicate guards, no gameplay after ending, no wrong-result murderer reveal, clean local-history reset and late old-session response isolation.

## 3. Accessibility, privacy and release verification

- [x] 3.1 Complete keyboard/focus/live-status/reduced-motion behavior and responsive layouts; verify 44-pixel primary touch targets, contrast thresholds, desktop/mobile/narrow layouts, no horizontal page overflow and 200-percent zoom against the capability spec and capture visual-review screenshots.
- [x] 3.2 Add Playwright real-browser/current-API offline journeys plus controlled error/latency fixtures; verify start/state/scenes/suspects/evidence, dialogue, cancellation/confirmation/both outcomes, duplicate prevention, 409/expiry/network recovery, missing art, keyboard navigation and a public-only larger collection fixture without adding real characters.
- [x] 3.3 Verify privacy using server-only canaries, frontend import/module-graph checks, built bundle/source-map/asset inspection and browser console/DOM/storage checks; confirm escaped text rendering, no server data/prompts/keys or unintended bearer exposure, no model calls from browser and no mutation of backend/HW4/HW5 evidence/tests.
- [x] 3.4 Create docs/browser-playtest.md from the design checklist, record expected then actual real-use/visual/accessibility observations with screenshots and fix failures; update README launch/build/test/recovery/unsaved-history instructions and append planning decisions/results without rewriting earlier entries. Do not substitute mocks or passing DOM tests for actual visual/manual review.
- [x] 3.5 Run all existing tests plus client-state tests, web build, browser tests, strict OpenSpec validation of add-playable-browser-interface and git diff --check; record counts/statuses and review final scope/credentials/assets. Leave code uncommitted and changes unarchived without push/merge until user review.
