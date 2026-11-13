# Assessment A — independent design review

Method: isolated design-review agent `/root/promo_design_critique`; no detector output received or consulted. 2026-11-13. Target: `promo/index.html` and `promo/style.css`, user-selected variant 2 (annotated gameplay walkthrough). Context: PRODUCT.md and approved docs/homework-9/design-brief.md. Mode: Persuade. Recommendations refine the selected composition.

## Design specificity

Clearly authored for this game. The real illustrated study, recognizable suspect portraits, warm brass and restrained serif hierarchy connect the promo to Ashcroft rather than a generic software landing page. The numbered investigation sequence makes the game understandable. The principal missed opportunity is making screenshot details inspectable: current images establish atmosphere better than they demonstrate questioning or evidence reading.

## Design health

| # | Nielsen heuristic | Score | Evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Local-only/offline status is explicit; navigation has no current-section indication. |
| 2 | Match with the real world | 3 | Player actions are plain; “authorized performances” requires interpretation. |
| 3 | User control and freedom | 4 | Ordinary anchors, repository links and a working skip link; no trapping flows. |
| 4 | Consistency and standards | 4 | Cohesive type, link, color and section patterns. |
| 5 | Error prevention | 3 | No misleading hosted Play button; two-terminal requirements explicit, but second terminal folder instruction assumes knowledge. |
| 6 | Recognition rather than recall | 3 | Named actions and captions work; screenshot destination absent from navigation. |
| 7 | Flexibility and efficiency | n/a | Persuade surface; no expert workflow to accelerate. |
| 8 | Aesthetic and minimalist design | 3 | Clear emphasis and restrained decoration; mobile proof becomes thumbnail-sized. |
| 9 | Error recovery | n/a | Static page has no input or recoverable application-error state; local setup guidance scored under help. |
| 10 | Help and documentation | 2 | Setup and README present, but prerequisites and second-terminal folder step remain assumed. |
| | **Total** | **25/32 (78%, Good)** | Eight applicable heuristics. |

## What works

- The hero immediately states three player actions, names the game and distinguishes local play from a hosted game. The primary action is unmistakable.
- Real room, clue and dialogue captures preserve the visual identity; public suspect introductions avoid solution claims. Ashcroft leads and Greyhaven is explicitly separate and incomplete.
- Readable supporting copy, clear focus treatment, semantic headings, descriptive alternatives and reduced-motion support provide a solid accessible foundation. No horizontal overflow at 360px or 390px was observed.

## Priority refinements

1. **[P2] Gameplay proof cannot be read on a phone.** At 390px, the entire 1440px evidence and dialogue screens shrink to 350px. The text and question controls are effectively illegible; images have no enlargement link. This matters because the page promises to show investigation in action. Keep all three genuine screenshots, add clearly labelled links to their full-resolution assets (or a keyboard-accessible enlargement), and let captions identify the particular visible action. Do not invent crops or new gameplay. Suggested command: `$impeccable adapt`.
2. **[P2] The screenshots are hidden behind a long reading path.** Header links reach investigation steps, suspects and setup, but none reaches `#screenshots`. This misses the brief's explicit screenshot-navigation requirement. On mobile the proof gallery comes after the five-step list and all three biographies, while the initial screenshot appears only around y=689. Add “Gameplay screenshots” as the fourth header destination, with adequately padded targets; retain the selected walkthrough structure. Suggested command: `$impeccable layout`.
3. **[P2] Setup assumes the newcomer already knows the tools.** The page names Git, Node.js 24 LTS and PowerShell without prerequisite links; “open the cloned repository folder” in the second terminal gives no concrete `cd` instruction. The commands themselves wrap safely, but a mystery enthusiast can still stall before playing. Link prerequisite names to official installation guidance, explicitly label the procedure Windows/PowerShell, and give the second-terminal folder command or a concise explanation of opening a terminal there. Preserve verified commands and the two-terminal model. Suggested command: `$impeccable onboard`.
4. **[P2] The explanation of the project's distinctive response system becomes internal language.** “Optional AI selects from authorized performances” bounds the claim but does not explain it to someone new to AI agents. Replace that phrase with plain language such as “Optional AI chooses how a reviewed response is delivered; it cannot add new facts to the case,” subject to source verification. Keep offline availability and reviewed facts explicit. Suggested command: `$impeccable clarify`.

## Required audience perspectives

- **Classmate (quick evaluator / Alex):** The game is recognizable immediately, and setup is a header jump away. Strongest criticism: the gallery's dialogue and clue text cannot be inspected on a phone, so comparing the promo's claims with the actual interface requires opening the repository or browser zoom.
- **Teacher (methodical evaluator / Riley):** Scope is unusually honest: real proof, local setup, bounded AI and complete-versus-preview distinction are present. Strongest criticism: the brief explicitly requires direct screenshot navigation, yet the header has no gallery link. Course context appears at the end, which is acceptable for the game-first brief.
- **Stranger (first-timer / Jordan, mobile Casey):** The goal and three actions are clear, and the local-only note prevents a false Play expectation. Strongest criticism: the conversion ends in a developer setup procedure with unlinked prerequisites and an assumed folder-navigation step. The bounded-AI paragraph also adds translation work.
- **Keyboard / Sam cross-check:** First Tab reveals “Skip to content”; second Tab focuses the brand with a clear brass outline. All page actions are ordinary anchors and CSS provides visible focus. No keyboard trap found. This is not a full screen-reader audit. Header navigation links measured about 23px high at 390px; add vertical padding when introducing the gallery link to improve touch comfort.

## Cognitive load and emotional journey

No decision point exceeds four visible choices: the header has three destinations and the hero has two actions. The five investigation steps are sequential explanation, not five competing choices. Hierarchy, labels and one reading path pass; no memory bridge or multitask demand was observed. The jargon barrier appears in the response-system paragraph, and local setup introduces a mild context switch between this page, tool installation and two terminals.

The opening creates curiosity, the room and suspect portraits build familiarity, and the numbered loop reassures. The emotional valley is the mobile gallery: it promises close inspection but offers tiny detail. The final setup replaces curiosity with operational effort; clearer prerequisite and terminal guidance would make the end feel achievable. Keep honest local-only expectations rather than adding a simulated Play action.

## Evidence and limitations

Fresh Chromium page at `http://127.0.0.1:5174/`, own browser process; desktop 1440×1000, mobile 390×844 and overflow check at 360×780. Source read and screenshots inspected through view_image. Evidence: critique-a-desktop.png, critique-a-mobile.png, critique-a-gallery.png and critique-a-setup.png. Full-page captures also exist, but their blank lower gallery boxes are lazy-loading capture artifacts: a separate scroll/decode inspection confirmed both images load, so no broken-image finding is claimed. Initial headless-shell screenshot timed out; Chromium channel succeeded. No server started/stopped and no site source edited. Actual game behavior, installation and screen-reader output were not tested. Questions skipped: parent will synthesize and close the combined critique.
