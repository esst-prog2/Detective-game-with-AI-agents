# Homework 9 — Promotional page process

**Final status, 2026-11-13:** published and verified at https://esst-prog2.github.io/Detective-game-with-AI-agents/. Earlier pending/unpublished statements below describe their historical step, not the final state. User selected variant 2 and approved all four critique refinements.

This record describes actual work. Required tool workflows have not yet run. Installation approval and the user's later design selection are separate gates. No page has been published.

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 0. Preflight (2026-11-13) | Codex read the user's pasted request, AGENTS.md, planning-log context, README, package/Vite configuration, Milestone D report, and the 28 image-based lecture slides in 08.pdf. Inspected Git status, worktrees, remotes, screenshot inventory, installed skills and commands; fetched origin and confirmed PR #17 (Milestone D) and PR #18 (screenshot demo) are merged. Checked official gstack and Impeccable installation documentation. | User requires the genuine tool workflows, approval before installation, and a stop for design selection. Assistant created feature/homework-9-promo-page from origin/main 2c9d0ba after confirming a clean tree. Preserve the separate demeanor worktree and isolate the static promo from the local API. Installation remains pending approval. | See the preflight commit in Git history; its exact hash will be appended after creation. |

## Preflight evidence and limitations

- Repository remote: https://github.com/esst-prog2/Detective-game-with-AI-agents.git
- No tracked GitHub Pages workflow was found. Public visibility and Pages settings are not yet verified; GitHub CLI is absent from PATH.
- Existing screenshots are under docs/browser-screenshots, docs/room-screenshots, docs/dialogue-screenshots and docs/greyhaven-preview. Individual spoiler review is pending before any image is selected for publication. Conclusion/accusation images must not be included without review.
- Game uses isolated React 19 / Vite 8 frontend and a local Node API, with loopback proxy on port 5173 to port 3001. The promo must function independently. No game source was changed.
- Windows environment has Node 24.20.0, npm 11.19.0, Git and Git Bash. Bun and gh are absent from PATH. gstack and Impeccable are absent from the session skill catalog and checked local skill directories.
- Official gstack installation: https://github.com/garrytan/gstack#other-ai-agents and https://github.com/garrytan/gstack/blob/main/docs/install.md. Codex setup uses ./setup --host codex; the upstream labels Codex support experimental. Bun is a prerequisite. Full setup can download browser tooling and write agent skill/configuration files; inspect the script before execution.
- Official Impeccable installation: https://impeccable.style/tutorials/getting-started/ uses npx impeccable install, selecting Codex and installation scope. It supports Node 18.19+ and may require reloading the coding tool. The required shape, generate and critique workflows are documented at https://impeccable.style/docs/.
- The Sites skill was inspected for website guidance; the user's explicit GitHub Pages destination and genuine-tool requirements take precedence over Sites hosting defaults. No Sites project was created.
- No gstack content, Impeccable brief, design variants, critique, publication, or completed security review is claimed at this stage.

Preflight commit: ac2fe9cda4f333c45c7970e02ae868354b495ba5 (docs: record homework 9 preflight and required tool setup).

## Step 1 — Approved tool installation (2026-11-13)

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 1. Tool installation | Installed Bun 1.4.4 using its documented npm global install; cloned official garrytan/gstack at 6b033e79fa06477cbec44875209db65a281e0718 and ran ./setup --host codex --no-team through Git Bash; installed Impeccable 4.9.0 with its official CLI for Codex globally, without optional hooks. gstack setup reports version 1.99.3.0 and downloaded its Chromium tooling. setup --status verifies the global router and all 74 section links. Impeccable --version and context execute successfully (engine 0.1.23, Windows x64). | User explicitly approved all three installations and selected gstack Builder mode for the university demo. Assistant kept installers outside the game checkout, used Codex-only scope, and left optional Impeccable hooks and gstack team auto-update disabled. | Installation commit is the commit introducing this section; its hash will be recorded with the next completed step. |

Compatibility notes: gstack labels Codex support experimental. Its optional CSO scanner is unavailable without the Windows MSVC C++ toolchain; no additional toolchain was installed. This does not prevent office-hours or the required Impeccable workflows. Bun works via bun.cmd in PowerShell and bun in Git Bash without changing PowerShell execution policy. gstack's local brain cache is unavailable because no gbrain service is configured; no prior product/goals digest was claimed. Impeccable's context loader ran; init/shape interviews and confirmation are pending, and no UI implementation has started.

Installation commit: `6788ba6c5033ca639c0d8d72ff05d82c6376a84f`.

