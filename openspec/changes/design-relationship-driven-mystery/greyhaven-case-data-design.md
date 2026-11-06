# Greyhaven case data and selection design

**Approved narrative baseline; proposed technical design, not implementation authorization.** The current story, 13 events, two routes and source limits remain fixed. Field/module names below are proposals. No runtime data is created by this document.

## Minimal case boundary

Introduce a small server-only registry/factory, not a plugin loader or a new game framework. A validated definition binds identity, authored data, catalog, policy and conclusion together. Preserve `src/data/case.js`, the existing Ashcroft catalog and reviewed deliveries at their current import paths; a thin `src/cases/ashcroft.js` adapter references them. Proposed new files are `src/cases/registry.js`, `src/cases/validate-package.js` and, later, `src/cases/greyhaven/…`. Each game owns a fresh dialogue state; immutable definitions may be shared, mutable Maps/Sets/caches may not.

Illustrative private package contract:

```text
CaseDefinition
  id, version, mode = full | preview
  publicMetadata = { id, title, mode }
  data = existing-shaped victim, rooms, locations, suspects, evidence
  catalog = profiles, six base subjects for full cases (declared subset for preview), owned cores/deliveries,
            evidence options, comparisons, account selectors, facets
  policy = finite gates, account transitions, bounded source references
  privateCanon = fact/source/belief/motivation annotations for authoring validation
  solution = { murdererId } for full; absent for preview
  conclusionResolver = trusted reviewed function for full; absent for preview
```

The factory adapts `solution` to the existing engine's private case shape if needed; it does not duplicate contradictory murderer fields. Definition validation rejects missing/conflicting identities. A full definition must identify a member of its cast as murderer. A preview explicitly has no verdict capability/solution, rather than falsely identifying an innocent slice participant. Runtime does not simulate the timeline, infer intentions or query a general knowledge graph. Detailed narrative remains authoring material; only bounded facts needed for validation/policy enter private modules.

| Information | Ownership and representation | Public/provider limit |
| --- | --- | --- |
| Identity/availability | Stable slug `ashcroft`, eventual `greyhaven`, proposed `greyhaven-preview`; immutable published allowlist | Only id/title/mode listed, never cast secrets, culprit, routes or difficulty promises |
| Cast/rooms/evidence | Case-local existing-shaped records; unique local IDs and valid placements; explicit public dossiers | Preserve explicit projections; evidence descriptions only from authorized inspection |
| Canonical events | Approved narrative/independent test fixture; optional private authoring annotations | No complete timeline in browser, model request or ending;20:38 stays developer-only |
| Knowledge | Speaker-owned observed/heard references with source/precision; permission attaches to finite core | A source report never becomes direct sight; knowledge does not authorize every known fact |
| Beliefs/motives | Private authored annotations, e.g. Mara fears Owen guilty and protects him | Not public truth/guilt labels, numeric loyalty, or model context |
| Chosen testimony | Owned immutable semantic core plus reviewed exact performance pairs | Deliberate lies remain authorized testimony; delivery cannot improve them into confessions |
| Disclosure/account state | Finite rules in definition; current account pointers/received IDs per game | Public text/history only, not gates, private stages or route progress |
| Accusation/ending | Selected definition's private solution and trusted resolver | Existing confirmation/finality; wrong outcomes private; no arbitrary resolver names/functions from requests |

Reference namespaces are `(caseId, localId)` internally. Within one definition, local IDs remain short API-compatible slugs. G1/M0 are planning aliases, not required wire IDs; maintain a reviewed mapping to descriptive slugs of at most 64 characters. Reject external-case references in authoring. A foreign ID absent locally is rejected; if test cases deliberately reuse a local ID, it resolves only to the current case's record. A bare string cannot prove where the player learned it—do not falsely claim origin detection. No foreign evidence record, cache entry or testimony object is accepted from a client.

## Proposed public selection contract

Use one small public manifest endpoint to avoid duplicated browser/server availability lists:

| Request | Proposed result / constraint |
| --- | --- |
| `GET /api/cases` | Same safe envelope, data contains `cases: [{id,title,mode}]` for published definitions only. No session, model call or solution data |
| `POST /api/investigations` with `{}` | Existing default Ashcroft behavior; no new required key |
| Same with `{"caseId":"ashcroft"}` | Explicit same case |
| Same with a published case ID | New session bound permanently to that definition/version/mode |
| Unknown, unpublished, null, numeric or extra-key selection | Fixed 400 `invalid_request`, no session allocation, no private availability explanation |
| Existing session commands with `caseId`, `coreId`, `facet` or extra fields | Reject using exact request allowlists. Case cannot be changed mid-session |

Add **`data.case: {id,mode}` to session envelopes**, alongside existing `sessionId/revision/state/result`. Keep the nested `state` projection and existing command/result shapes intact. Existing browser parsing explicitly reads known fields and ignores additive envelope metadata; verify this against the frozen old client contract. New client validates the metadata against the requested/current case before accepting a snapshot or recording testimony. No private definition is spread into the envelope. CLI gets only the public manifest for selection, then passes the chosen definition through the trusted factory.

`GET /api/cases` must use the existing host/origin/method/body protections and fixed error envelope; no broad CORS/network changes. It should not call `store.create`. Factory availability is an immutable server allowlist. Milestone A publishes Ashcroft only; isolation fixtures are injected by tests, never shipped as playable cases. D adds the separately labeled preview. E can construct the full Greyhaven privately for integration checks; F publishes it after endings/route verification. Knowing the unpublished id is not authorization to create it.

## Engine and session integration

`createSessionStore.create(caseId)` resolves the allowed definition before allocating a bearer ID, constructs a game, then installs an entry containing immutable case identity/version/mode. `run` retains its game-object/session/reservation/revision checks; it must never use the client's body to pick a definition. A zero-argument test factory can continue serving the default case; explicit multi-case test factories receive the resolved identity and must construct the matching definition.

Keep `createInvestigation({data,dialogueCatalog,performer,phraser})` available for existing trusted tests/CLI compatibility. Add optional trusted case context and conclusion resolver via the registry path; raw legacy injection retains its old Ashcroft ending guard. Do not remove the guard and accidentally attach Ashcroft explanations to an arbitrary synthetic case. The registry-selected full case uses its bound resolver, not title matching. All caches are per-game already; include case/version/account/facet/current-pool identity in new policy cache keys and recheck permissions at commit.

New selection always creates a fresh game and client generation. Clear selected suspect, drafts, received evidence/history and pending target context on successful new-session installation. Retain no automatic continuation of notes into another case. Late replies from the former case/session must fail generation/capability/room/revision checks. A failed create does not silently relabel the old game as the new selection. Keep ephemeral session expiry/capacity, bearer secrecy and no automatic mutation retries.

## Compatibility and acceptance

Original raw `getPublicView()` and original testimony/solution remain unchanged; additive **envelope** metadata has its own allowlist tests. Existing `{}` HTTP clients still obtain Ashcroft. CLI without a case flag still starts Ashcroft with established examples/wording; propose `--case <published-id>` and `--list-cases`, avoiding a new mandatory initial prompt that breaks scripted CLI journeys. Browser gets a small accessible selector, default Ashcroft, plus clear preview labeling; neutral presentation fallbacks suffice for new people/rooms.

Future tests: interleave two definitions including deliberately colliding local IDs; assert different evidence/disclosure/cache/accusation results stay local. Reject foreign/unpublished selectors and commands without mutation. Test manifest canaries, frozen old client parsing, session metadata mismatch, abandoned create, stale cross-case replies, expiry and stable final outcomes. Synthetic cases prove isolation before any Greyhaven story content is added.
