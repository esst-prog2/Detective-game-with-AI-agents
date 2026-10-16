import { useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import CharacterFigure from './CharacterFigure.jsx';
import ReadingDialog from './ReadingDialog.jsx';
import PublicDossier from './PublicDossier.jsx';
const examples = ['Where were you?', 'What was your relationship with Victor?', 'Did you have a reason to hurt Victor?', 'Did you see anyone suspicious?', 'What do you know about the evidence?', 'What happened when Victor died?'];
export default function DialoguePanel({ suspect }) {
  const { state, dispatch, client, canAct } = useInvestigation();
  const [reading, setReading] = useState(null);
  const records = state.transcripts[suspect.id] ?? [];
  const draft = state.drafts[suspect.id] ?? '';
  const latest = records.at(-1);
  return <div className="cinematic-conversation" aria-label={'Conversation with ' + suspect.name} aria-busy={!!state.pending}>
    <div className="conversation-top"><button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'room' })}>← Return to room</button><div><button onClick={() => setReading('dossier')}>Public dossier</button><button onClick={() => setReading('history')}>Conversation history ({records.length})</button></div></div>
    <CharacterFigure suspect={suspect} />
    <div className="figure-caption" aria-hidden="true"><span>{suspect.name}</span><small>{suspect.dossier.role}</small></div>
    <section className="cinematic-dialogue" aria-label="Dialogue and questions">
      <div className="speaker-label"><h1 tabIndex="-1">{suspect.name}</h1><span>{latest ? latest.kind === 'unsupported' ? 'QUESTION GUIDANCE' : 'RECEIVED TESTIMONY' : 'YOUR QUESTIONS'}</span></div>
      <blockquote tabIndex="0" aria-label="Latest reply">{latest?.text ?? 'What would you like to ask?'}</blockquote>
      <form onSubmit={(event) => { event.preventDefault(); if (canAct && draft.trim() && [...draft.trim()].length <= 1000) void client.ask(suspect.id, draft); }}>
        <label htmlFor="question">Your question for {suspect.name}</label><div className="question-row"><input id="question" value={draft} placeholder="Ask about an alibi, a sighting, or the evidence…" disabled={state.expired || state.endedKnown} onChange={(event) => dispatch({ type: 'DRAFT', id: suspect.id, text: event.target.value })} /><button className="primary" disabled={!canAct || !draft.trim() || [...draft.trim()].length > 1000}>Ask question <span aria-hidden="true">→</span></button></div>
        {[...draft.trim()].length > 1000 && <p className="field-error">Keep your question within 1,000 characters.</p>}
      </form>
      <details className="question-help"><summary>Need a starting point?</summary><div className="example-questions">{examples.map((question) => <button key={question} disabled={!canAct} onClick={() => dispatch({ type: 'DRAFT', id: suspect.id, text: question })}>{question}</button>)}</div></details>
    </section>
    {reading && <ReadingDialog title={reading === 'history' ? 'Conversation history — ' + suspect.name : 'Public dossier — ' + suspect.name} onClose={() => setReading(null)}>{reading === 'dossier' ? <PublicDossier suspect={suspect} /> : records.length ? <ol className="received-history">{records.map((record) => <li key={record.id}><p className="question-history">You: {record.question}</p><p><strong>{record.kind === 'unsupported' ? 'Guidance' : suspect.name}:</strong> {record.text}</p></li>)}</ol> : <p>No received replies yet.</p>}</ReadingDialog>}
  </div>;
}
