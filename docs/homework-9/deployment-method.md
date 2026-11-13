# Isolated GitHub Pages publication

The approved promo builds with the existing Vite installation:

```powershell
cd promo
node ../web/node_modules/vite/bin/vite.js build --config vite.config.mjs
cd ..
node scripts/homework-9-smoke.mjs
python scripts/homework-9-audit.py
```

The separate `gh-pages` branch contains only audited `promo/dist` output and an empty `.nojekyll` marker. It starts with an independent root commit, so game modules, case solutions, screenshots not selected for publication, process records and original Git history are not inherited by that artifact branch. GitHub Pages uses branch publishing from `gh-pages` `/`; GitHub runs its Pages build/deployment workflow. Source and review evidence remain on `feature/homework-9-promo-page`; main/game code is not merged or changed by deployment.

`scripts/homework-9-github.py publish` verifies that every file still matches the audited manifest, requires the repository to be public, refuses a conflicting Pages source, creates Git blobs/tree/commit using the authenticated GitHub API, and creates or fast-forwards the deployment ref without force. Existing authentication comes from Git's configured credential helper and stays only in process memory. The helper does not print, store or accept a token in command arguments. Repository visibility is never changed.

`python scripts/homework-9-github.py status` inspects the actual Pages build and workflow run. After it completes, verify the real HTTPS URL using `node scripts/homework-9-smoke.mjs <actual-public-url>` and compare public asset hashes against the audited manifest. A push or API settings success alone does not establish publication.

Vite uses `base: './'`. All bundled asset references are relative and the smoke server mounts exactly `/Detective-game-with-AI-agents/`. The game still requires its own local Node API and browser dev server; the public promo never imports or calls them.

Permissions preflight: GitHub API returned public repository with admin/push permission, Pages 404 and no existing gh-pages branch. GitHub's official branch-publishing and Pages REST documentation were checked on 2026-11-13:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/rest/pages/pages

Security scope: the audit covers exact deployment files and relevant promo history, not a claim to scrub the already-public game repository. `.env.example` has empty key/model values; no tracked `.env` history was found. Public Git history contains ordinary author metadata and the original game source; no repository visibility or history rewriting is performed.
