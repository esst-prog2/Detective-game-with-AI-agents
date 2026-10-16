import { useInvestigation } from '../state/InvestigationProvider.jsx';
import { sceneFor, genericScene } from '../presentation/asset-manifest.js';
import Artwork from './Artwork.jsx';
export default function SceneStage() {
  const { state, dispatch } = useInvestigation();
  const asset = sceneFor(state.scene);
  return <div className="scene-stage"><Artwork className="scene-background" asset={asset} fallback={genericScene} decorative />
    <div className="scene-vignette" /><div className="scene-heading"><button className="scene-back" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'locations' })}>← Locations</button>
      <p className="eyebrow">ASHCROFT MANOR · SCENE</p><h1 tabIndex="-1">{state.scene}</h1><p>{asset.caption}</p></div>
    <div className="scene-label"><span aria-hidden="true">◇</span> A quiet place to put the pieces together.</div>
  </div>;
}
