# Review 5: Dependencies, dead code and unused features

## Scope and method

Whole tracked repository inventory, including root/web manifests and lockfiles, all JS/JSX/MJS imports/exports and entry points, CSS selectors, tests/fixtures, scripts, assets, OpenSpec and evidence/docs. Used `git ls-files`, `git grep`, `npm ls --all`, web direct-dependency listing, both npm audits and a production bundle build. Verified references before deleting. Optional feature entry points and historical experiment code were considered callers even when not reachable from the normal offline UI.

## Findings and changes

**Low, fixed: abandoned scene component and styles.** `web/src/components/SceneStage.jsx:1` (base revision) had no runtime/test import or dynamic lookup anywhere. The active `web/src/screens/InvestigationScreen.jsx:8` renders room artwork/cinematic conversations directly. Its only other name references are the earlier browser design document, which describes historical architecture. Removed the unused component and 16 rules dedicated to its `.scene-stage`, `.scene-background`, `.scene-vignette`, `.scene-heading`, `.scene-back` and `.scene-label` markup from `web/src/styles/game.css`. Historical documentation and screenshots remain untouched. This avoids maintaining a second, unreachable scene presentation.

No unused direct dependencies confirmed:

| Package | Verified use |
| --- | --- |
| root `openai` | Dynamic imports in current configured performer, explicit historical phraser and historical experiment |
| `react`, `react-dom` | Browser rendering, context and hooks |
| `vite`, `@vitejs/plugin-react` | Isolated browser development/build configuration |
| `@playwright/test` | Desktop/mobile tests and screenshot walkthroughs |

Root `openai` uses a same-major caret range; the committed v3 lockfile pins 7.23.0 with registry URL and integrity. Web direct versions are exact and transitive resolutions/integrities are locked. These are adequate reproducible-install constraints with `npm ci`; no upgrade/pin churn justified. Optional SDK peer dependencies reported as unmet are optional integrations, not missing requirements for the Responses path. No suspicious non-registry dependency source or install script was found in the repository manifests.

Retained: `validateCase` is used by case-integrity tests; historical phraser exports are documented trusted APIs and used by old fixtures/experiment; archived walkthroughs are explicitly retained historical tooling. Authored dialogue variants and artwork fallbacks have current consumers. No other confirmed unreachable source module was removed. Broad removal of old/shared CSS selectors was avoided; only selectors exclusively tied to the deleted component were changed.

## Verification

- Both `npm.cmd audit --json` and `npm.cmd --prefix web audit --json`: **0 known vulnerabilities**, including web dev dependencies, on 2026-10-17. Advisory databases are not proof of supply-chain safety.
- Dependency listings match lockfile direct versions; no package/lockfile change.
- `npm.cmd run build:web`: **passed**, 39 modules; built artifact privacy/no-source-map checks passed. CSS decreased to 26.21 kB (6.34 kB gzip). Initial sandbox Vite EPERM was rerun with subprocess permission.
- No test added for deleting an unreachable component. Final complete desktop/mobile suite checks active layout behavior after CSS removal.
