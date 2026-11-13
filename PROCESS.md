# Homework 9 — Promotional page process

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
