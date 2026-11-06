# First-time-player check

Status: user-reported playtest observations received on 2026-11-06. The checklist below is retained for future sessions.

## Reported observations

- The player suspected and accused the correct suspect, Clara.
- They considered the torn contract the most telling sign and thought Clara was fairly obvious with the contract and cufflink together.
- Replies to "What do you mean by that?" sometimes did not make sense or help: the character repeated the account rather than explaining further.
- The user wants a harder investigation with misleading but fair evidence and replies, comparison and exclusion of alternatives, more rooms/people, richer storytelling and personal relationships affecting behavior. A mother knowingly protecting her guilty son through a lie is a desired example, not an addition to the current canon.

This supports that this player could reach the intended accusation through the repaired clues; it does not establish satisfactory difficulty or useful clarification. Exact question/reply sequences, assistance, device/browser, session duration and reaction to the ending were not supplied. No verbatim game transcript, independent observation or broader human-validation result is claimed. Clarification quality and difficulty remain recorded concerns for subsequent design work, not implemented changes in this milestone.

## Checklist for future sessions

From the repository root, start two PowerShell terminals. Dependencies are already installed for this workspace. Use local offline play:

```powershell
# Terminal 1
Remove-Item Env:OPENAI_API_KEY, Env:OPENAI_MODEL -ErrorAction SilentlyContinue
npm.cmd run start:api
```

```powershell
# Terminal 2
npm.cmd run dev:web
```

Open http://127.0.0.1:5173 and start a fresh investigation. Do not show the player source code, solution-bearing audit/verification documents or a directed clue walkthrough. Ask them to explore the rooms, inspect objects and question people using the displayed controls or their own text. No need to ask every possible question. Confirmation of an accusation ends this playthrough.

Before they confirm, record their own answers:

1. Who do you suspect, and which observations or statements support that?
2. Which conclusions are uncertain? Did any answer seem stronger than its evidence?
3. Were any questions, clues or follow-ups difficult to find? What did you try?

After confirmation, record whether the explanation matched what they had actually obtained, whether it was readable on their screen, and whether anything felt like a guess, an arbitrary restriction or an answer revealed without investigation. Capture exact confusing wording and attempted actions when possible. Do not coach them toward a particular suspect while collecting this evidence.

Return the player's reasoning, missed/unclear interactions, outcome, device/browser and any assistance provided. This is qualitative fairness evidence, not a score. A contrary or unsuccessful result is useful; do not label it passed merely because the engine accepted a correct accusation. Stop the two servers with Ctrl+C afterward.
