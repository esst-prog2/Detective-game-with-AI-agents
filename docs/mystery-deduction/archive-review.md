# Mystery-deduction archive review

Date: 2026-11-06. Branch: chore/archive-improve-mystery-deduction, based on main d37d900.

## Merge and completion verification

[Implementation PR #12](https://github.com/esst-prog2/Detective-game-with-AI-agents/pull/12) is closed and merged; GitHub reports merge commit d37d9004b89f2a532f2a9462501e0cb5042ec15b. The implementation commit fceff9b is an ancestor of remote main, and the merged tree matches the reviewed implementation tree. Local main was synchronized using fast-forward only before this separate review branch was created. The demeanor worktree and all existing branches were retained.

All ten tasks are checked complete. The reviewed implementation retains explicitly uncertain, inspection-gated recognition, original topic testimony/fallbacks, accurate debt concealment, essential-choice priority, recorded-support conclusions and private incorrect outcomes. Existing actual engine/CLI/browser evidence and user-reported playtest findings support the assessment. The playtest's concerns about obvious clues and repetitive/unhelpful clarification are preserved; task completion does not certify satisfactory difficulty or conversational depth.

## Canonical sync and archive

Used the OpenSpec archive workflow with its inline spec-sync instructions and resolved repo-local paths. Created canonical `mystery-deduction` with its original Purpose, six requirements and all scenarios. Updated only the approved first requirement in each of `stateful-npc-dialogue` and `npc-dialogue-naturalness`, preserving their existing scenarios and adding the reviewed recognition scenarios. All unrelated canonical content was compared with main and is unchanged.

Verified every complete delta requirement block was present in the canonical result before invoking `openspec archive improve-mystery-deduction --skip-specs --yes`. The flag avoided repeating already-verified synchronization; canonical synchronization was not omitted. The CLI moved only this completed change to [2026-11-06-improve-mystery-deduction](../../openspec/changes/archive/2026-11-06-improve-mystery-deduction/).

SHA-256 comparisons confirmed all 24 original files across the change directory and docs/mystery-deduction were preserved byte-for-byte, including hidden change metadata, deduction audit, proposed walkthrough, original verification report, transcripts, screenshots, validation captures, PR description and playtest findings. Archive review documents are new files; original evidence was not rewritten. No runtime source, tests, assets, packages or unrelated archives/specs changed.

## Executed verification

| Check | Actual result |
| --- | --- |
| Pre-archive `openspec validate improve-mystery-deduction --strict` | Passed |
| Post-sync `openspec validate --specs` | Five canonical specs passed, zero failed; existing long-description warnings retained |
| New canonical `openspec validate mystery-deduction --type spec --strict` | Passed |
| `openspec validate --archived --strict` | Five passed, including this new archive; zero failed |
| `npm.cmd test` after archival | 361 passed; zero failed/cancelled/skipped/todo, including mystery, demeanor and issue #3 regressions |
| Delta/canonical verification | Six added and two modified requirement blocks match the approved deltas; original scenarios and other requirements preserved |
| Task/evidence checks | 10/10 tasks complete; 24 original artifact/evidence fingerprints unchanged; no active-change path references in application/test/script source |
| `git diff --check` and staged whitespace checks | Passed |
| Repository-wide `openspec validate --all --strict` | Four passed, nine failed, the same nine known long-description items; no additional failure |

A read-only Node/Git comparison initially hit sandbox `spawnSync git EPERM`; its authorized rerun passed. No failed check was reported as passing. Browser/build were not rerun for this documentation/spec-only branch; their existing 40-test Chromium and production/privacy results remain preserved as implementation evidence, and no application/browser source changed.

## Remaining repository-wide strict failures

The current CLI treats descriptions over 500 characters as fatal in strict mode. Existing failing changes: add-investigation-http-api, add-playable-browser-interface, add-room-based-investigation, enforce-investigation-lifecycle and expose-safe-investigation-view. Existing failing canonical specs: hybrid-dialogue-interface, npc-dialogue-naturalness, safe-npc-performance and stateful-npc-dialogue. The two legitimately synchronized dialogue requirements still belong to already-failing spec items; no unrelated restructuring was attempted. The newly created mystery-deduction spec and new archived change pass strict validation.

## Review boundary

The archive and canonical sync are complete on this branch and require a separate PR review. GitHub CLI is unavailable; use the [comparison link](https://github.com/esst-prog2/Detective-game-with-AI-agents/compare/main...chore/archive-improve-mystery-deduction?expand=1) and [ready-to-use PR text](ARCHIVE_PR_DESCRIPTION.md). No archive PR merge, branch deletion or next-milestone work is performed here.
