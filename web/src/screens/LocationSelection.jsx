import { useInvestigation } from '../state/InvestigationProvider.jsx';
import { sceneFor, genericScene } from '../presentation/asset-manifest.js';
import Artwork from '../components/Artwork.jsx';
export default function LocationSelection() {
  const { state, dispatch, client, canAct } = useInvestigation();
  return <section className="locations-page"><header className="section-heading"><p className="eyebrow">THE MANOR</p><h1 tabIndex="-1">Move through the manor</h1><p>Visit a room to speak with the people there and examine its evidence.</p></header><div className="location-grid">{state.snapshot.rooms.map((room, i) => <button className="location-card" key={room.id} disabled={!canAct} onClick={() => client.travel(room.id)}><Artwork asset={sceneFor(room.name)} fallback={genericScene} decorative /><div className="location-caption"><span className="eyebrow">0{i + 1} / {room.id === state.snapshot.currentLocationId ? 'YOU ARE HERE' : 'ASHCROFT MANOR'}</span><h2>{room.name}</h2><p>{sceneFor(room.name).caption}</p><span className="text-link">Go to {room.name} <span aria-hidden="true">→</span></span></div></button>)}</div><button className="back-button" onClick={() => dispatch({ type: 'NAVIGATE', screen: state.endedKnown ? 'conclusion' : 'room' })}>Return to {state.endedKnown ? 'case conclusion' : 'current room'}</button></section>;
}
