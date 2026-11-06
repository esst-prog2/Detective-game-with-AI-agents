# Proposed character and disclosure model

**Proposed general model, not implemented.** Greyhaven is now selected for detailed design; this earlier assessment remains background. Its illustrative examples are not the canonical event oracle. Concrete proposed knowledge, beliefs and gates are in [dossiers](greyhaven-character-dossiers.md), [timeline](greyhaven-canonical-timeline.md) and [disclosure design](greyhaven-disclosure-design.md). Exact details await creative approval.

## Six distinct layers

| Layer | Meaning and suggested finite representation | Authority/privacy |
| --- | --- | --- |
| Truth | Authored event/fact IDs with participants, temporal constraints, location and solution links | Immutable case truth on server; no blanket model/public projection |
| Knowledge | Per-character permitted observation/report IDs with source and limitations; direct observation distinguished from hearing a report | A source report proves the NPC heard a claim, not that its contents are true |
| Belief | Finite authored propositions with stance such as suspects/accepts/doubts and an attributed source; optionally revised by a declared event | Private NPC state; confidence is an authored qualifier, not a numeric truth detector |
| Motivation | Directed protective/self-interest links and a small reason code tied to a reviewed policy rule | Private selection input; not public guilt/affection values |
| Testimony | Speaker-owned utterance/statement IDs, claim references, stance, account version and reviewed wording/fallback | Only currently eligible exact deliveries reach performance/UI; intentional deception is explicitly authorized, not rejected because false |
| Disclosure conditions | Small named all/any prerequisites over committed evidence/testimony/presentation events, with allowed revision/withholding outcomes | Engine checks; model/player prose cannot fulfill them; no arbitrary scripts or simulation rules proposed |

Use stable IDs and references so authors can review a statement's provenance and possible contradiction. These are data responsibilities, not six new services or a generic epistemic logic engine. Separate the immutable case definition from bounded per-session progress: inspected IDs, statements committed, explicit reports presented to a character, chosen current account versions and finite belief/disclosure revisions. Existing eight-turn history remains presentation memory.

## Illustrative protective-relative state, developer-only draft

World proposal: Owen visited Adrian but is not the murderer. Mara knows the visit happened, did not see a killing, and fears Owen may be responsible. Her goal is to protect him. She chooses an authorized false alibi instead of disclosing the visit. Neither her fear nor the detective's accusation proves guilt.

Candidate transition: independently recorded evidence plus an explicitly presented explanation of Owen's alternative activity can permit a narrower truthful account. Mara revises only what she herself knows: the visit and her observation's limits. She must not suddenly know Ruth killed Adrian, infer a hidden route, or supply a precise time she never observed. A corroborating record/witness route must yield the essential visit/timing information even if the player never reassures her.

If the user instead selects a mother knowingly protecting a guilty son, keep the same six-layer distinction but redesign the proof graph: independent clues must establish the son's conduct despite her lie. This is an alternative creative direction, not a switch already implemented or a second simultaneous solution.

## Purposeful relationships without a social simulator

Relationships are directed and source-specific: mother protects son does not imply son knows what mother observed; trust in a captain does not make a secondhand story firsthand. A relationship selects a small authored account/response policy when its explicit context applies. It does not add facts to a model prompt or globally broadcast facts.

Initially use static protective/self-interest motivations and bounded case-specific revisions. Reuse existing emotion values and demeanor precedence for delivery. A respectful/reassuring intent can express an eligible evidence-based appeal; it must not create truth or replace evidence with a keyword like "please". Aggression can change delivery or lead to a guarded response, but must not permanently erase every route. Numerical emotion gates and long-term relationship changes are optional later work requiring explicit spec changes.

An NPC hearing "Alice said X" has received a claim from the detective. An authored option can require that the detective actually received X, and record its presentation. Even then it is an attributed report; it is not direct knowledge that X happened. Free-text invented quotations never count as committed evidence/testimony IDs.

## Deterministic selection and safe commitment

Proposed sequence: resolve a supported intent and statement target -> check speaker/room/disclosure prerequisites -> select the reviewed account/clarification core -> construct the current authorized pair pool -> optionally let the model select delivery -> stage belief/disclosure/account changes -> validate and atomically commit through existing engine/session guards.

A provider refusal or invalid reply uses that plan's authorized offline fallback, not an older lie or a more revealing account. Rejected/stale/projection-failed turns install none of the proposed revisions. Cache reuse must validate against the current account/permission pool. Avoid cyclic disclosure transitions; start with monotonic discovered IDs and a small forward-only account sequence. Keep original statements in history with speaker attribution; a later correction does not erase them or make their proposition objective truth.

## Clarification that changes understanding

The target is the last committed substantive statement for the selected speaker by default. Authored choices can target a named statement when multiple recent accounts make "that" ambiguous. Do not add arbitrary transcript search or assume the player means a different speaker. Beyond the retained context, ask which statement they mean rather than fabricate an earlier conversation.

| Intent | What an authorized clarification would add | Required limit |
| --- | --- | --- |
| Meaning: "What do you mean?" | Resolve an authored ambiguous phrase in the targeted statement | If it has multiple facets, offer specific facet choices rather than repeat the whole sentence |
| Reference: "Who are you talking about?" | Bind a previously reviewed pronoun/reference to a permitted person | Withheld identity remains withheld; explaining a pronoun cannot bypass its gate |
| Time: "When exactly?" | State the observed anchor/range and distinguish it from an inferred time | "After the bell; I did not check a clock" is better than invented precision |
| Source: "How do you know?" | Distinguish sight, hearing, report and inference | "Jonah told me" does not authorize details Jonah never shared |
| Certainty: "Are you certain?" | State the witness's authored confidence and what they could/could not observe | Confidence is not truthfulness or guilt; an intentional lie can remain confident |

Illustrative draft: "I saw him after the bell" might authorize "By him I mean Owen", or "I heard a ringing, but did not see the ferry clock", if the selected story grants those observations and their disclosure conditions are satisfied. If the speaker cannot add detail: "I did not see his face; that is why I cannot identify him" explains a limit. These are illustrative templates, not new approved case utterances or permission to reveal Owen's visit before its gate.

Each useful facet is separately authored with prerequisites and exact authorized fallback. Merely expanding lastCore into another paraphrase of the same body does not satisfy the proposed clarification goal. If the account is later retracted, distinguish explaining the earlier claim from asserting it again as the current account; the exact history/retraction presentation contract belongs in the later approved specification.

## Public/model boundaries

Public: reviewed dossiers and relationships, actual inspected descriptions, attributed received statements and a clearly worded correction when committed. Private: objective truth inventory, murderer, hidden relationship motives, unrevealed belief revisions, policy/gate IDs and unselected testimony. Model: the existing bounded style/demeanor/recognized intent/current exact pair pool only. It does not receive the six-layer case graph or decide which layer is true.

Expected tests must distinguish useful clarification from a leak: newly explicit information can be legitimate when separately authorized, while a harmless-sounding unreviewed paraphrase is still forbidden. Player knowledge, NPC belief and canonical truth remain separate even when a statement happens to be correct.
