# Design

## Context and decisions
Use the approved case-data design and A1-A4 roadmap from ../design-relationship-driven-mystery. Ashcroft data/catalog stay at their existing imports. A registry snapshots and recursively freezes validated plain data; each construction gets fresh engine state. Full packages bind id/version/mode, publicMetadata, data, catalog and solution. Optional privateCanon stays private. Existing data.murdererId must agree with solution.murdererId. Initial state is data.initialLocationId plus the engine's fresh empty dialogue state; no arbitrary mutable state seed.

The registry resolves published IDs before factory/session-ID allocation. The entry's frozen identity has non-writable caseId, caseVersion and case metadata properties. Existing transactional game/revision/reservation guards remain. Trusted legacy zero-argument test factories remain supported for the default package; production factories always construct the resolved package.

GET /api/cases projects only id/title/mode and allocates nothing. Creation accepts exactly {} or {caseId}; missing defaults to ashcroft, invalid/unpublished IDs return fixed invalid_request. All session envelopes add data.case={id,mode}; nested state/results stay unchanged. Mutations reject selectors as extra fields. Local IDs resolve solely against the bound game, including deliberate collisions across packages.

CLI supports --case <id> and --list-cases without a mandatory prompt. Browser loads the manifest and validates every session envelope against selected identity; successful creation resets notes, failed creation preserves the former identity. Existing generation/room/revision guards discard old replies.

## Scope and deviations
Only full packages are supported in A. Roadmap A mentioned preview validation and unavailable verdicts, but this authorization explicitly excludes new accusation logic/endings. Preview capability and sparse-topic exception remain D, not silently accepted full packages. Existing accusation implementation, including the legacy Ashcroft explanation guard, stays unchanged; registered non-Ashcroft packages cannot impersonate that guard. Trusted ending resolver extraction is likewise deferred until needed; A introduces no ending function API.

## Risks and verification
Catalogs must cover every character and retain six base subjects. Reject malformed/missing/reference/unsupported package data, including future policy schemas. Validation is structural, not a proof that authored text is fair or true. Explicit public projections exclude private records, and browser import/build boundaries exclude server modules. Test independent packages, colliding IDs, cache/memory/emotion separation, wrong/sparse/supported verdicts, malformed/foreign inputs, provider attacks and stale cross-session replies. Run full Node/Chromium/build/security/scoped strict/whitespace checks, reporting inherited nine strict failures separately.