## Step 2 — gstack content and Impeccable product context (2026-11-13)

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 2. Content | Executed installed gstack office-hours in Builder mode, with actual premise and approach decisions, authorized category research, source claim audit and a requested independent cold read. Read the installed Impeccable init/shape references and executed its context loader; wrote confirmed PRODUCT.md. Prepared docs/homework-9/page-copy.md, claim-audit.md, second-opinion.md and office-hours-record.md. gstack-redact found zero findings in the exact decision record; copied it to gstack's cross-session project store. | User confirmed the Ashcroft-first framing, local-play/GitHub actions, separate Greyhaven preview and bounded AI wording. Chose A, investigation-led, and code-first browser design. Assistant applied the review's local-play clarity recommendation. No visual variant is selected. | Content commit is the commit introducing these artifacts; hash will be recorded with the next completed step. |

Actual review limits: Claude Code was absent, so the prescribed Codex in-host sub-agent fallback ran; no external-provider/cross-model review is claimed. Its complete output is retained in docs/homework-9/second-opinion.md. The user's initial detailed plan answered the Builder discovery questions. The user explicitly assigns visual work to Impeccable after content, so gstack's generic visual mockup/sketch phase was deferred, not misrepresented as completed. Existing screenshot inventory was inspected; no screenshot has yet been selected into a public site artifact. Setup commands were checked against source and documentation; final runtime smoke verification is still pending. Impeccable's product context is confirmed, but shape's design brief is not approved yet.

Content commit: `dc789b861fdb7f97c1ab9281d53f335b8023f9f4`.

## Step 3 — Impeccable shape draft (2026-11-13)

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 3a. Shape draft, confirmation pending | Followed installed shape discovery using the confirmed product framing; inspected the existing illustrated visual identity and four genuine screenshots, read new-work/mode guidance, and ran Impeccable concept-seed for a persuasive whole surface. The successful API roll dealt 4/2/7 from seven content-grounded structures (seed:0cf309faf8da8f81). Wrote docs/homework-9/design-brief.md covering audience, message, hierarchy, typography, color roles, assets, accessibility, mobile behavior, actions and delivery. | Assistant proposes inheriting the game's existing charcoal/brass/illustrated identity and retaining the approved investigation-led content. User's required order keeps composition open for the later genuine generate browser round. Brief confirmation and final visual selection remain pending; no page code or variants are claimed. | Draft commit is the commit introducing the brief; its hash will be recorded with the next completed step. |

Operational note: an earlier attempt to inspect concept-seed help returned an unscoped/degraded roll because this engine treats that argument as a command invocation. It did not determine a design. The subsequent explicit surface/persuade invocation with network access succeeded and is the only concept result used in the brief. No generated browser session, overlay, sketch or variant exists yet. The shape skill explicitly stops for confirmation of the brief before code.

Shape draft commit: `06fed5b`. User approved the brief on 2026-11-13 with "I approve". Shape is now confirmed; proceed to actual Impeccable generate browser variants, with visual selection still pending.

## Step 4 — Impeccable generate (2026-11-13)

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 4. Browser variants | Installed Impeccable live-generate opened the isolated localhost:5174 page and created real session 7426b21b, action layout, count 3. Agent wrote three complete page replacements into the returned scaffold atomically, with scoped CSS and working Tune parameters, then published them to the actual overlay using live-poll done/then-poll. Details and provenance are in docs/homework-9/generated-variants.md. | User approved the shape brief (205d09b) but has not chosen a visual variant. Assistant preserves the illustrated charcoal/brass identity and presents case-file spread, gameplay walkthrough and room-led theatre layouts. Stop here for selection; no selected-design finalization, critique or publication. | Generation commit is the commit introducing promo/ and this record; its hash will be appended with the next completed step. |

Preview limitations are explicit: no variant screenshot or QA was run because the installed workflow makes the overlay the pre-accept review channel. Game source is untouched. Historical screenshots still need final freshness/size review and an evidence-inspection image. Local overlay credentials are excluded from committed source and runtime records are ignored. The final static deployment must exclude all helper scaffolding.

Generation commit: `636fd35`. User chose variant 2 in the browser and confirmed in chat: "I chose the 2nd".

## Step 5 — Selected design implementation (2026-11-13)

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 5. Selected gameplay walkthrough | Recovered the real browser's accepted variant 2 with density/proof defaults 1/1, moved its scoped CSS into the permanent stylesheet and removed all helper wrappers. Impeccable live-complete confirms completed; live-server stop removed injection. Captured current offline game room/evidence/dialogue/preview screens through actual controls, reviewed the public scenes and converted the three used screenshots to WebP. | User chose variant 2. Assistant preserves its composition, factual copy and local-only play boundary; adds the required evidence-inspection screenshot and keeps server modules outside promo/. Repository is already public; authenticated read-only API confirms administrative publishing permission and no existing Pages configuration. | Selected implementation commit is the commit introducing these changes; hash follows in the next step. |

Current screenshot bytes: study 71,578; evidence 80,554; dialogue 80,536 (WebP quality 90). Origins/hashes are in promo/assets/provenance.json; originals and repeatable capture helper are retained outside the site artifact. Initial capture on 5175 was rejected by the existing API origin policy; reran on the documented IPv6 localhost:5173 isolation setup without changing that policy. Only this helper's temporary game processes were stopped. Live promo preview at 5174 is retained for review.

