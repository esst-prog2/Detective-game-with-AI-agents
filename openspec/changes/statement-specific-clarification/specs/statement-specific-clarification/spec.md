## ADDED Requirements

### Requirement: Validate owned statement facets
Opt-in v2 catalogs SHALL declare finite speaker-owned meaning, identity, source, time or certainty facets with primary statement, account version, authored response and finite local gates. Invalid, ambiguous or foreign ownership and unreachable references SHALL fail closed.

#### Scenario: Reject foreign authoring
- **WHEN** a facet names another speaker's statement or an invalid version
- **THEN** construction rejects the catalog

### Requirement: Resolve clarification from committed authority
The engine SHALL resolve offered choices and whole aliases deterministically, using committed per-speaker primary targets for implicit questions. Facet replies SHALL preserve their primary target. Recent text, guessed IDs, pressure and model output SHALL NOT authorize details. Unsupported or ambiguous requests SHALL receive safe guidance without hidden prerequisites or identifiers.

#### Scenario: Clarify a known detail
- **WHEN** a received primary has an eligible source facet and the player asks its recognized question
- **THEN** only the authored source answer can commit

### Requirement: Preserve current and historical accounts
Current topics SHALL select the current account. Historical clarification SHALL require an actual old receipt, an authored correction and committed current testimony; it SHALL NOT restore the old account. Facets SHALL share disclosure eligibility and existing atomic cache/transaction guards.

#### Scenario: Discard a clarification
- **WHEN** a prepared reply becomes stale or projection fails
- **THEN** no context, receipt, history, emotion or cache changes install

### Requirement: Keep six-choice clarification discoverable
Essential first-time investigative actions SHALL precede route-critical base questions and one eligible contextual facet. Authoring SHALL reject more than four potentially simultaneous essential entries per speaker. Optional choices SHALL rotate within six and remain accessible through exact text; hidden labels SHALL stay hidden.

#### Scenario: Overflow optional actions
- **WHEN** at least eight candidates are eligible
- **THEN** essential actions and a contextual facet remain reachable and optional choices rotate without exceeding six

### Requirement: Preserve compatibility and privacy
Legacy v1 clarification, Ashcroft narrative and demeanor, public protocols, lifecycle and exact dialogue authorization SHALL remain unchanged. Targets, gates and account metadata SHALL remain private. Synthetic fixtures SHALL NOT become public cases.

#### Scenario: Run existing clients
- **WHEN** Ashcroft and security regressions run alongside facet fixtures
- **THEN** existing behavior passes without new public fields
