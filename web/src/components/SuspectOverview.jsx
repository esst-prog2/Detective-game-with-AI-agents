import { useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import Portrait from './Portrait.jsx';
import PublicDossier from './PublicDossier.jsx';
import ReadingDialog from './ReadingDialog.jsx';
export default function SuspectOverview({ onAccuse }) {
  const { state, dispatch, client, canAct } = useInvestigation();
  const [historyId, setHistoryId] = useState(null);
  const historyPerson = state.snapshot.suspects.find(({ id }) => id === historyId);
  return <section className="suspects-page"><header className="section-heading"><p className="eyebrow">INVESTIGATION OVERVIEW</p><h1 tabIndex="-1">People of the manor</h1><p>Public dossiers and received testimony. Current whereabouts do not establish an alibi.</p></header>
    <div className="suspect-grid">{state.snapshot.suspects.map((suspect, i) => {
      const room = state.snapshot.rooms.find(({ id }) => id === suspect.locationId);
      const present = suspect.locationId === state.snapshot.currentLocationId;
      return <article className="suspect-card" key={suspect.id}><div className="portrait-mount"><Portrait suspect={suspect} /><span className="portrait-number">0{i + 1}</span></div><div className="suspect-copy"><p className="eyebrow">{room.name}</p><h2>{suspect.name}</h2><PublicDossier suspect={suspect} />
        <div className="card-actions">{!state.endedKnown && <button disabled={state.expired || (!present && !canAct)} onClick={() => present ? dispatch({ type: 'SUSPECT', id: suspect.id }) : client.travel(room.id)}>{present ? 'Speak with ' + suspect.name : 'Travel to ' + room.name} <span aria-hidden="true">→</span></button>}
        <button onClick={() => setHistoryId(suspect.id)}>Read conversation</button><button className="subtle" disabled={!canAct} onClick={() => onAccuse(suspect.id)}>Accuse</button></div></div></article>;
    })}</div>
    {historyPerson && <ReadingDialog title={'Conversation history — ' + historyPerson.name} onClose={() => setHistoryId(null)}>{(state.transcripts[historyId] ?? []).length ? <ol className="received-history">{state.transcripts[historyId].map((record) => <li key={record.id}><p className="question-history">You: {record.question}</p><p><strong>{record.kind === 'unsupported' ? 'Guidance' : historyPerson.name}:</strong> {record.text}</p></li>)}</ol> : <p>No received replies yet.</p>}</ReadingDialog>}
  </section>;
}
