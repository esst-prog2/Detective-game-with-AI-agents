import { useInvestigation } from '../state/InvestigationProvider.jsx';
import { titleArt, genericScene } from '../presentation/asset-manifest.js';
import Artwork from '../components/Artwork.jsx';
import StatusNotice from '../components/StatusNotice.jsx';
export default function MainMenu() {
  const { state, client } = useInvestigation();
  return <main id="main" className="title-screen">
    <Artwork className="title-art" asset={{ src: titleArt, alt: 'An illustrated manor under a moonlit sky.' }} fallback={genericScene} decorative />
    <div className="title-shade" />
    <div className="title-content"><p className="eyebrow">AN ILLUSTRATED DETECTIVE MYSTERY</p><div className="ornament" aria-hidden="true">─ ◆ ─</div>
      <h1>Ashcroft<br /><em>Manor</em></h1><p className="title-subtitle">Every answer leaves a shadow.</p>
      <p className="title-intro">Listen to the suspects. Follow the evidence.<br />Make the accusation that closes the case.</p>
      <button className="primary start-button" disabled={!!state.pending} onClick={() => client.start()}>Start investigation <span aria-hidden="true">↗</span></button>
      <StatusNotice /><p className="small-print">A single case. Your own deductions.<br />Playthroughs and notes are held only while this page is open.</p>
    </div><p className="title-footer">QUESTION EVERYTHING <span aria-hidden="true">✦</span> TRUST YOUR OBSERVATIONS</p>
  </main>;
}
