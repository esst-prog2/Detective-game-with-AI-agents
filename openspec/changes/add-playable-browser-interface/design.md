# Design

## Context

See proposal.md for motivation. The HTTP API has a verified 59-test baseline and provides session creation, public state, questioning, evidence inspection and accusation commands. Responses include sessionId/revision/state and optional result; commands require expectedRevision. Success includes canceled, correct and incorrect accusation results; errors use fixed codes and omit bearer IDs. The API is loopback-only, accepts the two local Vite port-5173 origins and permits one command per session. No UI or artwork exists in the repository.

The public view contains title, victim name/description, location strings, suspect IDs/names, evidence IDs/names and lifecycle. It does not contain NPC occupations, personality, physical placement, location descriptions, clue locations/discovery state or persisted conversations. Build against that contract; never import `src/data/case.js` to fill visual gaps.

## Goals / Non-Goals

**Goals:** A visually cohesive, fully playable first browser release with accessible illustrated scenes, portraits, dialogue and evidence review. Match the current three-suspect case exactly while rendering arbitrary public collections. Keep backend authority, credible local observations and error recovery distinct.

**Non-Goals:** Backend changes, real movement/travel, hidden clue gates, fictional NPC whereabouts, new evidence facts, relationship/emotion mechanics, difficulty selection, generated cases, persistence/reload recovery, service-worker/PWA mode, API hosting or image generation. Offline means no model key/network dependency beyond the running local API, not running without a backend.

## Decisions

### Stack, folder structure and commands

Add a separate `web/` npm package, plain JavaScript/JSX, React/react-dom, Vite and the React plugin. Use semantic HTML and CSS rather than canvas/game-engine infrastructure: this is scene selection and conversation, not continuous movement. No router is needed for this small single-page screen flow; no token goes in a URL. Use React reducer/context for shared presentation state, following https://react.dev/learn/scaling-up-with-reducer-and-context . Do not add Redux, a UI kit, animation framework or data-fetching framework.

Proposed layout (created only during approved implementation):

```text
web/
  package.json, package-lock.json, index.html, vite.config.js
  src/
    main.jsx, App.jsx
    api/investigation-client.js
    state/investigation-state.js, InvestigationProvider.jsx
    components/SceneStage.jsx, Portrait.jsx, DialoguePanel.jsx
    components/EvidenceJournal.jsx, SuspectOverview.jsx
    components/AccusationDialog.jsx, StatusNotice.jsx, GameNavigation.jsx
    screens/MainMenu.jsx, LocationSelection.jsx, InvestigationScreen.jsx
    screens/CaseConclusion.jsx
    presentation/asset-manifest.js
    styles/tokens.css, base.css, game.css
  public/art/locations/, portraits/, evidence/, ui/
  e2e/investigation.spec.js
  playwright.config.js
test/browser-state.test.js
docs/browser-playtest.md
```

`web/src/state/investigation-state.js` and the client are plain ESM with no React imports so Node tests can exercise them with injected fetch. Browser end-to-end specs use `.spec.js` outside a `test/` directory so the existing root `node --test` does not try to run Playwright specs. Add `@playwright/test` as development tooling in `web/`; avoid separate Vitest/jsdom/testing-library stacks when real browser tests and pure state tests cover the behavior. Keep package versions/lockfile selection for implementation after checking compatibility with the existing Node 24 LTS installation; no install now.

Preserve `npm start`, `npm run start:api`, `npm test` and root dependencies. Add root convenience scripts `dev:web`, `build:web`, `test:web` delegating to the web package; web `dev`, `build`, `preview` and `test:e2e` scripts stay local to that package. Document separate API/frontend launch terminals. Bind Vite to 127.0.0.1:5173 with strictPort=true, fs.strict=true and web-only file access; do not allow imports from repository server modules. Proxy `/api` to 127.0.0.1:3001 with changeOrigin=true for development and local preview, with no path rewrite. If API_PORT changes, change only the server-side Vite proxy target configuration; do not expose credentials via VITE variables. See https://vite.dev/config/server-options.html#server-proxy . The built assets are a local-build artifact, not a public-hosting deployment.

### Honest support matrix and first-release boundary

