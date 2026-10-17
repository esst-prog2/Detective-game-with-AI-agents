# Homework 6 whole-repository review

Base: `49f6b07` (PR #8 merged `feature/richer-npc-dialogue`). Clean worktree verified; fetched origin, fast-forwarded main, then created `hw6-review` before review/test/edit work. Reviews run sequentially, each committed before the next starts. Date: 2026-10-17. Reviewer: Codex assistant.

Session 6, slide 24 of `06.pdf`, requires a new branch, whole-codebase specialized reviews one at a time, separate commits, and retaining the branch after merging. The user's request additionally requires a PR, a merge commit, and stopping before merge. No merge is authorized in this run.

Severity: high = security/data-integrity loss; medium = incorrect behavior or broken recovery; low = maintainability/documentation issue; informational = intentional limitation or evidence boundary.

| Order | Review | Result |
| --- | --- | --- |
| 1 | [Specification alignment](01-specification-alignment.md) | No new runtime violation confirmed; retained known content inconsistency and specification organization limitation |
| 2 | [Root causes](02-root-causes.md) | No new actionable defect; verified distinct ownership and staged commit guards |
| 3 | [Duplication/complexity](03-duplication-complexity.md) | Small duplication retained; independent boundary checks and fixture oracles preserved |
| 4 | [Failure handling](04-failure-handling.md) | Fixed medium-severity accusation modal recovery trap; four browser regressions pass |
| 5 | [Dependencies/dead code](05-dependencies-dead-code.md) | Removed unused SceneStage and 16 dedicated CSS rules; both audits clean |
| 6 | [Defaults/assumptions](06-defaults-assumptions.md) | Reject invalid resource limits instead of silently disabling caps/expiry; five targeted tests pass |
| 7 | [Hygiene/security](07-hygiene-security.md) | Sanitized future experiment errors; no confirmed credentials in tracked files/reachable history |

Historical HW4/HW5 evidence, canonical case/testimony and murder solution are unchanged. Alice's debt annotation conflict and issue #3 remain unresolved.

## Final verification (2026-10-17)

| Check | Actual result |
| --- | --- |
| `npm.cmd test` | 230 passed, zero failed/skipped; includes independent unit expectations and real HTTP/CLI integration |
| `npm.cmd run test:web` with isolated API 3002 / IPv6 Vite listener | 34 Chromium tests passed (17 desktop, 17 mobile), including both new lost-accusation recovery paths |
| `npm.cmd run build:web` | Passed; 39 modules, CSS 26.21 kB, JS 258.28 kB; module boundary, private-marker and no-source-map checks passed |
| Root and web `npm audit --json` | Zero known vulnerabilities, including web development dependencies |
| `openspec.cmd validate --all --strict` | 12 items passed, zero failed; only existing informational long-requirement notices |
| `openspec.cmd validate --archived --strict` | Four archived changes passed |
| `git diff --check` | Passed |
| Case/testimony/HW4/HW5 preservation | Base comparison found no changes in original case, authored deliveries, historical phraser, frozen testimony fixture, historical validator tests, spike evidence, dialogue-quality evidence or archived specs |
| Security/history review | 334 reachable unique Git blobs plus current tracked working files screened; no confirmed credential; generated output ignored |

Node/Vite initially required subprocess permission after sandbox EPERM; authorized reruns passed. Browser privacy probes deliberately received 403 for private server/test files. No live-provider request, historical experiment rerun or new human playtest was performed. The final commit count, clean worktree and remote synchronization are checked after committing/pushing, without adding a separate mixed-category commit.

## Remaining findings

- Medium: known Alice debt annotation/testimony conflict; preserved by explicit requirement.
- Medium: known opt-in historical lead-in validator semantic weakness tracked by issue #3. Normal runtime uses finite exact authorized pairs.
- Low: earlier implemented specifications remain in active-change directories rather than the canonical spec tree; all were consulted.
- Low: small duplicate performance-context and browser setup helpers retained because no concrete inconsistency justified refactoring.

GitHub CLI is not installed in this environment. Ready-to-use [PR description](PR_DESCRIPTION.md); [create the PR targeting main](https://github.com/esst-prog2/Detective-game-with-AI-agents/compare/main...hw6-review?expand=1). Push confirmation and all seven commit hashes are provided in the completion message. Do not merge until user review; eventually use Create a merge commit and keep the branch.
