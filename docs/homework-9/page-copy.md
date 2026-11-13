# Promotional page copy

Prepared through installed gstack office-hours, Builder mode, 2026-11-13. User chose approach A: investigation-led. Visual direction and implementation remain for Impeccable shape/generate. Button destinations below are authoring instructions, not public copy.

## Hero

The Ashcroft Manor Murder

Question the suspects. Examine the evidence. Find out who is lying.

An illustrated detective game for people who enjoy following clues and comparing stories. Explore Ashcroft Manor, interview three suspects, and decide who to accuse.

**Try it locally** — jump to local-play instructions.
**View on GitHub** — https://github.com/esst-prog2/Detective-game-with-AI-agents

Runs on your computer with Node.js and a local game server. No AI key is needed for offline play.

## How it works

Follow the clues. Make your own case.

1. **Explore.** Visit the study, library and garden.
2. **Inspect.** Examine a torn contract, a silver cufflink and muddy footprints. Keep the details in your evidence journal.
3. **Question.** Choose a suggested question or type your own. Ask each suspect about what they know.
4. **Compare.** Read earlier statements alongside the evidence. Notice where accounts disagree.
5. **Accuse.** Name the suspect you believe is responsible and see the result of your investigation.

## Meet the suspects

Three people. Three accounts to consider.

**Alice Mercer — Housekeeper.** Alice works as the housekeeper at Ashcroft Manor and is employed by Victor Hale.

**Ben Carter — Gardener.** Ben works as Victor Hale's gardener.

**Clara Voss — Business partner.** Clara is Victor Hale's business partner and a frequent guest at Ashcroft Manor.

Who knows something you haven't asked about yet?

## The investigation

See the investigation in action.

Room-exploration caption: Move through the manor and inspect the objects you find.

Evidence-inspection caption: Read a clue closely, then return to your journal when you want to compare details.

Dialogue caption: Start with a suggested question or ask in your own words.

Use genuine, individually reviewed gameplay screenshots. No invented evidence board, transcript or verdict. Final image choices are still pending.

## More than a fixed conversation

Each suspect has their own information, way of responding, and memory of the conversation within your investigation. The evidence you've inspected and the statements you've heard can open relevant follow-up questions.

Questions use reviewed character responses. You can play entirely offline; optional AI selects from authorized performances without inventing new case facts.

## Another mystery is taking shape

The Last Bell at Greyhaven — Repair Dispute Preview

Meet Mara and Owen Vale, explore reception and the boathouse, and examine two repair-related records. Use what you find to question an account and ask for clarification.

This is a separate playable preview. It does not include the complete murder investigation, final accusation or ending.

Choose the Greyhaven preview from the game's case-selection screen after starting it locally.

## Try the game locally

Start your own investigation.

You'll need Git and Node.js 24 LTS. Run the following in PowerShell:

```powershell
git clone https://github.com/esst-prog2/Detective-game-with-AI-agents.git
cd Detective-game-with-AI-agents
npm.cmd ci
npm.cmd --prefix web ci
```

In the same terminal, start the offline game server:

```powershell
Remove-Item Env:OPENAI_API_KEY, Env:OPENAI_MODEL -ErrorAction SilentlyContinue
npm.cmd run start:api
```

Open a second PowerShell terminal in the cloned repository folder and start the browser interface:

```powershell
npm.cmd run dev:web
```

Open http://127.0.0.1:5173 and choose a case. Keep both terminals running. Press Ctrl+C in each to stop.

These commands are for Windows PowerShell; the README has further setup and troubleshooting details. Ports 3001 and 5173 must be free. Reloading the page starts over; there is no save/continue feature.

This website introduces the project. Playing the game requires the local server above.

## About the project

Developed as part of a university Advanced Programming course, this project explores character dialogue, evidence-based questioning and how players compare conflicting accounts.

Explore the source and setup guide on GitHub.

## Authoring verification

All gameplay claims are mapped in claim-audit.md. Local commands match the tracked package scripts, Vite proxy and README; an end-to-end clean-install smoke check is still owed before publication. No runtime code or game API configuration is changed by this copy package. No online-play deployment, new mechanics, video, slides, testimonials, playtime or difficulty claim is included.