| Requested experience | Existing support | First release | Later backend work |
| --- | --- | --- | --- |
| New case/menu/result | Create/public lifecycle/accuse | Full start-to-result flow; start again creates a separate session | Multiple cases and saves |
| Locations/map | Three location names only | Illustrated location cards and local scene selection; no API mutation | Travel/currentLocation/time/availability |
| Room descriptions | No descriptions in public state | Name plus explicitly decorative atmosphere caption, no authored investigative claims | Public location descriptions |
| Visible people/clues | Global identities and clue summaries only | Global Contacts and Case evidence trays from every scene; no spatial association | Public placements/hotspots |
| Character role | Name/ID only | Generic Suspect label, never infer housekeeper/gardener/partner from private data | Reviewed public profile/occupation fields |
| Evidence discovery | Every clue is inspectable | Available to inspect / Inspected in this browser session, never undiscovered/locked | Server discovery state and gating |
| Dialogue | Question result only; six topics | In-memory actual question/response pairs per suspect; visible topic examples | Authoritative history/memory and entity-specific questioning |
| Notes/overview | Public identities and received results | Received testimony/inspection excerpts, no automatic truth/culprit deductions | Persisted notes, relationships and beliefs |

The release is complete because all existing case actions are available, not because new travel/discovery mechanics are simulated. No new API endpoint or schema change is needed. All suspects are globally available contacts; showing a selected portrait over a scene is conversation presentation, not a claim about their physical whereabouts. A concise first-use scene note can explain that choosing a scene changes the view while contacts/clues remain available; avoid backend jargon in player-facing copy.

### Screens, components and layout

1. MainMenu: full-bleed manor/vignette artwork, restrained title typography, short public-safe introduction and Start investigation. Disable repeat start immediately while creating; on failure show connection help and explicit retry. No difficulty/continue controls without support.
2. LocationSelection: illustrated study/library/garden cards from state.locations with selected/focus styling; no fabricated navigable floor plan. Selecting a card opens the scene without a server command.
3. InvestigationScreen: SceneStage is the visual anchor, with location title, decorative caption and clear back/location controls. Persistent GameNavigation offers Locations, Suspects, Journal and Make accusation. A contacts portrait strip and evidence-folio control remain global, rather than planting arbitrary people/objects in a room.
4. DialoguePanel: portrait/name, generic Suspect role, short example questions covering six supported topics, an actual free-text form and readable speech panel. Render received answers as testimony, with optional conversation history in a collapsible scroll region. Unsupported guidance is a separate notice. Loading shows Questioning... with aria-busy/status; never fake typing character dialogue before an answer exists.
5. EvidenceJournal: a folio-style grid with all clue names, neutral illustrations and inspection-state labels. Selecting an uninspected clue calls inspection; successful results fill its description card. Reopening an already received description is a local read, not an inspection command. No claim of server discovery. Include a small note that these are observations from this browser investigation.
6. SuspectOverview: responsive portrait cards with public names and generic roles, quick Question and Accuse actions, and actual received testimony excerpts where available. No occupation, motive, guilt score, secret, guessed relationship or inferred emotional meter.
7. AccusationDialog: select a suspect, then a distinct confirmation with the warning that confirmation ends the investigation. Initial focus goes to Cancel. Confirm submits true, Cancel/Escape submits false through the API; opening/selecting itself makes no mutation. Prevent duplicate submissions while either command runs. A failed cancel/confirm shows recovery controls without inventing an outcome. Restore focus to trigger when active, or to conclusion heading when ended.
8. CaseConclusion: prominent verdict using server finalResult, its exact explanation text, review received notes and Start a new investigation. Do not add a reveal-the-murderer panel after an incorrect accusation. New-session creation clears old observations only when a replacement is explicitly requested; user can review the old conclusion while creation is pending, then generation-reset atomically on success.

Desktop composition: an illustrated stage and substantial portrait/dialogue area, with navigation and a narrow evidence/contacts rail. Below about 900 CSS pixels, switch to a single column, compact navigation and full-width panels/dialogs; do not shrink body text or crop essential controls. Avoid nesting multiple scrolling panes on mobile. All routes are screen state, so browser Back/refresh does not imply saved investigation restoration.

### Visual system and asset organization

