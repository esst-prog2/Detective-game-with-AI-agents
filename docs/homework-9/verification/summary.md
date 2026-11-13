# Final verification — 2026-11-13

- Existing `npm.cmd test`:656 tests,656 passes,0 failures (no game changes).
- Isolated `vite build`:3 modules,6 deployable files,256232 bytes total; HTML17.41kB, CSS6.14kB, three WebP screenshots232668 bytes. Portraits are inlined; no JavaScript or sourcemaps.
- Local production smoke at the exact GitHub project prefix and actual public HTTPS smoke:360/390/768/1440 widths, CSS200%reflow, reduced motion, six images, descriptive alternatives, unique IDs, anchor targets, keyboard skip/setup, zero HTTP/page errors and no API calls.
- Main CTA local-play instructions match tracked npm scripts and were exercised through the current offline game for capture. Windows-specific terminal folder commands are explicit; no AI key needed.
- Independent reviewer tested full-size screenshot click/Back,44px header navigation, setup and AI wording. All four approved refinements resolved; no material regression observed. Original25/32 critique score remains historical.
- Exact artifact plus relevant promo history scan:0 findings,10 historical text blobs at final scan, no tracked.env history. Full-size game capture images visually reviewed for spoilers; only public initial room/clue/dialogue states enter the site.
- All six public files returned200 and matched audited SHA256 hashes. GitHub repository and prerequisite download links returned200.
- Successful GitHub Pages workflow43492475698 deploys independent gh-pages rootc123060 from source244ec61. See deployment.json for machine-readable evidence.
- `git diff --check 2c9d0ba..HEAD` passed after review-evidence whitespace normalization. Source comparison against the starting main proves src/,web/ and both root package files unchanged.

Limits: automated Chromium and assistant visual review, not screen-reader or multi-browser certification.200%CSS zoom/reflow is not native browser-menu zoom. No fresh-machine dependency reinstall was performed. GitHub source is public and contains the game's ordinary source/history; this differs from the spoiler-safe Pages artifact. Canvas submission remains the user's action.
