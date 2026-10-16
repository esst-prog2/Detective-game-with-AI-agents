import { useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import { evidenceFor, genericEvidence } from '../presentation/asset-manifest.js';
import Artwork from './Artwork.jsx';
export default function EvidenceJournal() {
  const { state, client, canAct, dispatch } = useInvestigation();
  const [selected, setSelected] = useState(null);
  return <section className="journal-page"><header className="section-heading"><p className="eyebrow">YOUR OBSERVATIONS</p><h1 tabIndex="-1">The evidence journal</h1><p>Visit a clue's room to inspect it. Received observations can be read anywhere in this browser investigation.</p></header>
    <div className="journal-grid">{state.snapshot.evidence.map((clue, i) => {
      const received = state.inspected[clue.id];
      const room = state.snapshot.rooms.find(({ id }) => id === clue.locationId);
      const present = state.snapshot.currentLocationId === clue.locationId;
      return <article className="evidence-card" data-reviewed={selected === clue.id} key={clue.id}><div className="clue-top"><span className="catalog-number">EXHIBIT / 0{i + 1} · {room.name}</span><span className="clue-status">{received ? 'Inspected in this browser session' : 'Available in ' + room.name}</span></div>
        <Artwork asset={evidenceFor(clue.id)} fallback={genericEvidence} decorative /><h2>{clue.name}</h2>
        {received ? <p className="evidence-description">{received.description}</p> : <p className="empty-description">Examine this clue in {room.name} to add its description to your notes.</p>}
        <button className="ink-button" disabled={!received && !canAct} onClick={async () => { setSelected(clue.id); if (!received) { if (present) await client.inspect(clue.id); else await client.travel(room.id); } }}>{received ? 'Review observation' : present ? 'Inspect evidence' : 'Travel to ' + room.name} <span aria-hidden="true">→</span></button>
      </article>;
    })}</div><button className="back-button" onClick={() => dispatch({ type: 'NAVIGATE', screen: state.endedKnown ? 'conclusion' : 'room' })}>← {state.endedKnown ? 'Case conclusion' : 'Return to current room'}</button>
  </section>;
}
