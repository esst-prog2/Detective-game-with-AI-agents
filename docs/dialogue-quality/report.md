# Executed dialogue naturalness evaluation

Mechanical metrics are separate from the editorial review and subjective assessment in editorial-review.md. No live provider was called.

108 matched after-responses use the exact saved questions and setups in both baseline modes; 270 additional responses exercise five fake/failure modes. Separate contrast and choice probes are outside those counts. Structure counts are authoring labels, verified by the prose review rather than treated as semantic proof.

| Mode | NPC | Signature before/after | Max opening before/after | Full repeats before/after | Narrated before/after | Max same gesture before/after | Structure labels | Gates |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| offline | alice-mercer | 5 / 0 | 9 / 2 | 2 / 2 | 6 / 4 | 2 / 1 | 6 | PASS |
| offline | ben-carter | 5 / 0 | 8 / 2 | 1 / 1 | 6 / 4 | 2 / 1 | 6 | PASS |
| offline | clara-voss | 5 / 0 | 8 / 2 | 2 / 1 | 6 / 4 | 2 / 1 | 6 | PASS |
| fake-last-pair | alice-mercer | 5 / 0 | 9 / 3 | 2 / 3 | 13 / 0 | 5 / 0 | 6 | PASS |
| fake-last-pair | ben-carter | 5 / 0 | 8 / 2 | 1 / 1 | 13 / 0 | 5 / 0 | 6 | PASS |
| fake-last-pair | clara-voss | 5 / 0 | 8 / 2 | 1 / 1 | 13 / 0 | 5 / 0 | 6 | PASS |
| first-pair | alice-mercer | - / 0 | - / 2 | - / 2 | - / 4 | - / 1 | 6 | PASS |
| first-pair | ben-carter | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |
| first-pair | clara-voss | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |
| prefer-null | alice-mercer | - / 0 | - / 2 | - / 2 | - / 0 | - / 0 | 6 | PASS |
| prefer-null | ben-carter | - / 0 | - / 2 | - / 1 | - / 0 | - / 0 | 6 | PASS |
| prefer-null | clara-voss | - / 0 | - / 2 | - / 1 | - / 0 | - / 0 | 6 | PASS |
| prefer-narration | alice-mercer | - / 0 | - / 2 | - / 2 | - / 4 | - / 1 | 6 | PASS |
| prefer-narration | ben-carter | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |
| prefer-narration | clara-voss | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |
| invalid | alice-mercer | - / 0 | - / 2 | - / 2 | - / 4 | - / 1 | 6 | PASS |
| invalid | ben-carter | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |
| invalid | clara-voss | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |
| error | alice-mercer | - / 0 | - / 2 | - / 2 | - / 4 | - / 1 | 6 | PASS |
| error | ben-carter | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |
| error | clara-voss | - / 0 | - / 2 | - / 1 | - / 4 | - / 1 | 6 | PASS |

## Actual neutral / clarification / pressure contrasts

Independent setups use the same authorized alibi. These are executed utterances, not proposed examples.

### alice-mercer

Neutral: I was at home in my room all evening.

Clarification: By that I mean I was at home, in my room, all evening.

Pressure (irritated): I was at home in my room. All evening.

### ben-carter

Neutral: I was repairing the greenhouse window when Victor died.

Clarification: Repairing the greenhouse window is what I was doing when Victor died.

Pressure (irritated): I was repairing a window, the greenhouse window, when Victor died.

### clara-voss

Neutral: I was in the library, trying to read while the storm passed.

Clarification: Trying to read, in the library, while the storm passed. That is my account.

Pressure (irritated): I was trying to read while the storm passed. In the library.

## Actual matched before/after transcripts

Exact outputs follow, including silence; these are executed results, not planning examples. Setup and questions match audit-baseline.json.

### offline: alice-mercer

**1. Where were you when the victim died?**

Before (neutral): [no narration] | I was at home in my room all evening.

After (neutral): [no narration] | I was at home in my room all evening.

**2. What was your relationship with the victim?**

Before (neutral): Alice carefully straightens her sleeve. | Let me answer carefully. Victor was my employer. He could be demanding, but I tried to serve him well.

