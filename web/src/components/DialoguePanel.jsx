import { useRef, useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import CharacterFigure from './CharacterFigure.jsx';
import ReadingDialog from './ReadingDialog.jsx';
import PublicDossier from './PublicDossier.jsx';
import ConversationHistory from './ConversationHistory.jsx';
export default function DialoguePanel({ suspect }) {
  const { state, dispatch, client, canAct } = useInvestigation();
  const [reading, setReading] = useState(null);
  const choicesHeading = useRef(null);
  const conversation = state.snapshot.dialogue.conversations.find((item) => item.suspectId === suspect.id);
  const options = conversation?.options ?? [];
  const records = state.transcripts[suspect.id] ?? [];
  const draft = state.drafts[suspect.id] ?? '';
  const latest = records.at(-1);
  return <div className="cinematic-conversation" aria-label={'Conversation with ' + suspect.name} aria-busy={!!state.pending}>
    <div className="conversation-top"><button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'room' })}>← Return to room</button><div><button onClick={() => setReading('dossier')}>Public dossier</button><button onClick={() => setReading('history')}>Conversation history ({records.length})</button></div></div>
    <CharacterFigure suspect={suspect} demeanor={conversation?.demeanor} />
    <div className="figure-caption" aria-hidden="true"><span>{suspect.name}</span><small>{suspect.dossier.role}</small></div>
    <section className="cinematic-dialogue" aria-label="Dialogue and questions">
      <div className="speaker-label"><h1 tabIndex="-1">{suspect.name}</h1><span>{latest ? latest.kind === 'unsupported' ? 'QUESTION GUIDANCE' : 'RECEIVED TESTIMONY' : 'YOUR QUESTIONS'}</span></div>
      {conversation && <div className="demeanor"><span aria-describedby="demeanor-explanation">Demeanor: {conversation.demeanor}</span><details className="demeanor-help"><summary aria-label="About demeanor">?</summary><p id="demeanor-explanation">Demeanor reflects conversational delivery. It does not establish truthfulness.</p></details><span className="sr-only">Demeanor reflects conversational delivery, not truthfulness.</span></div>}
      {latest?.narration && <p className="performance-narration"><em>{latest.narration}</em></p>}
      <blockquote tabIndex="0" aria-label="Latest reply">{latest?.dialogue ?? 'What would you like to ask?'}</blockquote>
      <section className="dialogue-choices" aria-labelledby="choices-heading"><h2 id="choices-heading" ref={choicesHeading} tabIndex="-1">Continue the conversation</h2>
        <div>{options.map((option) => <button key={option.id} disabled={!canAct} data-choice={option.id} onClick={async (event) => {
          const button = event.currentTarget;
          await client.choose(suspect.id, option.id);
          requestAnimationFrame(() => { if (choicesHeading.current && (!button.isConnected || document.activeElement === document.body || document.activeElement === button)) choicesHeading.current.focus(); });
        }}><span>{option.label}</span><small>{({ clarify: 'Follow-up', revisit: 'Revisit', evidence: 'Evidence', contradiction: 'Compare accounts', social: 'Conversation', topic: 'Topic' })[option.kind]}</small></button>)}</div>
        {!options.length && <p>No suggested questions are available. You can still write your own question while this conversation is active.</p>}
      </section>
      <form onSubmit={(event) => { event.preventDefault(); if (canAct && draft.trim() && [...draft.trim()].length <= 1000) void client.ask(suspect.id, draft); }}>
        <label htmlFor="question">Your question for {suspect.name}</label><div className="question-row"><input id="question" value={draft} placeholder="Ask about an alibi, a sighting, or the evidence…" disabled={state.expired || state.endedKnown} onChange={(event) => dispatch({ type: 'DRAFT', id: suspect.id, text: event.target.value })} /><button className="primary" disabled={!canAct || !draft.trim() || [...draft.trim()].length > 1000}>Ask question <span aria-hidden="true">→</span></button></div>
        {[...draft.trim()].length > 1000 && <p className="field-error">Keep your question within 1,000 characters.</p>}
      </form>
      <p className="question-help">Choose a question above or ask in your own words. Suggestions reflect the current investigation.</p>
    </section>
    {reading && <ReadingDialog title={reading === 'history' ? 'Conversation history — ' + suspect.name : 'Public dossier — ' + suspect.name} onClose={() => setReading(null)}>{reading === 'dossier' ? <PublicDossier suspect={suspect} /> : <ConversationHistory records={records} suspect={suspect} />}</ReadingDialog>}
  </div>;
}