Direction: dark academia/gothic manor, warm lamps and rain-muted windows, book-lined interiors, rich wood and brass, restrained oxblood accents and parchment evidence sheets. The study, library and garden each need a distinct readable composition, not the same gradient with a changed label. Decorative scene images may suggest mood but must not depict a crime solution, specific suspect acts, incriminating ownership or new clues.

Proposed CSS tokens: backdrop #15161a, panel #242126, ivory #f4e9d6, muted text #c4b9a7, brass #d4ac6a, oxblood #733b48 and focus gold #f0c878. Verify actual combinations before acceptance rather than assume every palette pairing passes contrast. Use a local system serif stack (Georgia/etc.) for titles and system sans for body/forms; no remote font dependency. Panel spacing, borders, radii, shadows and focus styles are centralized in tokens.css. Use at most 120-180 ms opacity/transform transitions and disable nonessential motion with prefers-reduced-motion; no flashing/parallax/typewriter delay on received text.

If art is unavailable, create repository-native local SVG scene illustrations and portrait cameos with layered silhouettes, architectural linework, lamplight shapes and decorative framing. Portraits must be individually distinguishable and equally finished, without marking one as guilty. No image-generation call/tool/account is assumed. Use safe owned SVG without scripts, external resources or embedded hidden metadata; include alt/decorative semantics appropriate to each placement. Evidence illustrations are neutral catalog icons, not extra factual closeups. An asset failure falls back to an attractive generic scene/frame and visible public label.

The manifest is presentation only: location-name -> background/thumbnail/alt/decorative caption, public character ID -> neutral portrait/alt, clue ID -> neutral icon/alt, plus generic defaults. Use neutral names such as clara-voss-neutral.svg, never killer/innocent labels, concealed expressions, solution captions or private role bios. Location strings remain exact presentation lookup keys until a backend ID model exists; do not derive canonical location IDs or infer relationships from filenames. Artwork replacement changes manifest paths without touching API/state logic. Future expression variants can be supported by optional asset entries, but neutral is the only selected state until the API supplies authorized emotion/presentation data.

### State ownership and component architecture

```text
App / InvestigationProvider
  +-- API client (private session capability, request gate, timeout)
  +-- reducer (public snapshots, view selection, received observations)
  +-- MainMenu / LocationSelection / InvestigationScreen / CaseConclusion
        +-- SceneStage / Portrait / DialoguePanel
        +-- EvidenceJournal / SuspectOverview / AccusationDialog
```

Keep server snapshots authoritative: title/victim/entities/lifecycle/revision are replaced only by accepted API payloads. The reducer never computes correctness, truthfulness, disclosure conditions or clue access. Local state is selected scene/suspect/panel, unsent form drafts, request state, per-suspect received question/response records, and received evidence descriptions keyed by public ID. User-authored detective notes are deferred; actual observations fulfill the overview's notes area without inventing a new persistence feature.

The API client keeps its bearer capability in a closure/ref, not rendered reducer/debug state. It uses only same-origin `/api` endpoints and never logs requests/errors containing URLs. No storage, cookie, analytics, third-party art/font request or service worker. The token must exist in browser API-client memory and request paths by protocol; the privacy acceptance excludes that necessary capability from the prohibition on canonical case secrets, but requires it never appear in DOM, navigation, assets, console or durable storage.

### API integration, pending work and recovery

One imperative mutation gate is acquired synchronously before fetch; disabling React buttons alone is insufficient for same-tick double-click/Enter events. No create request runs from a mount effect, avoiding duplicate sessions in React development checks. API client explicitly constructs the exact JSON body keys, uses the latest accepted revision, validates response envelope/field types and rejects malformed/unknown payloads. Strip unknown fields before storing accepted public snapshots/results. All strings render as escaped text; do not use HTML injection or Markdown rendering for model output.

Each request carries a local session-generation counter and request ID. Reset the generation on session replacement/expiry and ignore every old completion before touching public state, transcript, journal or loading status. Within a generation reject lower revisions; equal-revision GET snapshots can reconcile lifecycle (the API supports out-of-band ending without a revision increment), but must never reopen an already observed ended state. Deduplicate command-result history by accepted request ID, not question text; repeated deliberate questions are valid. Add a successful response to history only after its session/revision checks pass, even if another suspect or scene is selected meanwhile; attribute it to the original addressed suspect. Users can navigate/read known observations while a mutation is pending, but other mutations remain disabled.

