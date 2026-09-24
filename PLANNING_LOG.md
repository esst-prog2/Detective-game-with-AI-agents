## PLANNING LOG

2026-09-22 — AGENTS.md was created as the project planning log; you decided.
2026-09-22 — OpenSpec was selected for the project; you decided.
2026-09-22 - Node.js LTS and OpenSpec were installed, and OpenSpec was initialized for Codex in this repository; you decided.
2026-09-22 - Suspects will use controlled lying: whether they tell the truth or deliberately lie depends on their motive and personality; you decided.
2026-09-22 - The MVP will keep each suspect's knowledge fixed during an investigation; NPC-to-NPC information sharing is deferred to a later version; you decided.
2026-09-22 - NPC dialogue will use engine-approved facts and allowed lies, with an LLM producing only the natural-language phrasing; you decided.
2026-09-22 - For the MVP, the game engine will select the exact approved response content and the LLM will only phrase it naturally; you decided.
2026-09-22 - The MVP will classify free-text questions into a small fixed set of broad investigation topics; each suspect has one engine-approved response per topic and unsupported questions use a safe fallback; you decided.
2026-09-22 - The MVP will use exactly six investigation categories: alibi, relationship with victim, motive, sighting, evidence, and crime details; you decided.
2026-09-22 - Future project decisions will prioritize the smallest playable MVP scope; you decided.
2026-09-22 - The MVP will classify player questions with simple rules and keywords, and will show example questions to guide players toward supported phrasing; you decided.
2026-09-22 - The MVP will contain one hand-authored, fully solvable murder case with three suspects, one victim, 2-3 locations, and a small set of evidence; you decided.
2026-09-22 - Each MVP suspect will have a name, short personality description, relationship to the victim, motive or lack of motive, private facts, one permitted lie or concealment with a reason, and one approved response for each of the six investigation categories; you decided.
2026-09-22 - MVP evidence will be presented as inspectable descriptions; NPCs will not answer questions about individual named clues; you decided.
2026-09-22 - When a player question cannot be classified into a supported category, the MVP will show a deterministic fallback that suggests the six supported investigation topics; you decided.
2026-09-22 - In the MVP, repeating a question to the same suspect about the same category will return exactly the same response text; you decided.
2026-09-24 - Every approved MVP response will have a prewritten plain-text fallback, used if LLM generation is unavailable, times out, or returns invalid output; you decided.
2026-09-24 - The MVP accusation interface will present the three suspects in a numbered menu; you decided.
2026-09-24 - The MVP will require confirmation before a final accusation; a confirmed accusation ends the investigation; you decided.
2026-09-24 - The OpenSpec change for the initial playable version will be named build-mvp-detective-game; I decided.
2026-09-24 - The MVP proposal will introduce the game-case-content, npc-interrogation, evidence-inspection, and accusation-resolution capabilities; I decided.
2026-09-24 - The MVP will be a Node.js LTS command-line application written in plain JavaScript; you decided.
2026-09-24 - The MVP's optional NPC dialogue phrasing will use the OpenAI API, while retaining prewritten local fallbacks; you decided.
2026-09-24 - The MVP case will be The Ashcroft Manor Murder: Clara Voss killed Victor Hale, with Alice Mercer and Ben Carter as the other suspects; I decided.
