import Artwork from './Artwork.jsx';
import { figureFor, genericFigure } from '../presentation/asset-manifest.js';
export default function CharacterFigure({ suspect, demeanor = 'neutral', className = '' }) {
  const figure = figureFor(suspect.id, demeanor);
  return <Artwork className={`character-figure ${className}`} asset={figure} fallback={genericFigure} decorative />;
}
