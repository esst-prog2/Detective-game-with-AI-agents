# Proposal

## Why

The illustrated browser game has the desired atmosphere but its global contact menus and small portrait form do not feel like investigating rooms or speaking to someone in person. Introduce authoritative room interaction and cinematic dialogue while retaining the current application, mystery and offline engine.

## What Changes

- Add server-authored static placements, stable room IDs, an initial/current location and an explicit travel command. Use the existing study, library and garden; do not simulate NPC movement or elapsed time.
- **BREAKING behavior:** the engine rejects questions and evidence inspections outside the current room, including cached and unsupported questions. Update CLI and browser flows to travel instead of bypassing the restriction.
- Add explicitly authored public dossiers with role, public relationship to the victim, background and approved relationship references; never project private character fields automatically.
- Extend public state additively with room summaries, current location, safe placements and dossiers. Add revision-checked `POST /api/investigations/:id/travel` within existing session/security limits.
- Replace the global questioning tray with room inhabitants, public profile previews, available objects and exits. Keep the global overview/journal for dossier and received-note review, with travel offered for remote actions.
- Integrate a dominant transparent character figure and cinematic dialogue overlay into the existing illustrated scene, retaining free-text input, small history access, keyboard/mobile support and replaceable local art.
- Preserve the murderer, testimony/approved lies, evidence descriptions and intended solution. Accusations remain possible against any known suspect from any room.

## Capabilities

### New Capabilities

- `room-investigation`: authoritative room state, static presence/inspection restrictions, safe public dossiers, travel transport, room-based selection and cinematic questioning.

### Modified Capabilities

None in the main spec inventory: `openspec list --specs` reports no published specs. Related contracts exist in unarchived changes; this proposal explicitly supersedes their global-access/scene-only and identity-only requirements where described in design.md. Preserve those historical artifacts rather than editing or archiving them during planning.

## Impact

One coordinated change with small review groups: engine/data/projections and CLI; HTTP/session integration; client/room flow; cinematic presentation and verification. Splitting these into independent releases would leave the current client misleading about authority, so the proposed release remains atomic.

Expected implementation files: `src/data/case.js`, `src/game.js`, `src/cli.js`, `src/http-api.js`, narrowly `src/investigation-sessions.js` for typed engine rejections, existing `web/src/` components/client/state/manifest/styles plus new room/figure components and local figure assets. Adapt affected tests and extend coverage; update README/playtest documentation and append planning results. No new dependencies, framework, database, model feature, case, cast member, emotion AI, dialogue critic or issue #3 work. No production changes are authorized by this planning request. Leave all existing uncommitted browser work intact; no commit/push/merge/archive.
