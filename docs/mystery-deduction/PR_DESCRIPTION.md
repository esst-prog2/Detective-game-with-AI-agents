# Suggested title

feat: Complete the mystery clue chain and evidence-aware endings

# Description

The intended Ashcroft solution relied on a cufflink connection players could not discover. This change lets Alice recognize the inspected cufflink's distinctive design while explicitly withholding certainty about ownership, a witnessed drop, or how/when it reached the study. It corrects Alice's debt concealment annotation without changing her original testimony, prioritizes essential questions within six choices, and explains correct verdicts using only recorded evidence/testimony. Supported and incomplete correct accusations are distinguished; wrong verdicts remain private and final.

All ten OpenSpec tasks are complete. A deterministic public-action engine/CLI/browser walkthrough and independent regression assertions cover discoverability, uncertainty, optional-clue omission, overflow, stale work, current exact-output authorization and ending privacy. Original topic testimony/fallbacks and historical evidence are preserved. The already-merged demeanor regression is inherited unchanged from main, not part of this PR's diff.

Validation on 2026-11-06:

- Complete Node suite: 361 passed, zero failures or skips on the final tree based on main 0318127.
- Explicit issue #3 knowledge-leak regressions: 81 passed; full suite retains them.
- Chromium: 40 passed across desktop/mobile using isolated listeners.
- Production build and source/artifact privacy: passed; no forbidden server markers or source maps.
- Strict improve-mystery-deduction and four archived-change validations: passed.
- Repository-wide strict validation: the same nine pre-existing long-description failures; no unrelated specifications changed.
- Whitespace checks: passed.

The user-reported player accused Clara correctly and found the contract most telling, but also found the contract/cufflink combination obvious and clarification replies sometimes repetitive or unhelpful. These are documented limitations, not an unqualified fairness pass. Harder mysteries, relationship-driven behavior, separate knowledge/belief/motivation/testimony and better clarification remain future design work. No live-provider safety or broad human-playtest certification is claimed.

The OpenSpec change remains unarchived until this implementation is confirmed merged into main. Archive/spec-sync edits must receive a separate review. Do not merge automatically.

See docs/mystery-deduction/verification.md and playtest.md for actual results, evidence and limitations.
