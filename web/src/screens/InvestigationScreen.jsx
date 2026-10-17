import { useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import { sceneFor, genericScene, evidenceFor, genericEvidence } from '../presentation/asset-manifest.js';
import Artwork from '../components/Artwork.jsx';
import Portrait from '../components/Portrait.jsx';
import PublicDossier from '../components/PublicDossier.jsx';
import DialoguePanel from '../components/DialoguePanel.jsx';
export default function InvestigationScreen({ onAccuse }) {
  const { state, dispatch, client, canAct } = useInvestigation();
  const room = state.snapshot.rooms.find(({ id }) => id === state.snapshot.currentLocationId);
  const people = state.snapshot.suspects.filter(({ locationId }) => locationId === room.id);
  const clues = state.snapshot.evidence.filter(({ locationId }) => locationId === room.id);
  const selected = people.find(({ id }) => id === state.suspectId);
  const [inspecting, setInspecting] = useState(null);
  const scene = sceneFor(room.name);
  return <section className={'room-experience ' + (state.screen === 'dialogue' && selected ? 'interrogating' : '')} aria-label={'Investigation in ' + room.name}>
    <Artwork className="room-backdrop" asset={scene} fallback={genericScene} decorative /><div className="room-shade" />
    {state.screen === 'dialogue' && selected ? <DialoguePanel key={selected.id} suspect={selected} /> : <>
      <header className="room-heading"><p className="eyebrow">ASHCROFT MANOR / CURRENT ROOM</p><h1 tabIndex="-1">{room.name}</h1><p className="room-description">{scene.caption}</p></header>
      <div className="room-arrival"><span className="eyebrow">THE CASE</span><p>{state.snapshot.victim.description}</p><small>Current whereabouts are not accounts of the night of the murder.</small></div>
      <div className="room-inhabitants" aria-label="People present"><p className="eyebrow">IN THIS ROOM</p>
        {people.length ? people.map((suspect) => <article className="room-person" key={suspect.id}><Portrait suspect={suspect} /><div><h2>{suspect.name}</h2><PublicDossier suspect={suspect} /><button className="primary" disabled={state.endedKnown || state.expired} onClick={() => dispatch({ type: 'SUSPECT', id: suspect.id })}>Speak with {suspect.name} <span aria-hidden="true">→</span></button></div></article>) : <p className="room-empty">Nobody is here to question.</p>}
      </div>
      <aside className="room-objects" aria-label="Evidence in this room"><p className="eyebrow">EXAMINE THE ROOM</p>
        {clues.length ? clues.map((clue) => <button className="room-object" key={clue.id} disabled={!state.inspected[clue.id] && !canAct} onClick={async () => { setInspecting(clue.id); if (!state.inspected[clue.id]) await client.inspect(clue.id); }}><Artwork asset={evidenceFor(clue.id)} fallback={genericEvidence} decorative /><span>{clue.name}<small>{state.inspected[clue.id] ? 'Review observation' : 'Inspect evidence'}</small></span><span aria-hidden="true">↗</span></button>) : <p className="room-empty">No case evidence is recorded in this room.</p>}
        {inspecting && state.inspected[inspecting] && <div className="room-observation" role="status"><h3>{state.inspected[inspecting].name}</h3><p>{state.inspected[inspecting].description}</p><button onClick={() => setInspecting(null)}>Close observation</button></div>}
        <button className="room-journal" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'journal' })}>Open evidence journal <small>{state.snapshot.dialogue.inspectedEvidenceIds.length} of {state.snapshot.evidence.length} inspected</small></button>
      </aside>
    </>}
    <footer className="room-exits"><div><span className="eyebrow">LEAVE THE ROOM</span><div className="exit-links">{state.snapshot.rooms.filter(({ id }) => id !== room.id).map((exit) => <button key={exit.id} disabled={!canAct} onClick={() => client.travel(exit.id)}>Go to {exit.name} <span aria-hidden="true">→</span></button>)}</div></div><button className="danger" disabled={!canAct} onClick={() => onAccuse(selected?.id)}>Make an accusation</button></footer>
  </section>;
}
