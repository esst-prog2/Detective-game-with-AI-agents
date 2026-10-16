import { useCallback, useEffect, useRef, useState } from 'react';
import { useInvestigation } from './state/InvestigationProvider.jsx';
import MainMenu from './screens/MainMenu.jsx';
import LocationSelection from './screens/LocationSelection.jsx';
import InvestigationScreen from './screens/InvestigationScreen.jsx';
import CaseConclusion from './screens/CaseConclusion.jsx';
import GameNavigation from './components/GameNavigation.jsx';
import EvidenceJournal from './components/EvidenceJournal.jsx';
import SuspectOverview from './components/SuspectOverview.jsx';
import AccusationDialog from './components/AccusationDialog.jsx';
import StatusNotice from './components/StatusNotice.jsx';
export default function App() {
  const { state, dispatch, canAct } = useInvestigation();
  const [accusing, setAccusing] = useState(null);
  const accusationTrigger = useRef(null);
  const closeDialog = useCallback(() => {
    setAccusing(null);
    requestAnimationFrame(() => {
      const trigger = accusationTrigger.current;
      if (trigger?.isConnected && !trigger.disabled) trigger.focus();
      else document.querySelector('h1[tabindex="-1"]')?.focus();
    });
  }, []);
  function accuse(id) { if (canAct) { accusationTrigger.current = document.activeElement; setAccusing({ id }); } }
  useEffect(() => { if (!accusing) document.querySelector('h1[tabindex="-1"]')?.focus(); }, [state.screen, state.snapshot?.currentLocationId]);
  if (!state.snapshot) return <MainMenu />;
  return <div className="game-shell"><a className="skip-link" href="#main">Skip to investigation</a><GameNavigation />
    <main id="main"><div className="case-header"><span className="case-id">CASE FILE / 001</span><span>{state.snapshot.title}</span><span className="case-state">{state.expired ? 'Session unavailable' : state.endedKnown ? 'Concluded' : 'Investigation open'}</span></div>
      <StatusNotice />
      {state.screen === 'locations' ? <LocationSelection /> : state.screen === 'suspects' ? <SuspectOverview onAccuse={accuse} /> : state.screen === 'journal' ? <EvidenceJournal /> : state.screen === 'conclusion' ? <CaseConclusion /> : <InvestigationScreen key={state.snapshot.currentLocationId} onAccuse={accuse} />}
    </main>
    <footer className="game-footer"><span>ASHCROFT MANOR</span><span>Review your notes anywhere. Visit a room to question its inhabitants.</span><button onClick={() => dispatch({ type: 'NAVIGATE', screen: state.endedKnown ? 'conclusion' : 'suspects' })}>Back to case overview ↑</button></footer>
    {accusing && <AccusationDialog initialId={accusing.id} onClose={closeDialog} />}
  </div>;
}