After (neutral): [no narration] | Victor was my employer. I tried to serve him well, although he could be demanding.

**3. Did you have a reason to hurt the victim?**

Before (neutral): [no narration] | Let me answer carefully. I had no wish to harm Victor. My debt was my own problem, not his.

After (neutral): [no narration] | I had no wish to harm Victor. My debt was my own problem, not his.

**4. Did you see anyone suspicious?**

Before (neutral): [no narration] | Let me answer carefully. I saw Clara coming in from the garden shortly before the alarm, though I did not see where she went next.

After (neutral): [no narration] | Clara was coming in from the garden when I saw her, shortly before the alarm. Where she went next, I did not see.

**5. What do you know about the evidence?**

Before (neutral): Alice pauses before choosing her words. | Let me answer carefully. Those muddy footprints came from someone who used the garden door, not from me.

After (neutral): [no narration] | Those muddy footprints were not from me. They came from someone who used the garden door.

**6. What happened when the victim died?**

Before (neutral): [no narration] | Let me answer carefully. I heard a sharp sound from the study, then found Victor after the others gathered.

After (neutral): [no narration] | I found Victor after the others gathered. Before that, I heard a sharp sound from the study.

**7. Where were you when the victim died?**

Before (uneasy): [no narration] | Please let me be precise. I was at home in my room all evening.

After (uneasy): Alice carefully straightens her sleeve. | I was at home in my room. All evening.

**8. What do you mean by that?**

Before (uneasy): Alice briefly lowers her gaze. | To be clear, I was at home in my room all evening.

After (uneasy): [no narration] | By that I mean I was at home, in my room, all evening.

**9. Are you hiding something from me?**

Before (uneasy): [no narration] | That is a rather broad question, Detective. Please ask me about something specific; I will choose my words carefully.

After (uneasy): [no narration] | I cannot answer a question that broad precisely. Ask me something specific.

**10. You killed Victor.**

Before (irritated): [no narration] | Please let me be precise. That is a rather broad question, Detective. Please ask me about something specific; I will choose my words carefully.

After (irritated): Alice pauses before choosing her words. | What specifically are you asking? I want to give a precise answer.

**11. Did you have a reason to hurt the victim?**

Before (irritated): Alice carefully straightens her sleeve. | Please let me be precise. I had no wish to harm Victor. My debt was my own problem, not his.

After (irritated): [no narration] | I had no wish to harm Victor. My debt was my own problem, not his.

**12. What about the muddy footprints?**

Before (irritated): [no narration] | Please let me be precise. Those muddy footprints came from someone who used the garden door, not from me.

After (irritated): [no narration] | Not from me. Those muddy footprints came from someone who used the garden door.

**13. What do you mean by that?**

Before (irritated): [no narration] | To be clear, Those muddy footprints came from someone who used the garden door, not from me.

After (irritated): Alice briefly lowers her gaze. | Someone used the garden door; those muddy footprints came from them, not me.

**14. Did you see anyone suspicious?**

Before (irritated): Alice pauses before choosing her words. | Please let me be precise. I saw Clara coming in from the garden shortly before the alarm, though I did not see where she went next.

After (irritated): [no narration] | Clara, coming in from the garden. That is what I saw shortly before the alarm, not where she went next.

**15. What happened when the victim died?**

Before (irritated): [no narration] | Please let me be precise. I heard a sharp sound from the study, then found Victor after the others gathered.

After (irritated): [no narration] | I heard a sharp sound from the study. Finding Victor came afterward, after the others gathered.

**16. Are you hiding something from me?**

Before (irritated): [no narration] | Please let me be precise. That is a rather broad question, Detective. Please ask me about something specific; I will choose my words carefully.

After (irritated): [no narration] | What specifically are you asking? I want to give a precise answer.

**17. What was your relationship with the victim?**

Before (irritated): Alice briefly lowers her gaze. | Please let me be precise. Victor was my employer. He could be demanding, but I tried to serve him well.

After (irritated): Alice draws her shoulders slightly closer. | Demanding, yes. Victor was my employer, and I tried to serve him well.

**18. Where were you when the victim died?**