Use AbortController with a 15-second client timeout and cleanup on session replacement/unmount. An abort stops local receipt only; a server command may still commit. Keep unsent/uncertain question text, mark receipt as unknown rather than an NPC answer, and GET state before offering a deliberate retry. A refreshed unchanged revision does not prove the original command has settled; the next explicit attempt may still get session_busy. Do not clear this uncertainty by pretending rollback, poll forever or automatically send another accusation. A response lost after a question cannot be reconstructed from GET because there is no history endpoint; tell the player the reply was not received and let them ask again once ready. Lost creation has no recoverable token: an explicit retry may create another idle session; explain connection failure, do not make a hidden retry loop.

| Response/failure | UI action |
| --- | --- |
| 409 session_busy / stale_revision / stale_response | Preserve draft/notes; refresh public state and show a deliberate retry/refresh action; no mutation replay |
| 409 investigation_ended | GET state and show authoritative conclusion; if refresh fails show ended/recovery state, never an editable investigation |
| 404 session_not_found | Mark session unavailable/expired, stop commands, preserve known notes visibly as local history and offer explicit new investigation |
| 429 question_capacity / 503 session_capacity | Plain-language temporary-busy message and manual retry; do not spin a retry loop |
| 400/404 entity/405/413/415 | Show a safe input/configuration error and refresh where useful; retain input; do not expose raw HTTP request/token |
| 403 / 500 / invalid JSON envelope / network timeout | Safe service-unavailable/recovery notice; no raw response/stack; uncertain command outcome requires state refresh |

Initial title screen may use a generic game title; case title/victim exposition is loaded only from successful public state. No client-generated interim verdict. On ended state keep already-received notes readable; inspecting unreceived descriptions stays disabled. Refreshing the page starts a fresh client with a clear note that playthrough/notes are not saved; no misleading Continue button. Returning from conclusion to menu can retain in-memory notes for review until a new session is explicitly requested.

### Accessibility and measurable visual acceptance

Use semantic buttons/forms/headings, input labels and native modal dialog behavior with tested focus trapping, Cancel-first focus, Escape and focus return. Controls use visible labels alongside art, 44 CSS-pixel primary touch targets and visible high-contrast focus. Normal text contrast >=4.5:1; large text and essential control boundaries >=3:1. Error/loading states use aria-live and aria-busy without continuously reading the full transcript. Preserve input focus after answers and move focus intentionally on scene/screen changes. Enter submits from a single-line question input, with disabled/busy guards; no command-console hotkeys.

Test 1440x900 desktop and 390x844 mobile, plus a 360 CSS-pixel-width layout and 200-percent zoom manual check. Menus/journal/dialogs cannot overflow the viewport or hide focused controls behind fixed navigation. Use readable overlays on busy art; text is not baked into images. Reduced-motion tests disable transitions. Visual review must inspect real screenshots of title, scene/dialogue, journal, accusation and conclusion at desktop/mobile sizes; passing DOM tests alone does not satisfy the illustrated-game requirement.

### Testing strategy and manual end-to-end checklist

Keep root `npm test` running all 59 existing tests plus focused pure-client tests in `test/browser-state.test.js`. Those test duplicate gates, envelope projection, revision/generation rejection, equal-revision ending, known-note updates only on success and uncertainty recovery with injected fetch. No React dependency is required by the Node test runner.

Playwright Chromium specs in web/e2e use real browser controls and the real local API through Vite proxy; launch API with OPENAI_API_KEY/OPENAI_MODEL absent so no paid/network model calls occur. Controlled interception is reserved for errors/slow responses, with separate real HTTP offline playthroughs. See https://playwright.dev/docs/intro . Cover start/public data, scenes, portraits, asking and unsupported guidance, pending state/double-submit suppression, inspection markers, journal rereads, cancellation/confirmation/correct and incorrect endings, new-session reset, expiry/network/409 recovery, old-session/out-of-order deliveries, missing art and keyboard/mobile navigation. Use public fixtures, never import private case data into web source or assets. Existing backend tests may continue using case data; that does not authorize a frontend import.

