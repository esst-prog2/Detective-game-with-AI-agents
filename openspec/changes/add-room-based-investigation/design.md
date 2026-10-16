# Design

## Context

See proposal.md for motivation. Read-only inspection found:

- `src/data/case.js` has three location strings, three suspects with mixed public/private profile fields and three clue descriptions; there are no room IDs, placements or approved dossiers.
- `src/game.js` owns lifecycle/cache but not position. It checks ending before questioning and again after awaiting phrasing. Both raw/trusted and public inspection currently allow every clue. Safe views explicitly select identity fields.
- `src/http-api.js` validates exact command bodies and projects results. `src/investigation-sessions.js` serializes commands per session and increments revision after successful operations. Travel must use that reservation, not a separate execution path.
- `src/cli.js` globally lists suspects/evidence; choices 1–5 and Boolean accusation confirmation work. It needs a room-aware navigation option rather than an exemption from engine restrictions.
- `web/src/state/investigation-state.js` treats SCENE as local state; the client strips additional public fields. `InvestigationScreen`, `DialoguePanel`, `SuspectOverview`, journal and navigation assume global actions. Existing scene art and palette are reusable; small portrait cameos cannot become satisfactory large figures by stretching them.
- The current verified baseline is 72 Node tests (59 original plus 13 browser-client/privacy tests) and 12 Chromium desktop/mobile tests. Historical HW4/HW5 phrasing evidence and regressions remain independent of spatial state.
- Main specs are empty. Unarchived foundation/browser artifacts are the contract history. This change intentionally replaces the older browser requirement “Represent location selection honestly” (scene-only/global contacts), the global-access part of “Track inspection history without pretending discovery gates”, the identity-only public-view allowlist, and the HTTP route inventory/command semantics as detailed here. Preserve all other privacy, lifecycle, offline and transport constraints. Do not edit or archive earlier artifacts now; any future spec synchronization must reconcile those explicit supersessions in order.

Only the latest text attachment and existing repository screenshots are available in this session; no separately supplied reference image was available to inspect. The cinematic composition below follows the written direction. Do not claim reference-image matching; exact art treatment can be refined during the implementation visual review without changing these gameplay contracts.

## Goals / Non-Goals

**Goals:** make room presence and evidence access meaningful in the same engine for all adapters; keep the mystery and dialogue unchanged; make the person/room the main visual composition; expand the approved public surface deliberately; support arrays of inhabitants and future replaceable expressions.

**Non-Goals:** pathfinding, NPC movement, clocks, room locks, discovery prerequisites, inventory collection, emotion inference, new relationship simulation, new family canon, new cast/cases, paid artwork generation, new dependencies, persistence, issue #3/critic work or reworking phrasing validation.

## Decisions

### 1. One coordinated change, four review groups

Use `add-room-based-investigation`, with engine/CLI, HTTP, room client and cinematic UI tasks reviewed separately. They share one precise contract and one release gate. Independent backend/UI releases would temporarily present false global access, so do not create parallel release milestones or rewrite the existing app. Keep the completed but uncommitted browser milestone intact during planning; its eventual commit history requires separate user authorization.

### 2. Static authored rooms and interview-time placements

Keep `locations: ['the study', 'the library', 'the garden']` for display compatibility. Add `rooms: [{id:'study',name:'the study'}, {id:'library',name:'the library'}, {id:'garden',name:'the garden'}]` and `initialLocationId:'study'` to server case data. Those explicit IDs are canonical; clients must not derive them from text. Names/order in the retained locations list must agree with rooms. Each suspect and clue gets one `locationId`. Rooms do not maintain duplicate membership lists: public members are selected from those placements. All rooms are mutually reachable; no adjacency graph or movement cost is needed.

Proposed authored content, requiring approval of this plan before implementation:

| Room | Present suspects | Inspectable evidence | Rationale |
| --- | --- | --- | --- |
| Study (initial room) | Alice Mercer | Torn contract; silver cufflink | Alice found Victor; the contract is described in his study and the cufflink beneath his desk. |
| Library | Clara Voss | None | A plausible place to interview a guest; does not validate her claimed murder-time alibi. |
| Garden | Ben Carter | Muddy footprints | Gardener interviewed on the grounds; footprints examined along the garden-side route/door described by the unchanged clue text. |