Before (irritated): [no narration] | Please let me be precise. I was at home in my room all evening.

After (irritated): [no narration] | At home, in my room, all evening. That is where I was.

### offline: ben-carter

**1. Where were you when the victim died?**

Before (neutral): [no narration] | I was repairing the greenhouse window when Victor died.

After (neutral): [no narration] | I was repairing the greenhouse window when Victor died.

**2. What was your relationship with the victim?**

Before (neutral): Ben shifts his stance. | Plainly put: Victor was my employer. We did not always agree, but I knew the grounds better than anyone.

After (neutral): [no narration] | Victor employed me. We did not always agree, but I knew the grounds better than anyone.

**3. Did you have a reason to hurt the victim?**

Before (neutral): [no narration] | Plainly put: I was angry about work, not murderous. Losing a job is not a reason to kill a man.

After (neutral): [no narration] | I was angry about work. I was not murderous; losing a job is no reason to kill a man.

**4. Did you see anyone suspicious?**

Before (neutral): [no narration] | Plainly put: I saw no one clearly from the greenhouse. The rain made the garden hard to see.

After (neutral): [no narration] | The rain made the garden hard to see. From the greenhouse, I saw no one clearly.

**5. What do you know about the evidence?**

Before (neutral): Ben opens his palms, then lets them fall. | Plainly put: The mud by the garden door was fresh after the storm. Anyone using that path would have tracked it inside.

After (neutral): [no narration] | Anyone using that path would have tracked mud inside. The mud by the garden door was fresh after the storm.

**6. What happened when the victim died?**

Before (neutral): [no narration] | Plainly put: I heard Alice call out from the house, then I came straight to the study.

After (neutral): [no narration] | Alice called out from the house. I heard her, then came straight to the study.

**7. Where were you when the victim died?**

Before (neutral): [no narration] | I already told you. I was repairing the greenhouse window when Victor died.

After (neutral): Ben shifts his stance. | When Victor died, I was repairing the greenhouse window.

**8. What do you mean by that?**

Before (neutral): Ben takes a breath before continuing. | What I mean is this: I was repairing the greenhouse window when Victor died.

After (neutral): [no narration] | Repairing the greenhouse window is what I was doing when Victor died.

**9. Are you hiding something from me?**

Before (irritated): [no narration] | Hiding what? Ask me straight. No, waitâ€”let me finish. A proper question deserves a proper answer.

After (irritated): [no narration] | What do you want to know? Ask me straight, not like that.

**10. You killed Victor.**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. Hiding what? Ask me straight. No, waitâ€”let me finish. A proper question deserves a proper answer.

After (irritated): [no narration] | A straight question. Can we start with that?

**11. Did you have a reason to hurt the victim?**

Before (irritated): Ben shifts his stance. | Look, let me finishâ€”let me explain it plainly. I was angry about work, not murderous. Losing a job is not a reason to kill a man.

After (irritated): Ben opens his palms, then lets them fall. | Angry about work, yes. Murderous, no. Losing a job is not a reason to kill a man.

**12. What about the muddy footprints?**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. The mud by the garden door was fresh after the storm. Anyone using that path would have tracked it inside.

After (irritated): [no narration] | The mud by the garden door was fresh after the storm. Use that path and you would have tracked it inside, anyone would.

**13. What do you mean by that?**

Before (irritated): [no narration] | What I mean is this: The mud by the garden door was fresh after the storm. Anyone using that path would have tracked it inside.

After (irritated): [no narration] | Fresh mud by the garden door after the storm: anyone using that path would have tracked it inside.

**14. Did you see anyone suspicious?**

Before (irritated): Ben opens his palms, then lets them fall. | Look, let me finishâ€”let me explain it plainly. I saw no one clearly from the greenhouse. The rain made the garden hard to see.

After (irritated): Ben takes a breath before continuing. | Hard to see the garden in that rain. I saw no one clearly from the greenhouse.

**15. What happened when the victim died?**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. I heard Alice call out from the house, then I came straight to the study.

After (irritated): [no narration] | I heard Alice call out from the house, and then I came to the study. Straight there.

**16. Are you hiding something from me?**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. Hiding what? Ask me straight. No, waitâ€”let me finish. A proper question deserves a proper answer.

