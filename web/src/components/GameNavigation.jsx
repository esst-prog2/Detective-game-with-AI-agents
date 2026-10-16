import { useInvestigation } from '../state/InvestigationProvider.jsx';
export default function GameNavigation() {
  const { state, dispatch } = useInvestigation();
  const entries = [['room', 'Current room'], ['locations', 'Rooms'], ['suspects', 'Investigation overview'], ['journal', 'Evidence journal']];
  return <nav className="game-nav" aria-label="Investigation navigation"><a className="wordmark" href="#main" onClick={(event) => { event.preventDefault(); dispatch({ type: 'NAVIGATE', screen: state.endedKnown ? 'conclusion' : 'room' }); }}><span aria-hidden="true">✦</span> ASHCROFT <small>CASE FILE</small></a>
    <div className="nav-links">{entries.map(([screen, name]) => <button key={screen} className={state.screen === screen || screen === 'room' && state.screen === 'dialogue' ? 'selected' : ''} aria-current={state.screen === screen ? 'page' : undefined} onClick={() => dispatch({ type: 'NAVIGATE', screen })}>{name}</button>)}
      {state.endedKnown && <button className={state.screen === 'conclusion' ? 'selected' : ''} aria-current={state.screen === 'conclusion' ? 'page' : undefined} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'conclusion' })}>Case result</button>}
    </div>
  </nav>;
}