Selected implementation commit: `60ca21f199553aa845f0cfa5d4890733d43ad094`.

## Step 6 — Impeccable critique and improvements (2026-11-13)

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 6. Critique and improvements | Ran the installed critique workflow with isolated A design/B detector-browser assessments, receiving A before B. Reviewed classmate/teacher/stranger perspectives, scored 25/32 Good, persisted the first critique snapshot and asked targeted scope/interaction questions. Browser detector ran successfully; CLI scan had zero findings, browser scan four P3 line wraps. Applied four P2 refinements and independent reviewer verified all resolved. Shipped Impeccable documenter extracted promo/DESIGN.md and its token sidecar without redesign. | User chose all four refinements and labelled full-size screenshot links. Assistant added gallery navigation/44px targets, accessible image links, explicit Windows prerequisites/folder guidance and plain reviewed-response wording. The original score remains historical; no invented post-fix rescore. | Critique commit is the commit introducing the report and improvements; hash follows in the publication record. |

Full record: docs/homework-9/critique.md, critique-design.md, critique-fix-verdict.md and mechanical/critique-mechanical.md. Main report was presented in chat before snapshot persistence. First run, no trend yet. Reviewer disposition is **ship within the four-fix design scope**; no native screen-reader or cross-browser certification is claimed. User questions were answered before fixes. All historical screenshots/proof reports are retained outside the deployable artifact.

Verification after fixes: production Vite build passes; project-prefix smoke at 360/390/768/1440 widths passes all six images, hash destinations, keyboard skip/setup, no duplicate IDs, no helper scaffolding, no game API requests, zero page/network errors and real CSS 200% reflow. Node regression suite passes 656/656; src/, web/ and package files are unchanged. Audited production artifact has six files, 256,232 bytes; zero findings across exact artifact bytes, all reachable historical promo text/assets, and tracked .env history. It contains no JavaScript or source maps. Existing repository game source contains solutions and is intentionally excluded from the artifact and its new branch history.

Critique/improvement commit: `78f5c18cf2a4d2ff42c5e1e706ba632d28e2fa59`. Follow-up `244ec61c8221ccf16ec8bad104303f6ab0acc96a` normalized two trailing blank lines and refreshed the history audit; the published artifact was unchanged.

## Step 7 — GitHub Pages publication and public verification (2026-11-13)

| Step | What the tool did | What I decided | Commit |
|---|---|---|---|
| 7. Publication | Uploaded only the audited six-file build to a new independent gh-pages root through the authenticated GitHub Git API. GitHub auto-enabled Pages on branch creation; the explicit setup POST returned409 already enabled. Read-only follow-up confirmed gh-pages /, completed successful workflow43492475698 and built status. Actual HTTPS browser smoke passed360/390/768/1440 widths, all6 images, anchors, keyboard,200%reflow, no API calls or runtime errors; every served file's SHA256 matches the audit. | User already authorized publication after selecting the design. Assistant preserved existing public visibility and main/game source, did not force-push or rewrite history, and resumed the existing deployment after409 instead of uploading another build. Final page is ready for the user to submit its URL on Canvas; no Canvas submission is claimed. | Deployment root `c1230608987a2fcda603f72bbe020dc921eb717d`, built from source `244ec61c8221ccf16ec8bad104303f6ab0acc96a`. |

Public URL: https://esst-prog2.github.io/Detective-game-with-AI-agents/

Successful workflow: https://github.com/esst-prog2/Detective-game-with-AI-agents/actions/runs/43492475698

Evidence: docs/homework-9/deployment.json, publication-audit.json, verification/public-smoke.json and public-*.png. GitHub/requisite links independently returned200. Full-size screenshot links were browser-tested by the independent reviewer. Review records are outside the deployed artifact; server modules, private case solution fields, credentials and live-helper state are absent from Pages. Original game source is unchanged; the existing repository still contains its source and ordinary Git author metadata. No native screen-reader/cross-browser certification or clean-machine reinstall is claimed; current offline game startup and real Ashcroft evidence/dialogue plus Greyhaven selection were exercised. No video, slides or new mechanics were implemented.

## Commit index

| Step | Real commit |
|---|---|
| Preflight | ac2fe9c (+362c281 hash reference) |
| Approved tool installation | 6788ba6 |
| gstack content + product context | dc789b8 |
| Impeccable shape | 06fed5b; user confirmation205d09b |
| Impeccable generate, three browser variants | 636fd35 |
| Selected variant2 | 60ca21f |
| Three-perspective critique and fixes | 78f5c18 |
| Final audit/whitespace | 244ec61 |
| Published Pages artifact | c123060 (separate gh-pages root) |

Final verification/documentation commits follow this index in Git history and are listed in the final handoff. All original planning-log lines remain append-only.
