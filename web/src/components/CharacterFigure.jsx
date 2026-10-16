import Artwork from './Artwork.jsx';
import { figureFor, genericFigure } from '../presentation/asset-manifest.js';
export default function CharacterFigure({ suspect, className = '' }) {
  const figure = figureFor(suspect.id);
  return <Artwork className={`character-figure ${className}`} asset={figure} fallback={genericFigure} decorative />;
}