Build with Vite and inspect the module graph, built files, source maps if any, static asset metadata and browser runtime/console/storage for canonical secret markers and accidental server imports. Plant forbidden canaries only server-side and prove they are absent from client artifacts/public state. Fixtures in browser tests contain public identities/observed replies only; never bundle answer keys/hidden lies into served assets. The necessary bearer appears only in client-memory/request paths, not console/DOM/storage. Verify text resembling HTML is rendered harmlessly. Do not claim bundle scanning resolves semantic dialogue leaks.

Manual checklist to deliver as docs/browser-playtest.md during implementation (record expected before actual; do not claim a playtest from screenshots or mocks):

1. Start local API without model configuration and Vite at port 5173; confirm title art, readable typography and a functional single Start action.
2. Start an investigation; check public victim introduction and exactly the three current suspects/three available clues; browse study/library/garden, each with distinct art and all contacts/clues still available.
3. Select Ben and ask Where were you?; expect the greenhouse-window response, loading/accessibility feedback and a correctly attributed history entry. Ask unsupported wording and distinguish guidance from testimony.
4. Inspect all three clues, verify API descriptions enter the folio and status changes only after success; revisit without sending another inspection request. Check no clue is labeled locked/undiscovered.
5. Open Clara's accusation dialog, cancel via button and later Escape; expect active play and fresh revisions. Confirm Clara and expect the exact correct-result message and no further gameplay commands.
6. Review known notes after ending. Start again and accuse Alice; expect the exact incorrect-result message without a murderer reveal and no history from the prior session.
7. Test temporary API loss, an expired session and stale-revision recovery; preserve drafts/known observations, avoid automatic accusation replay and show an explicit new-investigation path when required.
8. Repeat navigation/forms/dialog cancellation using Tab/Shift+Tab/Enter/Escape at desktop and narrow sizes; verify focus, labels, no horizontal page scroll, 200-percent zoom and reduced motion.
9. Capture desktop/mobile screens for visual review; check missing-asset fallback, contrast, distinctive portraits/scenes and absence of placeholder controls that do nothing.
10. Inspect console/storage/network/build output for leaked server data, source imports or tokens in unintended places; record actual observations and failures before marking visual/manual tasks complete.

### Future extensibility

Render arrays keyed by public IDs; a public-only synthetic 8-12-character fixture checks wrapping/fallbacks without adding real characters. Use a presentation manifest and screen-level components that can accept future public role/location/expression fields. Do not select emotional portraits by guessing from prose. Relationships/emotions require reviewed public fields and engine state; no static private relationship graph. Future cases use server-provided identity/content and manifest fallbacks, never import new truth into the client. Difficulty and Game Master controls appear only after backend capabilities exist. This change introduces no stubs or inert controls for them.

## Risks / Trade-offs

- [Scene browsing mistaken for simulation] -> Global contacts/clues, no physical placements/locks and a brief first-use explanation; defer real travel rather than fabricate it.
- [Lost response/history cannot be recovered] -> Keep only confirmed observations, show uncertain receipts and explicit retries; no save/continue claims or automatic replay.
- [Placeholder art looks like a dashboard] -> Require distinct illustrated scenes/portraits and screenshot/manual visual acceptance, not generic cards over a gradient alone.
- [Client bundled secrets or bearer leaks] -> Web-only import boundary, public-only projections/assets, same-origin API client, no persistence/logging/third-party resources and artifact/runtime checks.
- [UI tests add installation/browser overhead] -> Keep runtime dependencies small; use one browser-test tool and Node for pure logic; install only during approved implementation.
- [Visual openness outpaces current dialogue] -> Explain supported question topics with examples and preserve API guidance; do not promise expanded personalities or unrestricted conversation yet.

## Migration Plan

After approval, add the isolated frontend/tooling, wire the API client/state, create scene/portrait art and shared visual primitives, implement the full current-case loop, then verify pure tests, existing suite, Vite build, browser journeys, privacy boundaries and manual visual/accessibility checklist. Record actual results and limitations in the planning log. No backend or data migration is required; removing the web package/scripts returns to CLI/API-only use. No UI code, dependencies, art assets or tests are created by this planning session. Keep the change unarchived and uncommitted for review.
