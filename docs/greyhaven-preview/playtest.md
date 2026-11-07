# Greyhaven preview human playtest

Status: the user manually tested D and reported case-selection, observation-review, preview-accusation discoverability and incomplete relationship labels. On 2026-11-07 the user confirmed successful manual playtesting, that all four reported usability issues were addressed, and approved final verification/publication. All62 desktop/mobile checks pass. The exact manual route, viewport and transcript were not supplied; this is limited preview/repair acceptance, not certification of every route or fresh-player narrative helpfulness. Record the player's own interpretation before showing them the expected-result column. A repair admission is not completion of the murder case.

## Start

From the repository root, use the existing README browser setup: `npm.cmd run start:api` and, in a separate terminal, `npm.cmd run dev:web`. Open `http://127.0.0.1:5173`. Restart an older API yourself before testing the new case, then reload the page. Existing manual servers were deliberately preserved during implementation.

Select **The Last Bell at Greyhaven — Repair Dispute Preview**. Ashcroft should remain the initial default. CLI alternative: `npm.cmd start -- --case greyhaven-preview`; enter `/choices` when questioning a witness. Notes remain ephemeral; starting a new case clears local notes after successful creation.

## Retest the reported controls first

1. Start Ashcroft and inspect a clue. Use **Start another case** in navigation; cancel with Escape. The same clue/notes remain and focus returns to the trigger.
2. Open the chooser again, select Greyhaven and press **Start selected case**. This opens a fresh preview with no Ashcroft notes. Use either the chooser or the preview's quick Ashcroft button to start a fresh Ashcroft investigation.
3. Finish Ashcroft with an accusation. **Start another case** must still work: select Greyhaven again. Ending a case must not hide selection or repurpose the old session.
4. In each case, inspect a clue and open the evidence journal. Activate **Review observation** by Enter or click. A visible reading dialog must show the exact received description. Close/Escape returns focus; repeated reviews do not inspect again or change the investigation. Repeat from the room's received-clue control.
5. In Greyhaven, inspect the usual bottom-of-room accusation area and the overview. The explicit **Final accusation unavailable** explanation must say the full murder cannot be solved in this preview. Continue exploring. In Ashcroft, the normal accusation flow must still be present and work.

The conclusion screen's existing quick “Start new investigation” still starts default Ashcroft. Use the universal chooser to select a different case. Cases are never changed within an existing investigation. Opening/canceling the chooser does not reset notes; successfully starting a selected case does. The local frontend repairs require a browser reload if hot reload has not applied; the API behavior was not changed by these repairs.

For relationship labels, restart the API and start a fresh preview so the new public wording is loaded. Mara's Relationships should read **Adrian Vale — Brother** and **Owen Vale — Son**; Owen's should read **Adrian Vale — Uncle** and **Mara Vale — Mother**. Check room cards, the overview and the public-dossier reader on desktop/mobile. No isolated “Her son”/“His mother,” repeated description, private fear or secret relationship should appear. Ashcroft's existing descriptions should stay readable, without repeating Ben's employment or Clara's partnership underneath them. Reading dossiers must not inspect evidence or unlock testimony.

## Checklist

| Step | Expected result |
| --- | --- |
| Select the preview and start | Reception, Mara, clear two-person/two-room scope and repair objective. No final accusation control. |
| Ask Mara where Owen was; use her offered follow-up | She says he stayed with her/no visit. Follow-up maintains her account without admitting a lie or revealing later explanation. |
| Travel to the boathouse | Owen, pump worksheet and repayment demand are discoverable. No missing-room hunt or dummy witness. |
| Before inspections, ask Owen to explain the maintenance-fund payment and the argument | Safe guidance; no admission, automatic inspection or account change. |
| Ask Owen where he was; select “What do you mean by work?” | Work/earlier-words account, then specific rescue-pump/hatch explanation. He does not identify the caller. Ask whether this clarified something or repeated it. |
| Inspect only one of the two records and retry payment presentation | Admission remains unavailable; read the record in the journal. Record whether the player knows what remains to investigate. |
| Inspect the other record | Both visible descriptions are retained in the journal. They describe records/payment, not a murder verdict. Repeat another session with the inspection order reversed. |
| Use the offered payment-and-argument evidence question | Owen admits unauthorized £480 spending, deadline and earlier visit. This must work even after hostile questions; no kindness password is needed. |
| Ask why he hid a useful repair | The approved explanation separates usefulness from permission and fear of judgment. Ask the player what changed from the initial account. |
| Ask “Explain your earlier work account,” then “What do you mean by that?” | The received old account is clarified through its authorized correction. It never restores the omission as current testimony. |
| Ask Owen where he was again | Current revised account, not the old initial omission. |
| Return to Mara and repeat/challenge her account | She retains her guarded account. The preview does not contain the outside sources needed for her later revision. No confession by pressure or guessed phrases. |
| Review both conversation histories and the evidence journal | Attributed accounts remain readable. Ask what each person knows, claims and may be withholding; do not label all testimony verified. |
| Look at the final-accusation area and overview; try the CLI's unavailable action if desired | Explicit unavailability explanation, no graded verdict or ended investigation. The scope message says repair spending does not establish murder guilt. Continued exploration works. |
| Start a new Ashcroft investigation using the preview button | Fresh study, original characters, empty preview notes and normal Ashcroft accusation behavior. |
| Use Start another case after active or ended Ashcroft and choose Greyhaven again | A fresh preview opens with correct characters, rooms and empty notes. No existing session changes identity. |
| Repeat keyboard-only and at a narrow mobile width | Choices, text, evidence, travel and history remain reachable; focus after a disappearing choice is useful; no sideways scroll. |

## Ask and record

- What did the records establish, and what did Owen personally admit?
- Why might Mara be protective? What have you actually learned about her reason?
- Did any reply imply the murderer was identified? Was the preview boundary clear?
- At each pause, what did you think you should investigate next?
- Which answer was repetitive, unnatural, overly long, confusing or unsupported?
- Did the generic illustrations or persistent scope notice get in the way?

Record date, viewport, prior exposure to spoilers, exact confusing question/reply, the player's reasoning and suggested improvements. Leave fairness/readability acceptance open if they struggle. Do not infer narrative satisfaction from passing automated tests or successful command completion.
