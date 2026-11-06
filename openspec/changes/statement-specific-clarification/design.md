## Context

Merged Milestone B supplies owned cores, committed receipts, account maps and candidate transactions. C extends those mechanisms; it does not add an interpreter or second commit path.

## Goals / Non-Goals

Provide finite meaning/identity/source/time/certainty facets and deterministic contextual targeting. Preserve v1, public contracts and exact-pair authority. Do not author Greyhaven content or implement D-F.

## Decisions

Optional policy.facets opts into C. Each facet owns a primaryStatement, accountVersion (null for non-account statements), type, response core, label, aliases, default flag and finite gate. Optional historicalCoreId is a separately authored correction, eligible only with the old receipt and a committed current account. Whole aliases can name an explicit target; generic finite facet questions use the committed per-speaker primary target. Facets focus their received primary rather than their own response core, preserving its origin; a historical focus never restores a current account. Unknown/ambiguous/locked references give non-mutating guidance.

Essential rules declare essential:true; base suggestionPriority:1 denotes route-critical questions. A conservative per-speaker authoring budget of four essential entries bounds all simultaneous first-time states. Essential evidence/comparisons precede essential bases, then one eligible contextual facet; remaining slots rotate eligible optional choices. All eligible aliases remain available by text.

## Risks / Trade-offs

Whole authored aliases are deliberately bounded rather than general language understanding. The conservative essential budget may require careful content authoring in D/E. Historical correction wording and gates require editorial review; structural validation cannot certify prose fairness.