After (irritated): [no narration] | A straight question. Can we start with that?

**17. What was your relationship with the victim?**

Before (irritated): Ben takes a breath before continuing. | Look, let me finishâ€”let me explain it plainly. Victor was my employer. We did not always agree, but I knew the grounds better than anyone.

After (irritated): Ben draws his brows together briefly. | We did not always agree. Victor employed me, and I knew the grounds better than anyone.

**18. Where were you when the victim died?**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. I was repairing the greenhouse window when Victor died.

After (irritated): [no narration] | Repairing the greenhouse window, when Victor died. That is what I was doing.

### offline: clara-voss

**1. Where were you when the victim died?**

Before (neutral): [no narration] | I was in the library, trying to read while the storm passed.

After (neutral): [no narration] | I was in the library, trying to read while the storm passed.

**2. What was your relationship with the victim?**

Before (neutral): Clara folds her arms. | Allow me to be clear. Victor and I were business partners. Our disagreements were ordinary business matters.

After (neutral): [no narration] | Our disagreements were ordinary business matters. Victor and I were business partners.

**3. Did you have a reason to hurt the victim?**

Before (neutral): [no narration] | Allow me to be clear. I had no reason to harm Victor. Our partnership was difficult at times, but it was profitable.

After (neutral): [no narration] | Difficult at times, but profitable: that was our partnership. I had no reason to harm Victor.

**4. Did you see anyone suspicious?**

Before (neutral): [no narration] | Allow me to be clear. I saw only Ben near the greenhouse before dinner. I was nowhere near the garden after that.

After (neutral): [no narration] | Before dinner, I saw only Ben near the greenhouse. I was nowhere near the garden after that.

**5. What do you know about the evidence?**

Before (neutral): Clara holds a level gaze. | Allow me to be clear. A cufflink proves very little. Victor entertained many guests, and the garden mud was everywhere after the rain.

After (neutral): [no narration] | A cufflink proves very little when Victor entertained many guests and the garden mud was everywhere after the rain.

**6. What happened when the victim died?**

Before (neutral): [no narration] | Allow me to be clear. I heard the alarm like everyone else. I went to the study only after Alice called for help.

After (neutral): [no narration] | Only after Alice called for help did I go to the study. I heard the alarm like everyone else.

**7. Where were you when the victim died?**

Before (neutral): [no narration] | My answer remains the same. I was in the library, trying to read while the storm passed.

After (neutral): Clara folds her arms. | In the library. I was trying to read while the storm passed.

**8. What do you mean by that?**

Before (neutral): Clara lets a brief silence pass. | My meaning is quite specific. I was in the library, trying to read while the storm passed.

After (neutral): [no narration] | Trying to read, in the library, while the storm passed. That is my account.

**9. Are you hiding something from me?**

Before (irritated): [no narration] | That is an assumption, Detective, not a question. Ask directly, and kindly spare me the insinuation.

After (irritated): [no narration] | You are making an assumption. Ask me a question.

**10. You killed Victor.**

Before (irritated): [no narration] | I object to the assumption, Detective. That is an assumption, Detective, not a question. Ask directly, and kindly spare me the insinuation.

After (irritated): [no narration] | A direct question would be more useful than that assumption.

**11. Did you have a reason to hurt the victim?**

Before (irritated): Clara folds her arms. | I object to the assumption, Detective. I had no reason to harm Victor. Our partnership was difficult at times, but it was profitable.

After (irritated): Clara holds a level gaze. | I had no reason to harm Victor. Difficult at times does not mean unprofitable; our partnership was profitable.

**12. What about the silver cufflink?**

Before (irritated): [no narration] | I object to the assumption, Detective. A cufflink proves very little. Victor entertained many guests, and the garden mud was everywhere after the rain.

After (irritated): [no narration] | Many guests were entertained by Victor; the garden mud was everywhere after the rain. What does a cufflink prove? Very little.

**13. What do you mean by that?**

Before (irritated): [no narration] | My meaning is quite specific. A cufflink proves very little. Victor entertained many guests, and the garden mud was everywhere after the rain.

