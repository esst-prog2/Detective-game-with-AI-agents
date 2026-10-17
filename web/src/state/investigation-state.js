export const initialState = {
  generation: 0, revision: 0, snapshot: null, screen: 'menu', scene: null, suspectId: null,
  transcripts: {}, inspected: {}, drafts: {}, pending: null, error: null, uncertain: false,
  expired: false, endedKnown: false, notice: '',
};

function mergeHistory(transcripts, snapshot) {
  const next = { ...transcripts };
  for (const conversation of snapshot.dialogue.conversations) {
    const records = [...(next[conversation.suspectId] ?? [])];
    for (const turn of conversation.recentTurns) {
      if (!records.some((record) => record.turnId === turn.turnId)) records.push({ ...turn, id: `turn-${turn.turnId}`, text: turn.dialogue });
    }
    // IDs order substantive testimony even when a GET overtakes its command reply.
    const turns = records.filter((record) => record.kind === 'answer').sort((a, b) => a.turnId - b.turnId);
    let index = 0;
    next[conversation.suspectId] = records.map((record) => record.kind === 'answer' ? turns[index++] : record);
    if (!records.length) delete next[conversation.suspectId];
  }
  return next;
}

export function investigationReducer(state, action) {
  if (action.type === 'BEGIN') return { ...state, generation: action.generation, pending: state.pending?.mutation && !action.mutation ? state.pending : { id: action.id, label: action.label, mutation: action.mutation }, error: null };
  if (action.generation !== undefined && action.generation !== state.generation) return state;
  switch (action.type) {
    case 'SESSION': return { ...initialState, generation: state.generation, snapshot: action.state, revision: action.revision,
      screen: 'room', scene: action.state.currentLocationId, suspectId: null, pending: state.pending, transcripts: mergeHistory({}, action.state) };
    case 'DATA': {
      if (action.revision < state.revision || (state.endedKnown && action.state.lifecycle.status !== 'ended')) return state;
      const ended = action.state.lifecycle.status === 'ended';
      const moved = action.state.currentLocationId !== state.snapshot?.currentLocationId;
      const selectedPresent = action.state.suspects.some((suspect) => suspect.id === state.suspectId && suspect.locationId === action.state.currentLocationId);
      const lateEndedQuestion = ended && action.command === 'questions';
      let transcripts = lateEndedQuestion ? state.transcripts : mergeHistory(state.transcripts, action.state);
      let inspected = state.inspected;
      let drafts = state.drafts;
      if (!ended && action.command === 'questions' && action.result) {
        if (action.result.kind === 'unsupported' && !(transcripts[action.input.suspectId] ?? []).some((record) => record.id === `guidance-${action.id}`)) {
          const record = { ...action.result, id: `guidance-${action.id}`, question: action.input.question ?? 'Selected conversation option', localGuidance: true };
          transcripts = { ...transcripts, [action.input.suspectId]: [...(transcripts[action.input.suspectId] ?? []), record] };
        }
        // Do not erase edits typed while waiting for the previous reply.
        if (typeof action.input.question === 'string' && drafts[action.input.suspectId]?.trim() === action.input.question.trim()) drafts = { ...drafts, [action.input.suspectId]: '' };
      }
      if (!ended && action.command === 'evidence/inspect' && action.result) inspected = { ...inspected, [action.result.id]: action.result };
      return { ...state, snapshot: action.state, scene: action.state.currentLocationId, revision: action.revision, transcripts, inspected, drafts,
        suspectId: moved || !selectedPresent ? null : state.suspectId,
        endedKnown: state.endedKnown || ended, uncertain: false,
        screen: ended && !state.snapshot?.lifecycle.finalResult ? 'conclusion' : moved || action.command === 'travel' || (state.screen === 'dialogue' && !selectedPresent) ? 'room' : state.screen,
        notice: ended ? '' : action.command === 'questions' && action.result ? 'Reply received.' : action.command === 'accusations' && action.result?.result === 'cancelled' ? 'Accusation canceled. Your investigation continues.' : state.notice };
    }
    case 'FAIL': return { ...state, error: { code: action.code, message: action.message }, uncertain: action.uncertain || state.uncertain,
      endedKnown: state.endedKnown || action.code === 'investigation_ended' };
    case 'EXPIRED': return { ...state, pending: null, expired: true, uncertain: true, error: { code: 'session_not_found', message: 'This investigation is no longer available. Your received notes remain here; start a new investigation when ready.' } };
    case 'SETTLED': return state.pending?.id === action.id ? { ...state, pending: null } : state;
    case 'NAVIGATE': return { ...state, screen: action.screen };
    case 'SUSPECT': return !state.endedKnown && state.snapshot.suspects.some((suspect) => suspect.id === action.id && suspect.locationId === state.snapshot.currentLocationId)
      ? { ...state, suspectId: action.id, screen: 'dialogue' } : state;
    case 'DRAFT': return { ...state, drafts: { ...state.drafts, [action.id]: action.text } };
    case 'NOTICE': return { ...state, notice: action.text };
    default: return state;
  }
}