The footprints are the same existing clue, not a new trail, direction, ownership assignment or deduction. Present-day interview positions are not historical whereabouts: Alice being in the study does not reveal her hidden library visit, and Clara being in the library does not establish her alibi. No testimony, private fact, approved lie, murderer ID, intended solution or clue description changes. An empty evidence list is a supported room state; synthetic tests must also cover zero and multiple inhabitants without adding real characters.

Validate spatial data before an investigation is admitted: unique valid room IDs, valid initial room, consistent display list, every placement referencing a configured room, no duplicate entity IDs, and valid public dossier/relationship shapes and references. No implicit “global” fallback if data is absent. Construction failures remain generic at HTTP boundaries. Do not add a new three-person limit to the spatial/projector layer; existing case validation's current-case cardinality is separate. Injected test cases must provide explicit spatial/public data.

### 3. Engine position, travel and asynchronous safety

Each investigation owns `currentLocationId` initialized from case data and an internal location epoch. Add `travelTo(locationId)`: while active, reject unknown rooms with `{kind:'error',code:'location_not_found',text:<fixed safe message>}`. A valid travel returns `{kind:'travel',locationId,changed:boolean}`; travelling to the current room succeeds with `changed:false` without changing the location epoch. Actual travel changes position and advances the epoch. No NPC placement changes, dialogue cache clearing, object collection or lifecycle transition occur. Engine ending takes precedence over target existence for all gameplay commands, including travel.

Questions must check lifecycle, identity and current presence before topic classification or reading a cached answer. A remote known suspect returns `suspect_not_present`; a remote known clue returns `evidence_not_here`. Both inspection methods use the same guard; private/trusted inspection is not a bypass. Unknown evidence still returns null and public identity/dossier reads remain globally safe. Existing unknown-suspect error behavior can gain a stable code without changing its safe text. Rejections do not call a phraser, append/cache a response, change position or alter the final result.

Capture location epoch when uncached dialogue starts; after await, check ending first, then epoch and suspect presence. If position changed, including leaving and returning, return `stale_response` and discard the text before caching/return. Existing same-session HTTP reservation rejects overlapping travel/question operations with `session_busy`; the epoch additionally protects direct-engine/out-of-band travel that does not increment the HTTP revision. A trusted `getLocationContext()` returns a detached `{locationId,epoch}` for adapter commit checks; epoch is never added to public JSON. The session store captures it for question operations before invocation and checks it again after awaiting the operation, immediately before snapshot/revision commit, after its existing lifecycle checks. This also discards already-cached answers invalidated during the adapter's await gap. Equal-revision public GET can reconcile such position changes; browser selection must be reconciled too. Provider cancellation is not promised: an already-running model call may finish, but its obsolete result cannot become dialogue. Do not add a dialogue critic or claim semantic hallucination prevention has improved.

Accusation confirmation/cancellation remain globally available for any configured suspect, independent of presence. This avoids an unrequested rule that the accused must be physically present. Confirmation ends once; canceled accusations stay active. Ended travel/question/inspection/accusation reject, while dossiers and already-received notes remain readable. Public reads never change position.

### 4. Explicit approved dossiers, not a private-profile projection

Author `publicDossier` separately on each suspect:

```json
{
  "role": "Housekeeper",
  "relationshipToVictim": "Employed by Victor Hale.",
  "background": "Alice Mercer works as the housekeeper at Ashcroft Manor.",
  "relationships": []
}
```

Proposed complete initial text:

| Person | role | relationshipToVictim | background |
| --- | --- | --- | --- |
| Alice Mercer | Housekeeper | Employed by Victor Hale. | Alice Mercer works as the housekeeper at Ashcroft Manor. |
| Ben Carter | Gardener | Employed by Victor Hale. | Ben Carter works as Victor Hale's gardener. |
| Clara Voss | Business partner | Business partner of Victor Hale. | Clara Voss is Victor Hale's business partner and a frequent guest at Ashcroft Manor. |

Names remain the existing public identity fields. These statements are deliberately authored public excerpts grounded in existing roles, not runtime copies of `relationshipToVictim`, personality or motive. In particular, do not expose Alice's financial dependence/debt, Ben's threatened dismissal/argument or Clara's concealed losses/murder/clue ownership through dossiers.

