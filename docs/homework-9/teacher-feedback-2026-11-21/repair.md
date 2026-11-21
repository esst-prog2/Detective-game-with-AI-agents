# Teacher-feedback repair — 2026-11-21

PR19 merged into main as b1d65f7; repair branch fix/promo-screenshot-links starts there. Working tree was initially clean; unrelated worktree preserved. Actual Pages source is gh-pages / through the dynamic pages-build-deployment workflow, so deploying the existing isolated artifact does not require merging a new source PR.

## Root cause and regression

Before repair, all six published image/caption destinations returned404; before-public-links.json records each actual HTTP result. The original production build rewrote thumbnail src to hashed files while leaving href as ./assets/study.webp etc. The new check-promo-assets.mjs failed against that original build (ENOENT dist/assets/study.webp). That is the missing regression coverage in the November13 smoke check, which tested full-size navigation only on the development server. PROCESS.md appends the correction without changing the historical claims or evidence.

## Source repair

Move the exact original WebP bytes from promo/assets to promo/public/screenshots. Image src and image/caption href use %BASE_URL%screenshots/<name>.webp. Vite's existing relative base becomes ./ in built HTML; public files retain their names. All six links now resolve to intended stable files under /Detective-game-with-AI-agents/screenshots/. No CSS or screenshot pixels changed. Updated provenance paths refer to the new source locations.

Windows instructions remain. A new macOS/Linux note supplies equivalent npm commands, home-folder paths and POSIX unset for offline mode. Commands match package.json and README's two-terminal startup model; execution on those operating systems has not been tested.

## Verified before publication

- Vite8.3.4 production build passes:6files,256993bytes. No imported hashed screenshot filename remains; CSS keeps its normal generated hash.
- Dependency-free static regression checks all six image/caption links, intended screenshot order, all non-inline image src, stylesheet existence, project-base confinement and preview/helper URL exclusion. The documented local-game address127.0.0.1:5173 intentionally remains in setup instructions.
- Expanded browser smoke serves the built artifact at the repository prefix, not Vite dev:360/390/768/1440px checks pass; all six actual full-size clicks return200 image/webp with naturalWidth1440; thumbnails, captions, note, keyboard, anchors and200%CSS reflow pass.
- Existing publication audit passes with zero findings. Three screenshot SHA256 comparisons prove original bytes unchanged.
- Dated production/public evidence preserves all original November13 files. Public repair verification is pending until deployment; it will be appended below rather than inferred from localhost checks.

## Reproduce

From promo/: `node ../web/node_modules/vite/bin/vite.js build --config vite.config.mjs`.
From root: `node scripts/check-promo-assets.mjs`.
Set PROMO_VERIFY_DIR=docs/homework-9/teacher-feedback-2026-11-21, then run `node scripts/homework-9-smoke.mjs` (built localhost) or append the actual public URL after deployment.
Set PROMO_RECORD_DIR to the same dated directory for audit/deployment records.