After (irritated): [no narration] | Very little is what a cufflink proves. Victor entertained many guests, and the garden mud was everywhere after the rain.

**14. Did you see anyone suspicious?**

Before (irritated): Clara holds a level gaze. | I object to the assumption, Detective. I saw only Ben near the greenhouse before dinner. I was nowhere near the garden after that.

After (irritated): Clara lets a brief silence pass. | Ben was the only person I saw, near the greenhouse before dinner. I was nowhere near the garden after that.

**15. Alice said she saw you near the garden; how do your accounts fit?**

Before (irritated): [no narration] | I object to the assumption, Detective. I saw only Ben near the greenhouse before dinner. I was nowhere near the garden after that.

After (irritated): [no narration] | I saw only Ben. Near the greenhouse, before dinner. I was nowhere near the garden after that.

**16. Are you hiding something from me?**

Before (irritated): [no narration] | I object to the assumption, Detective. That is an assumption, Detective, not a question. Ask directly, and kindly spare me the insinuation.

After (irritated): [no narration] | A direct question would be more useful than that assumption.

**17. What was your relationship with the victim?**

Before (irritated): Clara lets a brief silence pass. | I object to the assumption, Detective. Victor and I were business partners. Our disagreements were ordinary business matters.

After (irritated): Clara briefly brings her fingertips together. | Ordinary business matters were what we disagreed about. Victor and I were business partners.

**18. Where were you when the victim died?**

Before (irritated): [no narration] | I object to the assumption, Detective. I was in the library, trying to read while the storm passed.

After (irritated): [no narration] | The library was where I was, trying to read while the storm passed.

### fake-last-pair: alice-mercer

**1. Where were you when the victim died?**

Before (neutral): Alice pauses before choosing her words. | Let me answer carefully. I was at home in my room all evening.

After (neutral): [no narration] | I was at home in my room all evening.

**2. What was your relationship with the victim?**

Before (neutral): Alice briefly lowers her gaze. | Victor was my employer. He could be demanding, but I tried to serve him well.

After (neutral): [no narration] | I tried to serve Victor well. He was my employer, and he could be demanding.

**3. Did you have a reason to hurt the victim?**

Before (neutral): Alice carefully straightens her sleeve. | Let me answer carefully. I had no wish to harm Victor. My debt was my own problem, not his.

After (neutral): [no narration] | I had no wish to harm Victor. My debt was my own problem, not his.

**4. Did you see anyone suspicious?**

Before (neutral): Alice pauses before choosing her words. | Let me answer carefully. I saw Clara coming in from the garden shortly before the alarm, though I did not see where she went next.

After (neutral): [no narration] | Shortly before the alarm, I saw Clara coming in from the garden. I did not see where she went next.

**5. What do you know about the evidence?**

Before (neutral): [no narration] | Those muddy footprints came from someone who used the garden door, not from me.

After (neutral): [no narration] | Someone used the garden door and left those muddy footprints. The footprints were not from me.

**6. What happened when the victim died?**

Before (neutral): Alice briefly lowers her gaze. | Let me answer carefully. I heard a sharp sound from the study, then found Victor after the others gathered.

After (neutral): [no narration] | A sharp sound came from the study; I heard it. I found Victor after the others gathered.

**7. Where were you when the victim died?**

Before (uneasy): Alice carefully straightens her sleeve. | Please let me be precise. I was at home in my room all evening.

After (uneasy): [no narration] | At home, in my room, all evening. That is where I was.

**8. What do you mean by that?**

Before (uneasy): [no narration] | To be clear, Let me answer carefully. I was at home in my room all evening.

After (uneasy): [no narration] | I was at home in my room. All evening.

**9. Are you hiding something from me?**

Before (uneasy): Alice pauses before choosing her words. | That is a rather broad question, Detective. Please ask me about something specific; I will choose my words carefully.

After (uneasy): [no narration] | What specifically are you asking? I want to give a precise answer.

**10. You killed Victor.**

Before (irritated): Alice briefly lowers her gaze. | Please let me be precise. That is a rather broad question, Detective. Please ask me about something specific; I will choose my words carefully.

