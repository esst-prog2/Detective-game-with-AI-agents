## ADDED Requirements

### Requirement: Validate finite owned disclosure policies
Opt-in v2 catalogs SHALL bind one case and validate speaker-owned base/account/disclosure cores, private epistemic annotations, local references and finite account graphs. Gates SHALL contain at most two alternatives of at most sixteen committed inspection or testimony references. Invalid, unreachable, cyclic, foreign or unsupported policy data SHALL fail closed; full cases SHALL retain six base subjects.

#### Scenario: Reject an invalid policy
- **WHEN** authoring supplies a foreign reference, cycle, missing initial version or unsupported predicate
- **THEN** construction fails before an investigation or public availability is created

### Requirement: Separate knowledge and belief from authorization
Only explicitly authorized testimony SHALL be selectable. Private known facts, mistaken beliefs, concealment and motivations SHALL remain authoring annotations, not automatic disclosure. Mood, raw player claims, model inventions and repeated questioning SHALL NOT satisfy prerequisites. False but authored initial accounts SHALL remain valid testimony.

#### Scenario: Ask for a withheld fact or quote a supposed witness
- **WHEN** a player asks before prerequisites or a provider returns a true but unauthorized secret
- **THEN** the secret is not committed and existing safe guidance or authorized fallback applies

### Requirement: Revise accounts by explicit eligible actions
An authored rule SHALL require a present speaker, active investigation, committed local prerequisites and explicit supported request. A valid transition SHALL advance its declared source to target version. Topics SHALL select the current account; superseded claims SHALL remain historical receipts only. Repeating a completed transition SHALL return current authorized testimony without duplicate transition or receipt side effects.

#### Scenario: Use either legitimate route
- **WHEN** either approved conjunction is committed and the player explicitly requests the revision
- **THEN** the new account becomes current only after the revised testimony commits

### Requirement: Commit disclosure state atomically
Current accounts, bounded semantic receipts, policy revision, dialogue, emotion and cache SHALL stage and install together through existing candidate transactions. Eligibility and exact output SHALL be revalidated at commit. Stale, canceled, ended, discarded or projection-failed candidates SHALL install none of their changes. Account state and cache authority SHALL remain case/session-local.

#### Scenario: Lose authorization before commit
- **WHEN** preparation is followed by movement, ending, session replacement or projection failure
- **THEN** no prepared account, receipt, emotion, text or cache state is installed

### Requirement: Preserve legacy and public behavior
Ashcroft v1 testimony, emotions, demeanor precedence, endings and offline behavior SHALL remain unchanged. Existing public state, request/result shapes and browser/CLI patterns SHALL be retained. Private gates, account versions and epistemic annotations SHALL NOT enter public views or provider context. Semantic receipts SHALL survive recent-history eviction within authored finite bounds.

#### Scenario: Run old clients and security attacks
- **WHEN** existing Ashcroft journeys and issue #3 regressions execute alongside synthetic disclosure cases
- **THEN** legacy results and protections hold without registering synthetic or unfinished Greyhaven content
