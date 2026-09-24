export const TOPICS = Object.freeze([
  'alibi',
  'relationship_with_victim',
  'motive',
  'sighting',
  'evidence',
  'crime_details',
]);

const response = (approvedContent, truthfulness, concealmentReason = null) => ({
  approvedContent,
  fallbackText: approvedContent,
  truthfulness,
  concealmentReason,
});

export const caseData = Object.freeze({
  title: 'The Ashcroft Manor Murder',
  victim: {
    name: 'Victor Hale',
    description: 'The owner of Ashcroft Manor, found dead in his study after a stormy dinner.',
  },
  murdererId: 'clara-voss',
  locations: ['the study', 'the library', 'the garden'],
  evidence: [
    {
      id: 'muddy-footprints',
      name: 'Muddy footprints',
      description: 'Fresh muddy footprints lead from the garden door toward the study side entrance.',
    },
    {
      id: 'torn-contract',
      name: 'Torn contract',
      description: 'A torn business contract in Victor’s study shows he planned to end his partnership with Clara.',
    },
    {
      id: 'silver-cufflink',
      name: 'Silver cufflink',
      description: 'A silver cufflink bearing a V-shaped engraving was found beneath Victor’s desk.',
    },
  ],
  intendedSolution: [
    'The torn contract establishes that Clara had a strong motive.',
    'Alice saw Clara leave the garden near the time of the murder.',
    'The muddy footprints and Clara’s missing cufflink connect her to the study entrance.',
  ],
  suspects: [
    {
      id: 'alice-mercer',
      name: 'Alice Mercer',
      personality: 'Nervous, dutiful, and quick to avoid personal questions.',
      relationshipToVictim: 'Victor’s housekeeper, who depended on him for her position.',
      motive: 'No reason to kill Victor, but she feared he would discover her private debt.',
      privateFacts: [
        'Alice hid in the library reading a debt letter during the murder.',
        'Alice saw Clara leave the garden toward the study side entrance.',
      ],
      permittedLie: {
        subject: 'her alibi',
        reason: 'She is ashamed of her debt and does not want Victor’s affairs examined.',
      },
      responses: {
        alibi: response('I was at home in my room all evening.', 'lie', 'Alice was in the library hiding a debt letter.'),
        relationship_with_victim: response('Victor was my employer. He could be demanding, but I tried to serve him well.', 'truth'),
        motive: response('I had no wish to harm Victor. My debt was my own problem, not his.', 'concealment', 'Alice does not mention the debt.'),
        sighting: response('I saw Clara coming in from the garden shortly before the alarm, though I did not see where she went next.', 'truth'),
        evidence: response('Those muddy footprints came from someone who used the garden door, not from me.', 'truth'),
        crime_details: response('I heard a sharp sound from the study, then found Victor after the others gathered.', 'truth'),
      },
    },
    {
      id: 'ben-carter',
      name: 'Ben Carter',
      personality: 'Blunt, proud, and easily provoked by accusations.',
      relationshipToVictim: 'Victor’s gardener, recently threatened with dismissal.',
      motive: 'Victor planned to replace Ben after complaints about the garden.',
      privateFacts: [
        'Ben was repairing a greenhouse window during the murder.',
        'Ben argued with Victor earlier that day about losing his job.',
      ],
      permittedLie: {
        subject: 'the earlier argument',
        reason: 'He fears the argument makes him look guilty.',
      },
      responses: {
        alibi: response('I was repairing the greenhouse window when Victor died.', 'truth'),
        relationship_with_victim: response('Victor was my employer. We did not always agree, but I knew the grounds better than anyone.', 'concealment', 'Ben omits the dismissal threat.'),
        motive: response('I was angry about work, not murderous. Losing a job is not a reason to kill a man.', 'truth'),
        sighting: response('I saw no one clearly from the greenhouse. The rain made the garden hard to see.', 'truth'),
        evidence: response('The mud by the garden door was fresh after the storm. Anyone using that path would have tracked it inside.', 'truth'),
        crime_details: response('I heard Alice call out from the house, then I came straight to the study.', 'truth'),
      },
    },
    {
      id: 'clara-voss',
      name: 'Clara Voss',
      personality: 'Polished, composed, and calculating under pressure.',
      relationshipToVictim: 'Victor’s business partner and a frequent guest at Ashcroft Manor.',
      motive: 'Victor intended to dissolve their partnership after discovering Clara had concealed losses.',
      privateFacts: [
        'Clara met Victor in the study to confront him about the contract.',
        'Clara killed Victor and left through the garden side entrance.',
      ],
      permittedLie: {
        subject: 'her alibi',
        reason: 'She is concealing the murder and her presence in the study.',
      },
      responses: {
        alibi: response('I was in the library, trying to read while the storm passed.', 'lie', 'Clara was in Victor’s study and then the garden.'),
        relationship_with_victim: response('Victor and I were business partners. Our disagreements were ordinary business matters.', 'concealment', 'Clara hides that Victor planned to dissolve the partnership.'),
        motive: response('I had no reason to harm Victor. Our partnership was difficult at times, but it was profitable.', 'lie', 'Victor was ending the partnership over concealed losses.'),
        sighting: response('I saw only Ben near the greenhouse before dinner. I was nowhere near the garden after that.', 'lie', 'Clara left through the garden after the murder.'),
        evidence: response('A cufflink proves very little. Victor entertained many guests, and the garden mud was everywhere after the rain.', 'concealment', 'The cufflink is Clara’s and the footprints are hers.'),
        crime_details: response('I heard the alarm like everyone else. I went to the study only after Alice called for help.', 'lie', 'Clara was present in the study during the murder.'),
      },
    },
  ],
});
