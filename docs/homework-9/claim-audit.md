# Promotional content evidence

Prepared during gstack office-hours, 2026-11-13. This is an internal authoring record, not a file to copy into the public site artifact.

| Proposed claim | Repository evidence | Public wording boundary |
|---|---|---|
| Complete Ashcroft investigation | README.md, src/cases/ashcroft.js, src/data/case.js, src/game.js | Say one complete murder investigation; no length, difficulty or replayability promises. |
| Three suspects and three rooms | Public dossiers and room definitions in src/data/case.js; README room table | Alice: housekeeper; Ben: gardener; Clara: business partner. Do not copy private personality, motive, alibi truth labels or private facts. |
| Evidence inspection | src/data/case.js public evidence names; README | Name the torn contract, silver cufflink and muddy footprints without interpreting their significance. |
| Illustrated room exploration and conversations | web/src/presentation/asset-manifest.js; docs/room-browser-playtest.md; docs/hybrid-dialogue-playtest.md | Actual screenshots are proof; illustrations establish atmosphere rather than case facts. Character figures are temporary artwork. |
| Suggested and free-text questions | README.md; docs/hybrid-dialogue-playtest.md | Visitors can choose a suggested question or type their own. Do not imply every question receives a novel or useful response. |
| Separate knowledge and conversation memory | src/game.js, src/dialogue-state.js, src/dialogue-policy.js; README.md | Each suspect has their own information and remembers the conversation within an investigation. No unlimited learning or persistent cross-session memory claim. |
| Distinct demeanor and reviewed speech | src/dialogue-state.js and src/npc-performance.js | Characters have different ways of responding. Do not say expressions reveal guilt or that AI decides what is true. |
| Evidence can affect questioning | README.md; docs/greyhaven-preview/implementation.md; src/dialogue-policy.js | Evidence opens relevant questions; in the preview it can also lead to a revised account. Do not promise every clue changes every suspect's answer. |
| Final accusation | README.md; src/game.js; src/mystery-conclusion.js | Ashcroft ends with an accusation and result. Greyhaven preview has no murder verdict. |
| Greyhaven playable preview | README.md; src/cases/greyhaven-preview.js; docs/greyhaven-preview/implementation.md | Two characters, two locations, two repair records, account revision and clarification; clearly incomplete as a murder mystery. |
| Offline mode and optional AI | README.md; src/npc-performance.js (environment selection and verbatim authorized performance contract) | Offline deterministic mode works without an AI key. Optional AI selects reviewed responses server-side; no autonomous invention. |
| Local setup | Root package.json, web/package.json, web/vite.config.js, README.md | Install root and web dependencies, run API and frontend in separate terminals, visit 127.0.0.1:5173. GitHub Pages does not run the game API. Commands still need a final smoke check against the published copy. |

## Screenshot review so far

- `docs/room-screenshots/desktop-study.png`: visually inspected; room, Alice's public dossier and names of uninspected clues. No solution or accusation result visible. Historical capture, before later case-switch UI; do not describe it as a fresh current-build capture.
- `docs/room-screenshots/desktop-alice.png`: visually inspected; Alice's opening alibi, question field and public name/role. No truth label or murderer revealed. Historical capture predates later suggested-question UI; prefer a newer reviewed capture for the final dialogue section.
- No conclusion or accusation-result capture is approved for public use.

## Research used for framing

With user permission, searched general category terms only. Aside is absent on this Windows host; used the available web search tool as gstack permits.

- https://guilty-or-not.com/ — action-led premise and investigation sequence; no mechanics or marketing claims were copied.
- https://hkattt.itch.io/interrogation — a short, understandable murder-mystery explanation and explicit open-source link.
- https://www.youdetectivegame.com/ — useful contrast: voice, board and rank claims are specific to that game and are not supported here.

Conventional pattern: explain the player's actions and show genuine gameplay. Project-specific inference: the evidence/testimony comparison is a stronger first explanation than the technical term AI agent. This is a content judgment, not a user-testing finding.
