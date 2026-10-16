import { useEffect, useState } from 'react';
export default function Artwork({ asset, fallback, className = '', decorative = false }) {
  const [src, setSrc] = useState(asset.src);
  useEffect(() => setSrc(asset.src), [asset.src]);
  return <img className={className} src={src} alt={decorative ? '' : asset.alt} draggable="false"
    onError={() => { if (src !== fallback.src) setSrc(fallback.src); }} />;
}