`relationships` is an array of explicitly approved public edges shaped `{targetSuspectId,kind,label}`, where `kind` is `family` or `social`, and the target is an existing public suspect other than self. All three arrays are initially empty: no family links are established by the current case. UI says “No additional relationships recorded in this dossier”, not “No relatives.” The separate victim relationship string covers the already-known victim without adding a new victim-ID schema. Future networks can extend reviewed edge kinds/public person references; no hidden graph, score, disclosure condition or private edge may be spread into a projection. Copy/validate each nested edge field explicitly. Empty arrays/optional art are not permission to synthesize profiles with AI.

### 5. Additive public transport contract and exact errors

Public state retains title/victim/locations/lifecycle and existing ID/name fields, adding:

```json
{
  "rooms": [{"id":"study","name":"the study"},{"id":"library","name":"the library"},{"id":"garden","name":"the garden"}],
  "currentLocationId": "study",
  "suspects": [{"id":"alice-mercer","name":"Alice Mercer","locationId":"study","dossier":{"role":"Housekeeper","relationshipToVictim":"Employed by Victor Hale.","background":"Alice Mercer works as the housekeeper at Ashcroft Manor.","relationships":[]}}],
  "evidence": [{"id":"torn-contract","name":"Torn contract","locationId":"study"}]
}
```

The example arrays are excerpts; real payloads include all three suspects/clues. The global public placement directory is explicitly approved: hiding other rooms' members is not a new discovery mechanic. Evidence descriptions remain excluded until a valid in-room inspection. `getPublicSuspect` uses the same identity/location/dossier projection. Inspection result stays `{id,name,description}` to avoid unnecessary command-result changes. All nested data is detached; unlisted metadata at every level stays private.

Add `POST /api/investigations/:id/travel` accepting exactly `{locationId,expectedRevision}`. `locationId` follows the existing 1–64 slug rule; no body position/presence/dossier override is permitted. Return 200 with the existing success envelope, public state and result `{kind:'travel',locationId:'garden',changed:true}`. Session creation and GET signatures are unchanged. The existing command routes/envelopes remain; state extensions and location-dependent rejection are the intentional migration.

| Condition | HTTP/code | State/revision effect |
| --- | --- | --- |
| Known remote suspect | 409 `suspect_not_present` | No mutation or generation |
| Known remote evidence | 409 `evidence_not_here` | No inspection/description or mutation |
| Unknown valid room ID | 404 `location_not_found` | No mutation |
| Malformed room ID/body | existing 400 validation code | No dispatch |
| Stale revision / overlapping command | existing 409 `stale_revision` / `session_busy` | No travel/question admission |
| Epoch-invalidated dialogue | 409 `stale_response` | No answer/cache publication or adapter revision |
| Valid travel, including same-room no-op | 200 | Exactly one revision increment |
| Ended valid-shaped travel/interaction | 409 `investigation_ended` | Stable first final result |

Keep existing ordering: validate transport shape first, resolve session, reject ended before entity/revision/reservation checks; for active operations validate referenced entity existence, then existing revision/busy admission, then engine presence rules. The HTTP callback translates typed engine rejections before projecting results; the session store must also avoid incrementing on typed errors if that conversion is centralized there. Never infer wrong-room errors from strings or duplicate placement rules in HTTP. Travel takes no global question slot; it still reserves its session. Keep 16 KiB, 100 sessions, 30-minute idle expiry, four question operations, loopback Host/Origin, bearer/privacy, fixed JSON errors and disconnect behavior unchanged.

### 6. Room-first browser composition and honest remote actions

Reuse React/Vite/provider/client rather than introduce a router, canvas framework or game engine. Public snapshot `currentLocationId` is the only canonical position. Scene selection becomes a travel intent using the API; never optimistically dispatch a canonical SCENE. Keep the old room on failed/uncertain travel. Successful travel opens its room view and clears selected interrogation; a same-room no-op can return to that room. New investigations start with the study room, with a compact public case-introduction overlay/panel; location selection becomes an accessible room-navigation overlay rather than the primary menu-like game screen.

Room view composition:

```text
compact case/navigation bar: current room | journal | dossiers | accuse
┌──────────────── illustrated current room ────────────────┐
│ public room title                                      │
│                                                        │
│ room inhabitants: named character entries/cards         │
│ select -> public role/background -> Speak with person   │
│                                                        │
│ evidence/object entries             labeled exits       │
└────────────────────────────────────────────────────────┘
```

