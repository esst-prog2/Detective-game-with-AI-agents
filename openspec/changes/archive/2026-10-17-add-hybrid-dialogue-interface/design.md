# Design

## Context

See proposal.md. Audited DialoguePanel renders latest.text in a blockquote, free text and six static draft buttons; received-history records are browser-local. The client resultFor/publicState functions explicitly strip unknown fields. The reducer attributes question records using input.question and request ID, so choices and server history require deliberate handling. CharacterFigure already separates the large neutral figure from cameos through an asset manifest. Existing room/ReadingDialog/focus/revision safeguards are reusable.

Phase 1 defines all question/result/public dialogue schemas and server history limits. Phase 2 adds optional safe AI without changing those public schemas. This phase must not invent a second dialogue schema or import authored server catalogs.

## Goals / Non-Goals

**Goals:** present a person in a room, keep free text prominent, add contextual engine choices and optional performance narration, retain accessible received history and honest recovery.

**Non-Goals:** dashboard/chat redesign, frontend intent recognition, automatic evidence/guilt reasoning, emotion scoring UI, new artwork requirement, relationship simulation, persistent accounts/session recovery after reload or new API endpoints.

## Decisions

### 1. Cinematic layout and structured replies

Preserve current illustrated room, dark-academia tokens, prominent large neutral figure and integrated dialogue overlay. Render a concise narration paragraph in distinct italic styling only when narration is non-null, followed by clearly labeled spoken dialogue. Render speech as escaped text, not HTML/Markdown. Do not quote narration as if spoken or render the legacy text as a duplicate. Unsupported guidance is labeled guidance and has no gesture/speaker testimony attribution. Null narration leaves no reserved empty gesture box.

Place up to six engine-provided choices in a compact wrapping region below the current reply, above or alongside the labeled free-text form; on narrow screens use readable wrapping/vertical flow while keeping the figure and question controls accessible. Options indicate their public kind where useful (follow-up/evidence/revisit) without adding reasons from frontend inference. Free text retains its own labeled input and submit action and 1,000-Unicode-character validation. An option sends one command directly; it does not replace player draft text or require editing into a question. Preserve in-progress typed drafts when a choice succeeds.

The first conversation offers current engine options even before a reply. Later options reflect the latest accepted public state, not component-held topic tables. Remove static-only six-example help as the main source of suggestions; an explanatory help sentence can remain without fabricating choices. Revisited subjects/clarification/presented evidence/comparisons use the engine's labels and currently available IDs. If no options exist, free text still works where allowed; if suspect is remote/ended, gameplay is disabled and reading stays available.

### 2. Projection, submission and history

Extend publicState and resultFor with explicit type/bounds/enum/ID checks matching phase 1; validate narration/dialogue/text consistency, substantive turn IDs and option records. Never spread incoming server fields. Exclude private metadata/canaries from reducer state. Keep bearer solely in the client closure. Retain client.ask(suspectId,question); add client.choose(suspectId,choiceId). Both use the same questions mutation path and revision/generation/room checks. Build exactly one of question or choiceId, reject malformed combinations locally and preserve server authority. Display selection labels from current accepted options, never accept a forged label as a command fact.

Use server turnId + suspect ID to deduplicate substantive history and merge bounded recentTurns from GET reconciliation. A lost successful HTTP reply can be recovered only if it remains in that window. Existing browser-retained older received turns remain readable; do not imply complete server persistence or delete them because GET truncates. Store actual player input or engine-rendered choice label as question attribution, narration and dialogue separately. Unsupported guidance can remain browser-local, clearly distinguished and keyed by accepted request ID, since it has no substantive server turn. No model/user assertion becomes verified fact through history styling. No automatic canonical contradiction badges beside ordinary testimony.

Server inspectedEvidenceIds is now the authority for evidence-choice eligibility. Existing browser-local description cards remain actual received notes; do not invent missing descriptions from an ID or fetch remote evidence to reconstruct them. Reconciliation can mark an ID as inspected in this investigation without claiming the browser has its description. Label the state honestly and offer engine-permitted inspection/travel to receive it while active. Ended review remains read-only. Do not silently clear drafts or longer local notes on recoverable errors.