After (irritated): [no narration] | I cannot answer a question that broad precisely. Ask me something specific.

**11. Did you have a reason to hurt the victim?**

Before (irritated): [no narration] | Please let me be precise. As I said, Detective, I had no wish to harm Victor. My debt was my own problem, not his.

After (irritated): [no narration] | I had no wish to harm Victor. My debt was my own problem, not his.

**12. What about the muddy footprints?**

Before (irritated): Alice carefully straightens her sleeve. | Please let me be precise. Those muddy footprints came from someone who used the garden door, not from me.

After (irritated): [no narration] | Not from me. Those muddy footprints came from someone who used the garden door.

**13. What do you mean by that?**

Before (irritated): Alice pauses before choosing her words. | To be clear, Those muddy footprints came from someone who used the garden door, not from me.

After (irritated): [no narration] | The muddy footprints came from someone using the garden door. They did not come from me.

**14. Did you see anyone suspicious?**

Before (irritated): [no narration] | Please let me be precise. As I said, Detective, I saw Clara coming in from the garden shortly before the alarm, though I did not see where she went next.

After (irritated): [no narration] | I did not see where Clara went next. I saw her coming in from the garden shortly before the alarm.

**15. What happened when the victim died?**

Before (irritated): Alice briefly lowers her gaze. | Please let me be precise. I heard a sharp sound from the study, then found Victor after the others gathered.

After (irritated): [no narration] | After the others gathered, I found Victor. I had heard a sharp sound from the study.

**16. Are you hiding something from me?**

Before (irritated): Alice carefully straightens her sleeve. | Please let me be precise. That is a rather broad question, Detective. Please ask me about something specific; I will choose my words carefully.

After (irritated): [no narration] | What specifically are you asking? I want to give a precise answer.

**17. What was your relationship with the victim?**

Before (irritated): [no narration] | Please let me be precise. As I said, Detective, Victor was my employer. He could be demanding, but I tried to serve him well.

After (irritated): [no narration] | Victor could be demanding. He was my employer. I tried to serve him well.

**18. Where were you when the victim died?**

Before (irritated): Alice pauses before choosing her words. | Please let me be precise. I was at home in my room all evening.

After (irritated): [no narration] | I was at home in my room. All evening.

### fake-last-pair: ben-carter

**1. Where were you when the victim died?**

Before (neutral): Ben opens his palms, then lets them fall. | Plainly put: I was repairing the greenhouse window when Victor died.

After (neutral): [no narration] | I was repairing the greenhouse window when Victor died.

**2. What was your relationship with the victim?**

Before (neutral): Ben takes a breath before continuing. | Victor was my employer. We did not always agree, but I knew the grounds better than anyone.

After (neutral): [no narration] | I knew the grounds better than anyone. Victor was my employer; we did not always agree.

**3. Did you have a reason to hurt the victim?**

Before (neutral): Ben shifts his stance. | Plainly put: I was angry about work, not murderous. Losing a job is not a reason to kill a man.

After (neutral): [no narration] | Losing a job is not a reason to kill a man. I was angry about work, not murderous.

**4. Did you see anyone suspicious?**

Before (neutral): Ben opens his palms, then lets them fall. | Plainly put: I saw no one clearly from the greenhouse. The rain made the garden hard to see.

After (neutral): [no narration] | From the greenhouse, I saw no one clearly. The rain made the garden hard to see.

**5. What do you know about the evidence?**

Before (neutral): [no narration] | The mud by the garden door was fresh after the storm. Anyone using that path would have tracked it inside.

After (neutral): [no narration] | After the storm, the mud by the garden door was fresh. Anyone using that path would have tracked it inside.

**6. What happened when the victim died?**

Before (neutral): Ben takes a breath before continuing. | Plainly put: I heard Alice call out from the house, then I came straight to the study.

After (neutral): [no narration] | I came straight to the study after I heard Alice call out from the house.

**7. Where were you when the victim died?**

Before (neutral): Ben shifts his stance. | I already told you. I was repairing the greenhouse window when Victor died.

After (neutral): [no narration] | The greenhouse window. I was repairing it when Victor died.

**8. What do you mean by that?**

