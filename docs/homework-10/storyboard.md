# Homework 10 — Ashcroft promotional video

2026-11-21. Audience: university classmates and teacher seeing the game for the first time. Focus only the complete Ashcroft case; no Greyhaven or solution reveal.

## Course requirements checked

Reviewed the user's local 08.pdf slides15,16 and27. Homework10 permits HyperFrames **or** captioned screen recording, calls for about30seconds, requires the video on the existing promotional page, and instructs the student to paste the page address on Canvas. Deadline: Saturday21November2026,20:00 Europe/Budapest. Sound is not needed. The lecture recommends HyperFrames with Node22+ and FFmpeg; installation approval is pending at this planning step.

## Message and visual treatment

Target exactly30.000seconds,1920×1080,16:9,30fps,H.264 MP4 with yuv420p and web fast-start. Silent by design: no music, voice, license dependency or generated audio. Reuse Georgia/Segoe UI where available, charcoal#131719, brass#d6b16d and paper#f3ecdc from the approved Gameplay Walkthrough promo. Retain clear captions, genuine interface, slow restrained image movement and short transitions. No invented dialogue, UI or evidence board.

| Time | Picture from real gameplay | On-screen message | Guardrail |
|---|---|---|---|
| 0–4s | Actual Ashcroft opening screen | One murder. Three suspects. | No invented introductory scene |
| 4–9s | Actual room and silver-cufflink observation | Explore the scene. | Show clue description without interpreting ownership |
| 9–15s | Alice's real, ordinary alibi question/response | Question everyone. | Dialogue comes from offline authored responses |
| 15–21s | Present inspected footprints to Ben; show his actual response | Test their stories. | Avoid revealing the solution-bearing garden comparison; support text: “Every response stays within the character's authored knowledge.” |
| 21–26s | Actual accusation dialog, unconfirmed | Make your accusation. | No confirmation, verdict, correctness cue or implication of the chosen suspect's guilt |
| 26–30s | Editorial closing card in the promo's palette | Detective Game with AI Agents / Learn more · Play locally | Display actual promo URL; no hosted Play claim |

Closing URL: https://esst-prog2.github.io/Detective-game-with-AI-agents/

“Test their stories” replaces the proposed “Find the contradictions” for this specific shot: the safe footage shows evidence-dependent questioning, while the direct contradiction would reveal an important deduction. This is an editorial choice, not a claim that the game lacks conflicting testimony.

## Source/capture plan

Use the actual current offline Node API and browser interface. Capture clean1920×1080 game screens through reproducible Playwright actions: opening, study, cufflink observation, Alice question/response, garden footprints, Ben evidence response and unconfirmed accusation dialog. No browser chrome, developer tools, debug logs, hidden data or credentials enter frames. Use captions and subtle movement around the authentic captures; do not fabricate game footage. Preserve captured source images and action provenance. Keep large temporary raw recording/frame sequences ignored.

## Production and publication gates

Confirm available installed tooling; obtain approval before new software installation per the user's standing preference. Do not claim a render before an actual exported file exists. Probe duration/codec/resolution and decode the whole export; inspect scene samples/contact sheet and transitions. Add an accessible native video player with poster and transcript to the existing promo because the lecture explicitly requires it there. Preserve repaired screenshot paths and existing design. Run production regression and actual public video/page checks after authorized artifact deployment. Source PR stays unmerged pending user approval.

## Canvas submission

After public playback is verified, open Homework10 — Your video on Canvas and paste **the promotional page URL above**. The lecture asks for the page address, not only the raw MP4 URL or an uploaded file. Do not claim Canvas submission or knowledge of account-specific Canvas controls.