### 3. Request races and lifecycle

Keep synchronous one-mutation gate, 15-second timeout uncertainty, no automatic replay, memory-only capability, session-generation and revision checks. Text and choice operations are both questions for pending/room-generation logic. Freeze action buttons while pending; reading history/dossiers remains possible. Retain drafts on error. 409 dialogue_option_unavailable shows fixed actionable text and requests explicit state refresh; do not resubmit a different choice automatically. After refresh, options may change; retain focus sensibly on the group heading/next valid action if an old button disappears.

Discard old-session, stale-room, lower-revision and ended-late replies before appending narration/speech/history or changing demeanor. Equal-revision ended reconciliation still closes gameplay. Dedupe GET/command turn delivery, including GET overtaking a command. Do not advance displayed canonical state from optimistic choice selection. New investigation resets server dialogue context/local history atomically on successful creation.

### 4. Demeanor and future expression assets

Use only approved coarse public demeanor (neutral/receptive/irritated/uneasy), with a short text label in the conversation; no trust bars, numbers, guilt/fear predictions or hidden trigger descriptions. It reflects conversation, not truthfulness. Do not infer expression from keywords in speech or suspect identity. Extend the presentation seam to accept an optional public demeanor/expression slot mapped to a safe local asset when available; all current mappings can keep the existing neutral figure. Missing variants use neutral/generic fallback. No new polished illustration or animation requirement and no secret-bearing filenames or alt text.

### 5. Accessibility and verification

Use semantic buttons with clear question labels; not a custom keyboard-only listbox. Preserve visible focus, reading-dialog trap/Escape/return, keyboard submission and focus after list changes. Announce completion/status once without reading the entire history or stealing focus; narration and dialogue remain accessible in document order. Keep 44px primary targets, 4.5:1 normal-text and 3:1 large/control contrast, 360px layout and 200-percent zoom/reflow, reduced motion and readable long content. Style text and typography, not color alone, to distinguish narration/speech/guidance.

Add pure Node client/reducer tests for exact choice bodies/projections, draft preservation, bounded-history merge/dedupe, malicious fields, concurrency/generation/room/end guards and error recovery. Playwright desktop/mobile tests must cover complete offline case, both final outcomes/cancellation, mixed text/choices, repeat/clarify, inspected evidence prerequisite, reviewed comparison, independent sessions and stale/reordered model fixtures. Check escaped script-like input, no bearer rendering/storage and no server/private content in production graph/assets/bundles/source maps. Keep existing browser journeys, adapting exact fixtures only to the additive contract. Synthetic eight/twelve-contact and long-label/null-narration fixtures exercise scaling without expanding canon. Inspect actual screenshots at desktop 1440x900, mobile 390x844, 360px and zoom/reflow; document manual observations separately from automated results. Do not claim a real-provider test or screen-reader certification without performing it.

## Risks / Trade-offs

- [Choices crowd the cinematic scene] -> compact six-option cap, responsive flow and actual visual review while retaining dominant figure.
- [Bounded server history appears complete] -> explicitly label recovered recent window and retain older actually received local turns without claiming persistence.
- [Demeanor suggests guilt] -> coarse conversation-only labels, neutral artwork fallback and no truth/lie annotations.
- [Late GET duplicates a command] -> stable turn IDs and merge-by-speaker/turn only after accepted session/revision/room/lifecycle validation.
- [New fields bypass existing privacy projections] -> explicit allowlists, nested canaries and production import/artifact scans.

## Migration Plan

After prior phases and approval, update projections/client/reducer before UI rendering, then integrate choices/history/inspection labels. Existing text remains a compatibility field, but the new client requires the phase-1 schema; deploy matching local API/client and restart ephemeral sessions. Preserve existing npm commands and Vite /api proxy. Run full Node and Chromium suites, production build/privacy checks, visual/accessibility review, strict OpenSpec validation and diff check; append actual outcomes. Roll back browser to text-only rendering against the additive API if necessary. Do not commit, push, merge or archive without separate authorization.
