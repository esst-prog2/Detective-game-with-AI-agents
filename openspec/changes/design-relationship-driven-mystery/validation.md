# Greyhaven technical-planning validation and handoff

Date: 2026-11-06. Same branch feature/design-relationship-driven-mystery at 52a7c433b6c63995e6d226511a3e5cc3cd58533d. Existing dirty planning work preserved; no fetch, reset, branch switch, merge or duplicate change. A new temporary pre-technical snapshot records 25 existing planning files/log and SHA-256 fingerprints of 307 tracked files outside this change/log.

## Executed checks for this planning phase

| Check | Actual result |
| --- | --- |
| Strict selected change | openspec.cmd validate design-relationship-driven-mystery --strict passed; skip_specs remains appropriate for documentation-only changes |
| Existing documentation checker, extended in place | Passed 629 documentation assertions, or 950 with snapshot scope/preservation checks, across 33 files:30 Markdown, approved JSON fixture, metadata YAML and existing documentation-only MJS checker |
| Narrative preservation | Approved oracle semantic payload hash unchanged; all 11 narrative bodies equal their pre-approval copies after removing only the administrative approval banner |
| Existing narrative checks |13 events, six-person occupancy, nine observation rows, source/gate/literal references, two four-item/eight-account routes,20 facet bodies and 34 future acceptance cases remain consistent |
| New roadmap checks | All 8 requested technical documents linked; A-F order/dependency fields,21 unstarted future packages, preview constraints, protocol boundary, approval register and 32 planning-task entries checked |
| Scope/log preservation | With --baseline, all 307 protected files match original bytes and complete pre-technical log is an unchanged byte prefix |
| Whitespace | git diff --check plus new/untracked-file whitespace/final-newline scan passed |
| Repository-wide strict | openspec.cmd validate --all --strict:5 passed/9 inherited failures,14 items; names below |

Reproduce documentation checks from the repository root:

```powershell
node openspec/changes/design-relationship-driven-mystery/check-greyhaven-design.mjs
openspec.cmd validate design-relationship-driven-mystery --strict
git diff --check
```

The optional --baseline <temporary-snapshot-directory> adds protected-file hashes/log-prefix and narrative-body preservation checks. Without that local snapshot the checker reports protectedFiles:null, not a fabricated scope verification. The new phase preserves/extends the existing checker; no production test file is added or modified. The baseline semantic hash and approval meaning are recorded in [implementation decisions](greyhaven-implementation-decisions.md).

This verification checks references, declared coordinates/roles/limits, unchanged approved payload/body and planning coherence. It does not execute any roadmap package, produce a playable preview, prove that every proposed API design is correct, or certify human enjoyment/fairness. Previous 508/818 narrative-review assertion counts are historical; the extended checker reports its own current counts.

No production Node suite, Chromium tests, build, paid model call or provider experiment was run. Runtime source, tests, assets/dependencies, canonical gameplay specs, archive and prior review evidence remain unchanged. Original case behavior is preserved in files, not newly certified by running its suites. No commit, push, merge or archive occurred.

## Nine inherited repository-wide strict failures

Installed strict validation still rejects existing requirement descriptions longer than 500 characters:

- Changes: add-investigation-http-api; add-playable-browser-interface; add-room-based-investigation; enforce-investigation-lifecycle; expose-safe-investigation-view.
- Canonical specs: hybrid-dialogue-interface; npc-dialogue-naturalness; safe-npc-performance; stateful-npc-dialogue.

No unrelated specification was edited to hide these failures. The selected planning change passes; repository-wide validation remains nonclean.

## Technical-review handoff

The revised story is approved as implementation-planning baseline, with story bodies retained under clear approval banners. [Roadmap](greyhaven-implementation-roadmap.md) defines six stages/21 unstarted packages; [gap analysis](greyhaven-architecture-gap-analysis.md) anchors them to actual code; [regression strategy](greyhaven-regression-strategy.md) defines independent future expected outcomes. [Preview design](greyhaven-vertical-slice.md) explains the two-character O1 excerpt, missing-witness constraint on M1 and absence of a preview verdict.

T-01..T-10 remain proposed architecture/UX/contract choices, including additive data.case metadata, bounded policy, preview-only subset validation and case availability. N-01/AC-HIDE preserves a choice to conceal without inventing physical inability to leave; AC-BELL requires understandable received descriptions/questions/journal reading. Human playtesting remains required. No story adjustment is made; any implementation-driven new fact/wording must be separately reviewed.

Next step is technical approval and scoped first-increment specification/authorization. No implementation starts from the completed planning checklist alone.