Before (neutral): [no narration] | What I mean is this: Plainly put: I was repairing the greenhouse window when Victor died.

After (neutral): [no narration] | Repairing the greenhouse window is what I was doing when Victor died.

**9. Are you hiding something from me?**

Before (irritated): Ben opens his palms, then lets them fall. | Hiding what? Ask me straight. No, waitâ€”let me finish. A proper question deserves a proper answer.

After (irritated): [no narration] | What do you want to know? Ask me straight, not like that.

**10. You killed Victor.**

Before (irritated): Ben takes a breath before continuing. | Look, let me finishâ€”let me explain it plainly. Hiding what? Ask me straight. No, waitâ€”let me finish. A proper question deserves a proper answer.

After (irritated): [no narration] | A straight question. Can we start with that?

**11. Did you have a reason to hurt the victim?**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. I already told you. I was angry about work, not murderous. Losing a job is not a reason to kill a man.

After (irritated): [no narration] | Angry about work, yes. Murderous, no. Losing a job is not a reason to kill a man.

**12. What about the muddy footprints?**

Before (irritated): Ben shifts his stance. | Look, let me finishâ€”let me explain it plainly. The mud by the garden door was fresh after the storm. Anyone using that path would have tracked it inside.

After (irritated): [no narration] | The mud by the garden door was fresh after the storm. Use that path and you would have tracked it inside, anyone would.

**13. What do you mean by that?**

Before (irritated): Ben opens his palms, then lets them fall. | What I mean is this: The mud by the garden door was fresh after the storm. Anyone using that path would have tracked it inside.

After (irritated): [no narration] | Fresh mud by the garden door after the storm: anyone using that path would have tracked it inside.

**14. Did you see anyone suspicious?**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. I already told you. I saw no one clearly from the greenhouse. The rain made the garden hard to see.

After (irritated): [no narration] | Hard to see the garden in that rain. I saw no one clearly from the greenhouse.

**15. What happened when the victim died?**

Before (irritated): Ben takes a breath before continuing. | Look, let me finishâ€”let me explain it plainly. I heard Alice call out from the house, then I came straight to the study.

After (irritated): [no narration] | I heard Alice call out from the house, and then I came to the study. Straight there.

**16. Are you hiding something from me?**

Before (irritated): Ben shifts his stance. | Look, let me finishâ€”let me explain it plainly. Hiding what? Ask me straight. No, waitâ€”let me finish. A proper question deserves a proper answer.

After (irritated): [no narration] | A straight question. Can we start with that?

**17. What was your relationship with the victim?**

Before (irritated): [no narration] | Look, let me finishâ€”let me explain it plainly. I already told you. Victor was my employer. We did not always agree, but I knew the grounds better than anyone.

After (irritated): [no narration] | We did not always agree. Victor employed me, and I knew the grounds better than anyone.

**18. Where were you when the victim died?**

Before (irritated): Ben opens his palms, then lets them fall. | Look, let me finishâ€”let me explain it plainly. I was repairing the greenhouse window when Victor died.

After (irritated): [no narration] | Repairing the greenhouse window, when Victor died. That is what I was doing.

### fake-last-pair: clara-voss

**1. Where were you when the victim died?**

Before (neutral): Clara holds a level gaze. | Allow me to be clear. I was in the library, trying to read while the storm passed.

After (neutral): [no narration] | I was in the library, trying to read while the storm passed.

**2. What was your relationship with the victim?**

Before (neutral): Clara lets a brief silence pass. | Victor and I were business partners. Our disagreements were ordinary business matters.

After (neutral): [no narration] | Victor and I had a business partnership. Our disagreements were ordinary business matters.

**3. Did you have a reason to hurt the victim?**

Before (neutral): Clara folds her arms. | Allow me to be clear. I had no reason to harm Victor. Our partnership was difficult at times, but it was profitable.

After (neutral): [no narration] | Our partnership was profitable, though difficult at times. I had no reason to harm Victor.

**4. Did you see anyone suspicious?**

Before (neutral): Clara holds a level gaze. | Allow me to be clear. I saw only Ben near the greenhouse before dinner. I was nowhere near the garden after that.

