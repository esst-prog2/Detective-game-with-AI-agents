# Current dialogue audit

This is executed pre-change evidence from the current uncommitted three-phase implementation, not a result for the proposed refinement. No production file was changed and no model/network call was made. The raw 108 replies (18 questions ? three NPCs ? two modes), exact input order, setup, runtime and source SHA-256 fingerprints are in [audit-baseline.json](audit-baseline.json).

## Source findings

| Area | Observed cause | Planned remedy |
| --- | --- | --- |
| `src/data/dialogue-catalog.js` | Two variants per core: original plus one identical NPC-wide calm prefix | Reviewed whole utterances with explicit meaning/stance review |
| `src/dialogue-state.js` | Subsequent topics reuse calm prefix; repeat/clarify/pressure reuse fixed introductions; offline gesture every third delivery | Shared context-aware delivery pool, bounded speech variety and sparse context gate |
| `src/authored-performances.js` | Four pairs generally expose only two speech strings; prefix concatenation and three rotating gestures | Structurally distinct current speeches and explicit sparse pairs |
| `src/game.js` | New authored pool runs only when a performer exists; cache checks safety but not recent speech variety | One new-mode pool for offline/provider; eligible-set hash after variety filtering |
| `src/npc-performance.js` | Strict verbatim current-pair selection correctly forbids creative repairs | Preserve validator/schema/bounds; improve authored inputs |
| Browser demeanor | Always-visible technical explanation in every dialogue | Short existing-value label with accessible unobtrusive help |

## Measured baseline

Signature frequency counts the NPC-specific phrase at the start of a reply, ignoring case/punctuation. Pressure opening is the most frequent fixed pressure phrase; full raw replies and normalized first-four-word counts are saved. These metrics do not assess whether a live model would make the same selections.

| Mode | NPC | Reported introduction | Fixed pressure opening | Narrated / 18 | Speech only / 18 | Cache hits |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| offline | alice-mercer | 5/18 | 9/18 | 6 | 12 | 1 |
| offline | ben-carter | 5/18 | 8/18 | 6 | 12 | 1 |
| offline | clara-voss | 5/18 | 8/18 | 6 | 12 | 1 |
| fake-last-pair | alice-mercer | 4/18 | 9/18 | 13 | 5 | 0 |
| fake-last-pair | ben-carter | 4/18 | 8/18 | 13 | 5 | 0 |
| fake-last-pair | clara-voss | 4/18 | 8/18 | 13 | 5 | 0 |

Offline uses each of the three original gestures twice. The injected last-pair selector uses one gesture five times and the other two four times. Last-two-gesture exclusion already works, but cannot prevent a recognizable three-item cycle or excessive narration. Most repetition predates cache hits; removing the cache alone would not fix the catalog.

## Reproduction and evidence interpretation

Each report row records its ordered 18 questions and all received public performance fields. Create a fresh investigation per row; for `fake-last-pair`, inject `perform: async context => context.performances.at(-1)`. Apply the recorded setup using `travelTo`, `inspectPublicEvidence`, and the ordinary `askSuspect` method, then call `askSuspect` with each recorded question. The probe asserted `kind === answer` for every measured reply. Clara?s extra Alice sighting and setup inspections are outside the measured 18 turns; her comparison occurs only after her own sighting. Alice and Ben receive no fabricated cross-witness comparison.

The first probe attempt used a nonexistent inspection method and stopped before creating evidence; the corrected run used the actual public inspection API and produced every row in the JSON. No partial attempt is counted. The proposed implementation task will turn this fixed scenario into the repeatable evaluation command and expand fake-selector modes; no evaluator or production behavior was implemented during planning.

## Test compatibility review

Keep original case checksum, first ordinary plain responses, Alice motive/sighting, independent legacy phraser/HW5 A/B/C tests, API schema, lifecycle/session/privacy/race tests. `test/npc-performance.test.js` currently asserts every performance contains the entire original string and clarification contains a fixed prefix; `test/stateful-dialogue.test.js` makes similar all-turn substring assumptions. Those specific assumptions must be replaced only for reviewed later full-utterance alternatives, with independent approved full-string and proposition/stance fixtures, exact pair membership/rejection and unchanged original compatibility checks. Do not replace them with nonempty, substring keyword counts, or expected values derived solely from the production catalog. Gesture-loop and cache tests retain their original isolation, boundedness and stale-rejection guarantees, adding recent-speech and cooldown assertions. Browser label tests must verify the explanation remains accessible after it is removed from the always-visible overlay.
