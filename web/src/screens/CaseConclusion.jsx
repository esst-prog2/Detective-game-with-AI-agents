import { useInvestigation } from '../state/InvestigationProvider.jsx';
export default function CaseConclusion() {
  const { state, client, dispatch } = useInvestigation();
  const final = state.snapshot.lifecycle.finalResult;
  return <section className="conclusion-page"><div className="conclusion-seal" aria-hidden="true">◇</div><p className="eyebrow">INVESTIGATION CLOSED</p><h1 tabIndex="-1">{final?.result === 'correct' ? 'The truth comes to light.' : 'The case closes in shadow.'}</h1><p className="verdict">{final?.text ?? 'Refresh the investigation to read the final result.'}</p><div className="ornament" aria-hidden="true">─ ◆ ─</div><p>Your received notes remain available to review.<br />A new investigation begins with a clean folio.</p>
    <div className="conclusion-actions"><button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'journal' })}>Review evidence journal</button><button className="primary" disabled={!!state.pending} onClick={() => client.start()}>Start new investigation <span aria-hidden="true">→</span></button></div>
  </section>;
}
