import Artwork from './Artwork.jsx';
import { portraitFor, genericPortrait } from '../presentation/asset-manifest.js';
export default function Portrait({ suspect, className = '' }) {
  return <Artwork className={`portrait ${className}`} asset={portraitFor(suspect.id)} fallback={genericPortrait} />;
}