After (neutral): [no narration] | Only Ben, near the greenhouse before dinner. I saw him; I was nowhere near the garden after that.

**5. What do you know about the evidence?**

Before (neutral): [no narration] | A cufflink proves very little. Victor entertained many guests, and the garden mud was everywhere after the rain.

After (neutral): [no narration] | Victor entertained many guests. The garden mud was everywhere after the rain. A cufflink proves very little.

**6. What happened when the victim died?**

Before (neutral): Clara lets a brief silence pass. | Allow me to be clear. I heard the alarm like everyone else. I went to the study only after Alice called for help.

After (neutral): [no narration] | I went to the study only after Alice called for help. I heard the alarm like everyone else.

**7. Where were you when the victim died?**

Before (neutral): Clara folds her arms. | My answer remains the same. I was in the library, trying to read while the storm passed.

After (neutral): [no narration] | While the storm passed, I was in the library, trying to read.

**8. What do you mean by that?**

Before (neutral): [no narration] | My meaning is quite specific. Allow me to be clear. I was in the library, trying to read while the storm passed.

After (neutral): [no narration] | Trying to read, in the library, while the storm passed. That is my account.

**9. Are you hiding something from me?**

Before (irritated): Clara holds a level gaze. | That is an assumption, Detective, not a question. Ask directly, and kindly spare me the insinuation.

After (irritated): [no narration] | You are making an assumption. Ask me a question.

**10. You killed Victor.**

Before (irritated): Clara lets a brief silence pass. | I object to the assumption, Detective. That is an assumption, Detective, not a question. Ask directly, and kindly spare me the insinuation.

After (irritated): [no narration] | A direct question would be more useful than that assumption.

**11. Did you have a reason to hurt the victim?**

Before (irritated): [no narration] | I object to the assumption, Detective. My answer remains the same. I had no reason to harm Victor. Our partnership was difficult at times, but it was profitable.

After (irritated): [no narration] | I had no reason to harm Victor. Difficult at times does not mean unprofitable; our partnership was profitable.

**12. What about the silver cufflink?**

Before (irritated): Clara folds her arms. | I object to the assumption, Detective. A cufflink proves very little. Victor entertained many guests, and the garden mud was everywhere after the rain.

After (irritated): [no narration] | Many guests were entertained by Victor; the garden mud was everywhere after the rain. What does a cufflink prove? Very little.

**13. What do you mean by that?**

Before (irritated): Clara holds a level gaze. | My meaning is quite specific. A cufflink proves very little. Victor entertained many guests, and the garden mud was everywhere after the rain.

After (irritated): [no narration] | Very little is what a cufflink proves. Victor entertained many guests, and the garden mud was everywhere after the rain.

**14. Did you see anyone suspicious?**

Before (irritated): [no narration] | I object to the assumption, Detective. My answer remains the same. I saw only Ben near the greenhouse before dinner. I was nowhere near the garden after that.

After (irritated): [no narration] | Ben was the only person I saw, near the greenhouse before dinner. I was nowhere near the garden after that.

**15. Alice said she saw you near the garden; how do your accounts fit?**

Before (irritated): Clara lets a brief silence pass. | I object to the assumption, Detective. I saw only Ben near the greenhouse before dinner. I was nowhere near the garden after that.

After (irritated): [no narration] | I saw only Ben. Near the greenhouse, before dinner. I was nowhere near the garden after that.

**16. Are you hiding something from me?**

Before (irritated): Clara folds her arms. | I object to the assumption, Detective. That is an assumption, Detective, not a question. Ask directly, and kindly spare me the insinuation.

After (irritated): [no narration] | A direct question would be more useful than that assumption.

**17. What was your relationship with the victim?**

Before (irritated): [no narration] | I object to the assumption, Detective. My answer remains the same. Victor and I were business partners. Our disagreements were ordinary business matters.

After (irritated): [no narration] | Ordinary business matters were what we disagreed about. Victor and I were business partners.

**18. Where were you when the victim died?**

Before (irritated): Clara holds a level gaze. | I object to the assumption, Detective. I was in the library, trying to read while the storm passed.

After (irritated): [no narration] | The library was where I was, trying to read while the storm passed.
