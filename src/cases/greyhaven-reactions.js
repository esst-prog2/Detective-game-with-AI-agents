// Each move frames the entire already-authorized statement. All pilot turns are speech-only.
export const strategies = Object.freeze(['invite-account', 'set-boundary']);

export const witnesses = {
  Owen: {
    goal: 'explain-own-work', style: 'Short sentences. Concrete workshop language.',
    'invite-account': {
      instruction: 'own-the-explanation',
      moves: [
        ['invite-follow-up', 'Let me finish, then ask me about the work.'],
        ['acknowledge-question', "Fair question. I'll answer it straight."]
      ]
    },
    'set-boundary': {
      instruction: 'insist-on-precision',
      moves: [
        ['narrow-to-work', "Stick to the job for a minute."],
        ['separate-questions', "One thing at a time. The work or the argument?"]
      ]
    }
  },
  Mara: {
    goal: 'keep-interview-specific', style: 'Measured, practical, complete sentences.',
    'invite-account': {
      instruction: 'keep-conversation-open',
      moves: [
        ['invite-precise-question', 'Which part would you like me to take first?'],
        ['hear-detective-out', "Please finish your question. I can give you my attention."]
      ]
    },
    'set-boundary': {
      instruction: 'limit-to-observation',
      moves: [
        ['narrow-observation', 'Could you put your finger on the particular moment you mean?'],
        ['reserve-judgment', "I would like to hear what you mean before I agree with that reading."]
      ]
    }
  }
};
