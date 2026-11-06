Ashcroft startup previously assumed one case at every interface boundary. Milestone A adds the smallest private registry and session-selection foundation while retaining the existing default mystery, dialogue authorization, nested public view, results and endings.

## Scope and architecture

- Explicit server-only registry with validated, cloned and deeply frozen full-case packages. A thin adapter wraps unchanged Ashcroft data/catalog imports; only Ashcroft is published.
- Each session permanently binds non-writable case identity/version to a freshly constructed investigation. Inspections, dialogue history, emotions, caches, location, lifecycle and accusations remain session-local.
- Independent test-only harbor packages demonstrate different characters/rooms/evidence/solutions and deliberately overlapping local IDs. They are never production-registered or advertised.
- Optional CLI `--case`/`--list-cases`, a minimal browser manifest selector, case-envelope validation, fresh-note installation and existing stale-response guards.

## API compatibility and security

`GET /api/cases` exposes only published `{id,title,mode}` metadata and allocates no session or provider call. Creation accepts exactly `{}` (default Ashcroft) or `{caseId:"ashcroft"}`. Successful session envelopes add `data.case:{id,mode}` beside unchanged sessionId/revision/state/result fields; nested state/results are preserved. The frozen pre-change browser client still completes real HTTP play against the additive contract.

Unknown/unpublished/malformed selections return fixed 400 `invalid_request` before allocation. Session commands reject selectors as extra fields; foreign entity IDs absent locally return existing errors without revision changes. Shared local IDs resolve only within the selected game. No arbitrary file loading, new CORS origin, secret/public spreading, model-owned knowledge or relaxation of issue #3 exact-pair/commit authorization. Existing transaction, lifecycle and incorrect-accusation privacy protections remain enforced.

## Verification rerun

- Complete Node suite: **409 passed**, zero failed/cancelled/skipped/todo (matches reviewed baseline).
- Complete Chromium desktop/mobile suite: **46 passed**, 23 per viewport (matches baseline).
- Standalone unchanged issue #3 regressions: **81 passed** (matches baseline); explicit issue #3/public-view group: **86 passed**.
- Production build, import boundary, private-marker/source-map checks: passed.
- Deterministic public walkthrough: 11 engine actions plus complete actual CLI journey; CLI case-list smoke passed. No live model calls or dependency changes.
- Strict `multi-case-foundation` and preserved planning change: passed. Five archived changes: passed. Planning checker: 629 assertions passed.
- Staged whitespace and scope checks passed. Historical mystery evidence is preserved, not replaced by test-generated captures.

Repository-wide strict validation remains **6 passed / 9 inherited failures**: changes add-investigation-http-api, add-playable-browser-interface, add-room-based-investigation, enforce-investigation-lifecycle, expose-safe-investigation-view; specs hybrid-dialogue-interface, npc-dialogue-naturalness, safe-npc-performance, stateful-npc-dialogue. These are existing >500-character requirement descriptions, with no new failure or unrelated spec rewrite.

## Planning ancestry and references

Base is **main**. The branch intentionally includes planning checkpoint `0b36bf1`, not yet present on main, followed by the Milestone A implementation commit. That checkpoint preserves the approved 33-file `design-relationship-driven-mystery` narrative/technical planning package and historical log. It is directly related context, not implementation of later stages; no unrelated branch or worktree is included and no history is rewritten.

Implementation specifications/tasks: `openspec/changes/multi-case-foundation/`. Approved roadmap and A1-A4 acceptance: `openspec/changes/design-relationship-driven-mystery/greyhaven-implementation-roadmap.md`. Exact contract, changed-file inventory, review findings and saved verification outputs: `docs/multi-case-foundation/implementation.md`.

## Limits and deferred work

Only Ashcroft is publicly playable; multi-case proof uses injected fixtures. Updated browser requires updated API/restart. Sessions and notes remain ephemeral; authored prose still requires editorial review. Preview/sparse-topic support and trusted ending-resolver extraction remain deferred under the approved exclusion of new accusation logic. No human fairness/visual acceptance is claimed.

Milestones **B-F remain planning-only and unstarted**: relationship disclosure, contextual clarification, Greyhaven preview, full content and case-specific endings. No approved narrative, original engine/dialogue/demeanor/ending logic, canonical specification or unrelated archive was changed. No automatic merge, branch deletion, archival or next-milestone work.
