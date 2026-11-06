# Minimum mechanics assessment

> Detailed-phase refinement, 2026-11-06: Greyhaven is selected for narrative design. [The case-specific implementation assessment](greyhaven-implementation-assessment.md) narrows these candidate mechanics to exact story needs; [disclosure](greyhaven-disclosure-design.md) supplies bounded gates. Older cross-concept counts/examples below are historical proposals, not runtime contracts.


**Candidate extensions only; none implemented or approved.** Prefer the minimum set needed for the selected case. All options retain deterministic offline operation and exact currently authorized delivery. Existing runtime protections are reuse targets, not permission to bypass later specifications.

## M1. Case-local truth/provenance and NPC account data

- Player benefit: witnesses can be mistaken, protective or evasive for intelligible reasons, with discoverable distinctions between observation and hearsay.
- Reuse: case.js-style authored content, catalog core ownership, publicDossier allowlists and current literal testimony fixtures.
- Minimum new data/state: finite event/proposition/source references; per-NPC observation/report and belief references; static protective motives; versioned testimony linked to those sources. No general logic solver. Immutable truth stays case-local; current belief/account IDs are session-local.
- Owner: server case validator and authored catalog/policy boundary; frontend only renders reviewed public outputs.
- Security: validate references and speaker permissions; neither raw player claims nor public relationship edges can supply private knowledge. Do not serialize this graph or pass it to the model.
- Offline: the same fixed data and current IDs select the same permitted account without a provider.
- Tests: independent observation/lie/belief fixtures, unknown/cross-case references, a confidently mistaken witness, a protective innocent, public/private canaries and no cross-session knowledge transfer.
- Need: necessary for all three concepts in a bounded form. Rich epistemic inference, numeric confidence and arbitrary belief propagation can wait.

## M2. Bounded relationship-aware disclosure and revision

- Player benefit: presenting a real contradiction or an evidence-grounded reassurance can change an account; understanding loyalties becomes investigative work.
- Reuse: requiredEvidenceId, catalog comparisons and discussed/presented sets; game prepare/commit/discard, HTTP reservations/revisions and current performance validation.
- Minimum new data/state: named all/any conditions over successful inspection, committed statement IDs and explicit presentation events; private motivation selects an authored policy; at most a small number of forward account/belief revisions. Record a correction without overwriting old history.
- Owner: deterministic server policy evaluated before performance selection, all changes staged within the existing candidate.
- Security: permission check on options/text, clarification, cache reuse and final commit. A forged prerequisite ID, another NPC's state, stale eligible output or previously permitted but now superseded account cannot create a new disclosure. Model sees only the resulting exact utterance pool.
- Offline: an authored withhold/lie/disclose/revise account and useful fallback exist for every reachable condition. Provider success cannot be a prerequisite.
- Tests: one unmet prerequisite, each allowed alternative, both collection orders, invented player report, repeated reassurance, hostility, stale/ended/failed projection, cache replay after revision and cross-session isolation. Repeated old statements remain attributed records, not current corroboration.
- Need: necessary for A; useful in B/C. Keep first-case policy to roughly two account revisions. General relationship simulation, automatic gossip and free-form NPC decisions are deferred.

## M3. Statement-specific clarification facets

- Player benefit: reference/time/source/certainty questions resolve an actual ambiguity, or state an honest limitation.
- Reuse: lastCore, committed turn/statement IDs, shared text/choice path, original clarification no-hostility-delta rule, authorized delivery pools.
- Minimum new data/state: reviewed facet responses keyed to a speaker's statement/account version, each with ordinary knowledge/disclosure prerequisites; bounded target reference and recognized facet intent. Start with critical statements, not every sentence.
- Owner: server intent/statement resolver and catalog; public options can name a comprehensible target without exposing policy IDs.
- Security: facets cannot supply unrevealed identities or precision, reactivate a retracted account, refer to an unknown speaker's history or leak metadata. Ambiguous/contextless input asks for a target or yields safe guidance; it never guesses a secret.
- Offline: exact facet fallback or natural lack-of-detail response; no model interpretation of the transcript.
- Tests: meaning versus paraphrase, pronoun resolution, relative versus clock time, firsthand versus reported source, uncertainty, no-context/multiple-target/expired-context cases, withheld facet and retracted account. Keep original Ashcroft clarification behavior unless separately approved for migration.
- Need: necessary for the first richer case to address actual playtest feedback. Arbitrary historical turn selection and universal natural-language clarification are deferred.

