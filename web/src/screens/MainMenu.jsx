import { useEffect, useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import { titleArt, genericScene } from '../presentation/asset-manifest.js';
import Artwork from '../components/Artwork.jsx';
import StatusNotice from '../components/StatusNotice.jsx';
export default function MainMenu() {
  const { state, client } = useInvestigation();
  const [cases, setCases] = useState(null);
  const [selectedCase, setSelectedCase] = useState('ashcroft');
  const [listError, setListError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    setListError(false);
    client.listCases().then((items) => {
      if (current) { setCases(items); setSelectedCase(items.find((item) => item.id === 'ashcroft')?.id ?? items[0].id); }
    }).catch(() => { if (current) setListError(true); });
    return () => { current = false; };
  }, [client, attempt]);
  return <main id="main" className="title-screen">
    <Artwork className="title-art" asset={{ src: titleArt, alt: 'An illustrated manor under a moonlit sky.' }} fallback={genericScene} decorative />
    <div className="title-shade" />
    <div className="title-content"><p className="eyebrow">AN ILLUSTRATED DETECTIVE MYSTERY</p><div className="ornament" aria-hidden="true">─ ◆ ─</div>
      {selectedCase === 'ashcroft' ? <h1>Ashcroft<br /><em>Manor</em></h1> : <h1>{cases?.find((item) => item.id === selectedCase)?.title}</h1>}<p className="title-subtitle">Every answer leaves a shadow.</p>
      <p className="title-intro">Listen to the suspects. Follow the evidence.<br />Make the accusation that closes the case.</p>
      {cases && <label>Case <select aria-label="Case" value={selectedCase} disabled={!!state.pending} onChange={(event) => setSelectedCase(event.target.value)}>
        {cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select></label>}
      {listError && <p role="status">Available cases could not be loaded. <button onClick={() => setAttempt((value) => value + 1)}>Retry case list</button></p>}
      <button className="primary start-button" disabled={!!state.pending || !cases || listError} onClick={() => client.start(selectedCase)}>Start investigation <span aria-hidden="true">↗</span></button>
      <StatusNotice /><p className="small-print">A single case. Your own deductions.<br />Playthroughs and notes are held only while this page is open.</p>
    </div><p className="title-footer">QUESTION EVERYTHING <span aria-hidden="true">✦</span> TRUST YOUR OBSERVATIONS</p>
  </main>;
}