Room cards/objects are scene-integrated semantic buttons with clear focus and a compact accessible list alternative, not invisible coordinate puzzles. Use authored presentation anchors for the current trio as decorative composition only; derive membership from server placements, never a frontend presence map. Flow/wrap entries for unknown IDs and many inhabitants rather than require per-NPC coordinates. Do not draw false empty placeholders when a room has no one/no objects; use short honest empty states. Entrance/exit buttons list other public rooms and request travel. No fake pickup, discovery lock or interactive decorative prop.

The dossier overview can list all known suspects with public room labels, full dossiers and received testimony. Present characters can open questioning. Remote entries offer “Travel to [room]”, which travels then returns to the room; selecting the character is a separate local action. Do not silently combine travel and a question. The journal retains all public clue names, room labels and known descriptions; only local unreceived clues offer Inspect, remote ones offer travel, and known descriptions are readable everywhere without an inspection request. Accusations still use the existing confirmation dialog from any active room.

The client adds exact travel request/result projections, room/dossier validation and known error messages while stripping unlisted properties. Preserve bearer closure, one-mutation gate, 15-second timeout, generation/revision guards and no replay. Travel is disabled while any mutation is pending, including a question; dossier/history/journal reading remains possible. A reconciled state closes an interrogation whose selected suspect is no longer present, preserving its received history/draft. Reject a delayed question completion with a stale room context before adding history, even if a view was changed locally; do not confuse opening notes with travelling. Equal-revision GET may change current location after out-of-band engine travel. Post-game navigation opens known notes/dossiers/conclusion, not an active remote interview; travel is disabled.

### 7. Cinematic interrogation and replaceable figures

Keep the dark-academia palette, system serif/sans typography, existing three backgrounds, title art, clue icons and portrait cameos. Add a separate `figures` entry keyed by public suspect ID, with optional `neutral` and future expression slots, transparent asset path, alt text, crop/object-position and a generic standing-person fallback. Room art remains keyed through the manifest using explicit public room IDs mapped to existing scene assets. Existing portrait assets remain useful for dossiers/cards/history; do not stretch a 480×600 cameo frame into a full-body character. Public-facing manifest must never encode guilt, motives, private traits or choose an expression by parsing testimony.

Create three equally finished temporary neutral waist-up or knee-up human figure SVGs, approximately 900×1400 viewBoxes with transparent backgrounds, coherent silhouettes, face/hair/clothing identity matching current cameos and enough lower-body/crop area for composition. A fourth generic figure handles missing art/new IDs. These are clearly documented placeholders, not claimed final illustration. No generated-art account or paid tool is required. Do not dress/pose a person to imply guilt, evidence ownership or hidden occupation. Neutral figure only: expression selection requires a future approved public emotion field. No emotional AI or inferred meters now.

Desktop target at 1440×900: the room fills the remaining viewport; a person is visually dominant (roughly 55–80% of scene height above/behind the overlay, not a tiny repeated head). Anchor the figure slightly right of center and apply restrained foreground/background separation. A bottom cinematic speech panel contains name, actual received testimony/guidance, labeled free-text input and Ask; Return to room and History are obvious compact controls. Full replies wrap/scroll inside a bounded accessible text area when long; do not truncate testimony. History opens a secondary labeled drawer/dialog with keyboard focus return, not a permanent transcript column. Public dossier can be reopened without a server command. No fabricated greeting, emotion animation or delayed typewriter text.

Mobile 390×844 and width 360: retain a meaningful large face/upper body and room context, use a responsive stage with the dialogue panel below/partly overlapping rather than cover the person with the keyboard. Allow normal page scrolling, safe-area padding and focused input scrolling. Preserve all commands without clipping at narrow/reflow/200% zoom; large bodies may crop intentionally below the torso, but names/dialogue/buttons must not. Respect reduced motion, 4.5:1 normal-text and 3:1 control/large-text contrast and 44×44 primary targets. Explicit checks must distinguish polished cinematic composition from merely moving the old form onto a background.

### 8. Compatibility and test changes

No test removal or privacy relaxation. Update valid spatial setup and exact fixtures where the new behavior intentionally changes assumptions:

