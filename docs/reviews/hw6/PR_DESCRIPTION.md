HW6: Whole-repository specialized code reviews

Seven specialized reviews examined the whole repository sequentially, each in its own commit, from merged milestone `49f6b07`. Reports and testing-quality assessment are in `docs/reviews/hw6/`.

| Review | Findings and action |
| --- | --- |
| Specification alignment | Compared canonical and older active-change specs; documented fragmented spec coverage and retained Alice's known debt inconsistency. No new runtime violation confirmed. |
| Root causes | Traced repetition, emotional transitions, caches, lifecycle, provider recovery and engine/session/browser guards. No speculative refactor. |
| Duplication | Preserved independent boundary validation and literal regression oracles; small stable duplication did not justify consolidation. |
| Failure handling | Fixed modal trap after a lost accusation reply. Local dismissal retains uncertainty, never replays the accusation, and permits explicit refresh. |
| Dependencies/dead code | Removed unreachable SceneStage component and 16 exclusive CSS rules. All direct dependencies have consumers; no upgrades. |
| Defaults/assumptions | Reject malformed resource limits that silently bypassed session/question caps or idle expiry. Defaults unchanged. |
| Hygiene/security | Scanned tracked files and reachable Git blobs; no confirmed credentials. Sanitized future experiment error records/console output; historical evidence unchanged. |

Validation: 230 Node tests; 34 Chromium desktop/mobile tests; production build plus module/artifact privacy checks; root/web npm audits with zero known vulnerabilities; strict OpenSpec validation (12 current items and four archives); `git diff --check`. Reports distinguish fixed-input unit oracles, real component integration and finite editorial/quality evidence.

Remaining risks: known Alice debt annotation conflict (medium), legacy lead-in/issue #3 limitation (medium, opt-in trusted seam), fragmented canonical specification coverage and small retained helper duplication (low). No live model evaluation, new human playtest or screen-reader certification is claimed. Mystery solution, original case/testimony and HW4/HW5 evidence are unchanged.

Await user review before merging. When approved, use **Create a merge commit**, never squash; **retain `hw6-review`**.
