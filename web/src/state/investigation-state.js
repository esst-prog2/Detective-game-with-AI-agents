export const initialState = {
  generation: 0, revision: 0, snapshot: null, screen: 'menu', scene: null, suspectId: null,
  transcripts: {}, inspected: {}, drafts: {}, pending: null, error: null, uncertain: false,
  expired: false, endedKnown: false, notice: '',
};

export function investigationReducer(state, action) {
  if (action.type === 'BEGIN') return { ...state, generation: action.generation, pending: { id: action.id, label: action.label }, error: null };
  if (action.generation !== undefined && action.generation !== state.generation) return state;
  switch (action.type) {
    case 'SESSION': return { ...initialState, generation: state.generation, snapshot: action.state, revision: action.revision,
      screen: 'room', scene: action.state.currentLocationId, suspectId: null, pending: state.pending };
    case 'DATA': {
      if (action.revision < state.revision || (state.endedKnown && action.state.lifecycle.status !== 'ended')) return state;
      const ended = action.state.lifecycle.status === 'ended';
      const moved = action.state.currentLocationId !== state.snapshot?.currentLocationId;
      const selectedPresent = action.state.suspects.some((suspect) => suspect.id === state.suspectId && suspect.locationId === action.state.currentLocationId);
      let transcripts = state.transcripts;
      let inspected = state.inspected;
      let drafts = state.drafts;
      if (!ended && action.command === 'questions' && action.result && !Object.values(transcripts).flat().some((record) => record.id === action.id)) {
        const record = { id: action.id, question: action.input.question, ...action.result };
        transcripts = { ...transcripts, [action.input.suspectId]: [...(transcripts[action.input.suspectId] ?? []), record] };
        // Do not erase edits typed while waiting for the previous reply.
        if (drafts[action.input.suspectId]?.trim() === action.input.question.trim()) drafts = { ...drafts, [action.input.suspectId]: '' };
      }
      if (!ended && action.command === 'evidence/inspect' && action.result) inspected = { ...inspected, [action.result.id]: action.result };
      return { ...state, snapshot: action.state, scene: action.state.currentLocationId, revision: action.revision, transcripts, inspected, drafts,
        suspectId: moved || !selectedPresent ? null : state.suspectId,
        endedKnown: state.endedKnown || ended, uncertain: false,
        screen: ended && !state.snapshot?.lifecycle.finalResult ? 'conclusion' : moved || action.command === 'travel' || (state.screen === 'dialogue' && !selectedPresent) ? 'room' : state.screen,
        notice: ended ? '' : action.command === 'accusations' && action.result?.result === 'cancelled' ? 'Accusation canceled. Your investigation continues.' : state.notice };
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