| Existing area | Necessary update and preserved assertion |
| --- | --- |
| `test/game.test.js` | Travel to each suspect/clue before valid interaction; test cache remains identical after leaving/returning. Keep all expected canonical dialogue, topic, fallback and accusation assertions. |
| `test/public-view.test.js` | Extend exact views with rooms/current location/locationId/dossiers; explicit spatial/dossier data in injected eight-person fixture. Travel for inspection; expected inspection excludes new raw placement metadata. Retain canary and deep-detachment assertions for new nested edges. |
| `test/investigation-lifecycle.test.js` | Travel for active inspection/pending-dialogue setup; extend exact public fixtures. Preserve ended-first rejection even for remote/unknown targets; add ended travel and final/location stability. |
| `test/http-api.test.js` / session tests | Existing Ben helper assumes initial availability: travel to garden and propagate returned revisions; full-case inspection loop travels by public placement. Replace comparison to entire raw clue records with exact approved inspection fields because raw records gain locationId. Concurrency/capacity tests admit in-room questions; keep all original caps/security/disconnect assertions and error precedence. |
| `test/browser-state.test.js` | Extend synthetic snapshots/projections and replace local canonical SCENE assertions with travel acceptance/rejection. Preserve late/generation/duplicate/timeout guards; add room-context and nested dossier tests. |
| `web/e2e/game.spec.js` / walkthrough | Replace no-network scene browsing/global contacts with revisioned travel and correct room membership. Test all three clues across rooms, remote read-only notes/dossiers, cinematic presentation and navigation; update interception fixtures to valid spatial data. |
| HW4/HW5 tests/scripts/evidence | Keep phraser regression expectations, spike schedule/results, saved transcripts and historical artifacts unchanged. Add setup travel only in engine tests that require it; do not regenerate evidence or change approved response strings. |

CLI: keep actions 1–5 and confirmation language; add action 6 “Travel to another room”, show current room, and list only present suspects/room evidence for actions 1/2. No automatic travel and no global-mode switch. Accusation selection still lists all suspects. Scripted CLI tests that formerly inspected garden footprints from the initial room must explicitly travel; test the old commands/confirmation/end handling after valid setup.

Acceptance combines engine-direct negative tests (including cached/unsupported/unknown and leaving-returning during a deferred phraser), HTTP forged remote commands, malformed travel/private-injection and independent sessions, client error/race tests, complete offline browser/CLI journeys, and actual visual/keyboard review. Capture room views and dominant figures with short/long replies/history, empty/multi-inhabitant fixtures, missing figures and narrow layouts. Verify developer console/storage/DOM/assets/bundle/source maps and server-error output still exclude hidden canon/prompts/keys and unintended bearer exposure. Dossier text approval is not permission to publish raw private relationship fields.

## Risks / Trade-offs

- [Existing test clients assume global access] -> Intentional behavior change documented here; migrate valid setup and revisions, preserve negative/security assertions and original canonical outputs.
- [Static present-day placement mistaken for an alibi] -> Describe it as current presence only; keep historical testimony and solution unchanged, with no guilt inference.
- [Dossiers accidentally reveal protected information] -> Separate authored public block, conservative exact text above, recursive allowlists/canaries and explicit user plan approval.
- [Pending provider response survives travel] -> Same-session reservation plus engine epoch and client context checks; discard before cache/history, with no claim that external model billing is canceled.
- [Placeholder figures fail the desired visual quality] -> Separate figure assets, substantial proportions and screenshot/manual review, preserving replaceability; do not relabel enlarged cameos as final illustrations.
- [Missing reference image] -> Written composition is fully specified; request reattachment if implementation needs exact reference matching, without delaying this actionable technical plan.
- [Other unarchived contracts contradict new restrictions] -> Explicit supersession ledger above; preserve earlier milestones and reconcile only in an independently authorized future synchronization/archive step.

## Migration Plan

After approval, implement in the task order with baseline tests recorded first. Add approved case metadata/guards and update CLI, then transport, then room-aware client, then cinematic assets/layout and acceptance review. Existing sessions are in-memory; restart the API with the new code and create a new investigation rather than claim saved-session migration. Release updated backend/client together. No database/data rewrite or old-evidence regeneration occurs. Roll back the code as a coherent unit if needed; do not rewrite Git history or erase historical artifacts. Run full Node/browser suites, production build/privacy scan, strict OpenSpec validation and diff checks, append actual results and leave work uncommitted/unarchived for review.
