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