## M4. Grounded comparisons and multiple paths

- Player benefit: connect sources, resolve a red herring and reach essential evidence without clicking every topic or obtaining one character's cooperation.
- Reuse: current authored cross-account prerequisites, inspection ledger, source-attributed testimony, six-choice priority and evidence-aware ending principles.
- Minimum new data/state: most work is authoring, not a new subsystem: alternative prerequisite groups and a finite record that an authored comparison/correction was committed. Distinguish receiving two claims from presenting the comparison to an NPC. Essential inference routes require genuinely independent underlying sources where corroboration is claimed.
- Owner: case author plus validator/policy; engine selects eligible comparisons, player reasons about guilt. No truth or guilt score and no general deduction board.
- Security: comparisons refer only to obtainable committed sources; player assertions do not establish contradictions. Derived labels cannot disclose an uncollected motive or automatically designate the truthful witness.
- Offline: all important discovery routes and red-herring explanations exist in authored data. Optional mood-dependent dialogue cannot be the only path.
- Tests: proposed reachability enumeration over bounded flags, remove/block each essential source in turn, collect accounts in either order, six-choice overflow including several new contextual actions, skipped optional topics, never-reassure/aggressive routes and partial ending privacy.
- Need: necessary design discipline for every concept. Reuse comparisons initially; postpone a generic contradiction engine or automated theorem prover.

## M5. Minimal second-case integration

- Player benefit: play the selected richer mystery while preserving Ashcroft as a separately playable regression fixture.
- Reuse: createInvestigation's injected data/catalog, static room transport, scalable public collections, CLI /choices and React dossier/history rendering.
- Minimum new data/state: a small trusted case registry/factory and case-scoped validation profile; explicit case identity in session setup and a reviewed ending resolver per case. Existing Ashcroft title/version checks and empty-catalog fallback are not a second-case API. Decide after selection whether to expose a small case selector or first demonstrate through a trusted configuration; no raw case/model selection from arbitrary request bodies.
- Owner: server composition/validation plus narrowly reviewed adapter contracts if selection becomes public. IDs cannot select arbitrary imports or files.
- Security: exact request allowlists, case-specific catalog/cache identity and public projections; new case never inherits Ashcroft testimony or solution. Final explanations use only that session's committed public support and preserve private wrong outcomes.
- Offline: registry chooses fully authored case data, no network-generated mystery. Original default behavior remains until an approved migration says otherwise.
- Tests: original-case checksum/fixtures, new case reference integrity, factory isolation, disallowed case/model/path input, full CLI/HTTP/browser journeys, correct/wrong/canceled accusations and no explanation copied from Ashcroft.
- Need: necessary to deliver a second live case. General plugin system, downloadable case packs, asset pipeline and public case-authoring tools are deferred.

## Optional extensions, not assumed work

Emotion-based optional disclosure could add nuance, but would change current delivery-only contracts and multiply routes. Keep original 0-4 emotions and demeanor precedence initially; show purposeful reactions through reviewed delivery and evidence-grounded account policy. If later approved, test independent essential routes and explicitly define non-farmable event effects.

NPC-to-NPC conversations, autonomous schedules, global rumor propagation, persistent relationships and numerical affection are unnecessary for these initial versions. Characters can have consequential static loyalties without simulating an entire social world. A general semantic validator for unconstrained model prose is also unnecessary and would weaken the project's demonstrated boundary if substituted for exact membership.

## Priorities by concept

A needs M1-M5 at the smallest scale: one protective relationship and two possible account changes. B uses the same set with stronger shared-record provenance. C needs careful source chains in M1/M4 and past/present targets in M3; this is principally a content/validation cost, not a reason for a new model architecture. None requires a new AI agent.
