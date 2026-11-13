# Assessment B — mechanical evidence

Date: 2026-11-13. Target: `promo/index.html`; live target `http://127.0.0.1:5174/`. Isolated assessment: this reviewer received no Assessment A findings. No page source changes or game/API calls were made.

## Detector

Command: `C:/Users/Hajni/.agents/skills/impeccable/scripts/impeccable.cmd detect --json index.html`. Completed; saved verbatim JSON in `detector.json`: `[]` (zero CLI findings, no rule names or file locations). The PowerShell pipeline returned 0; the native detector exit code was not separately captured.

Browser detector successfully ran after mutation preflight. Console reported **4 anti-patterns**, all `straggler`, at 1440×900:

- `#how .game-loop li:nth-child(3) p`: “know.” alone on last of 2 lines, 7% measure (`index.html`, section on line 19).
- `#suspects .people article:nth-child(3) p:last-child`: “Manor.” alone on last of 3 lines, 19% measure (`index.html`, line 20).
- `.preview .reading p:nth-of-type(2)`: “clarification.” alone on last of 3 lines, 14% measure (`index.html`, line 23; identify by paragraph beginning “Meet Mara and Owen Vale”).
- `.preview .reading p:last-child`: “locally.” alone on last of 2 lines, 8% measure (`index.html`, line 23).

These are browser-only wrapping signals, not broken flows; treat as P3 typography polish. CLI markup scan cannot measure final rendered line breaks. No false positive identified for these signals; they are viewport-dependent and should not be treated as universal failures. Full console messages are in `browser-evidence.json`.

## Responsive and interaction checks

| Check | Evidence / outcome |
|---|---|
| 360, 390, 768, 1440 CSS px width | Document scrollWidth equals viewport at every width; no elements protrude right. Full-page screenshots saved. |
| 200% reflow | Emulated desktop 1440×900 at 200% as 720×450 CSS viewport; scrollWidth 720. Screenshot saved. This is not native browser-menu zoom; that exact interaction remains untested. |
| Reduced motion | `prefers-reduced-motion: reduce` matches; computed document scroll behavior changes to `auto`. |
| Images and alt | All six images loaded with positive naturalWidth at all four widths; all six have descriptive nonempty alt text. |
| Anchors | Every internal hash link resolves to an existing target (`#main`, `#how`, `#suspects`, `#try`). External GitHub/setup URLs inspected as href values only; not navigated. |
| Keyboard focus | All ten links occur in logical DOM tab order, scroll into view, and show computed 3px solid brass focus outline. Skip link becomes visible on first Tab (screenshot). No keyboard trap. |
| Primary CTA | Clicking “Try it locally” reaches `#try`, setup heading 32.48px from viewport top. Separate focused-CTA Enter activation reaches `#try`; result saved in JSON. |
| Console/runtime | Zero page errors; no console error messages. Vite connection debug messages plus detector logs only. |
| Network | Requests only to promo/Vite assets on 5174 and overlay detect.js on 8400. No game API call or remote navigation. |

Manual 390px screenshot inspection confirms readable section reflow and wrapped setup code without document overflow. Gameplay screenshots scale down as whole images: embedded game text is too small for detailed reading on mobile, though captions and alt describe their purpose. This is a P2 information-access limitation if those screenshot details are meant to be read; no zoom/open-image affordance exists.

Mobile navigation links are ~23.09px high; secondary GitHub link ~26.39px high. These fall short of a comfortable 44px touch-height recommendation (P2 ergonomics), while the primary CTA is 135.08×53.58px. Do not label this alone a WCAG 2.5.8 failure: that criterion permits spacing exceptions and a 24px minimum rather than 44px. Body inline text links likewise have text-sized hit areas.

## Overlay provenance and cleanup

Fresh isolated Playwright Chromium browser/page used. Native browser automation was unavailable; installed `web/node_modules/@playwright/test/index.mjs` supplied fallback. Initial sandbox browser launch failed `spawn EPERM`; escalation succeeded. An initial import-path typo was corrected before running checks.

Mutable preflight succeeded: set title to `[Human] The Ashcroft Manor Murder — Detective Game`, appended a script element, and confirmed its executed sentinel. Started helper with `live-server --background`; actual port **8400**, PID 7152. Injected `http://localhost:8400/detect.js`, waited 3 seconds, read console, and saved overlay screenshot. The injection and detector execution succeeded. **No persistent human-visible overlay is available**: this fallback used headless Chromium, which was closed after evidence capture; `[Human]` was a title label only. Do not claim the user can currently inspect a live overlay tab.

Stopped helper successfully with `live-server stop --keep-inject` (reported “Stopped live server on port 8400”). No HTML injection/removal command was used. Existing promo dev server remains running. Browser closed. Evidence scripts retained as reproducible artifacts rather than temporary files. Parent owns target slug, ignore-list, combined snapshot, trend, and final metadata steps.

Artifacts: `detector.json`, `browser-evidence.json`, `mechanical-check.mjs`, `keyboard-check.mjs`, `mechanical-360.png`, `mechanical-390.png`, `mechanical-768.png`, `mechanical-1440.png`, `mechanical-zoom200.png`, `mechanical-focus.png`, `mechanical-cta.png`, `mechanical-overlay.png`.
