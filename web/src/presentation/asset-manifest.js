// Presentation lookup only. Artwork conveys atmosphere, never case facts.
const sceneFallback = {
  src: '/art/locations/generic.svg',
  alt: 'Illustrated lamplit interior with a tall arched window.',
  caption: 'Quiet corners, warm lamplight, and room to think.',
};
const scenes = {
  'the study': {
    src: '/art/locations/study.svg',
    alt: 'Illustrated study with a wooden desk, arched window, and warm table lamp.',
    caption: 'Lamplight pools across polished wood.',
  },
  'the library': {
    src: '/art/locations/library.svg',
    alt: 'Illustrated library with tall bookshelves, a reading chair, and a rolling ladder.',
    caption: 'Deep shelves and a quiet reading corner.',
  },
  'the garden': {
    src: '/art/locations/garden.svg',
    alt: 'Illustrated moonlit garden with an arched trellis, stone path, and bench.',
    caption: 'Cool moonlight settles over the garden.',
  },
};
const portraits = {
  'alice-mercer': { src: '/art/portraits/alice-mercer-neutral.svg', alt: 'Illustrated portrait of Alice Mercer.' },
  'ben-carter': { src: '/art/portraits/ben-carter-neutral.svg', alt: 'Illustrated portrait of Ben Carter.' },
  'clara-voss': { src: '/art/portraits/clara-voss-neutral.svg', alt: 'Illustrated portrait of Clara Voss.' },
};
const evidence = {
  'muddy-footprints': { src: '/art/evidence/muddy-footprints.svg', alt: 'Catalog illustration of footprints.' },
  'torn-contract': { src: '/art/evidence/torn-contract.svg', alt: 'Catalog illustration of torn paper.' },
  'silver-cufflink': { src: '/art/evidence/silver-cufflink.svg', alt: 'Catalog illustration of a silver cufflink.' },
};
export const titleArt = '/art/ui/manor.svg';
export const genericScene = sceneFallback;
export const genericPortrait = { src: '/art/portraits/generic-neutral.svg', alt: 'Illustrated neutral character portrait.' };
export const genericEvidence = { src: '/art/evidence/generic.svg', alt: 'Illustrated evidence folio.' };
export function sceneFor(location) {
  return { ...(Object.hasOwn(scenes, location) ? scenes[location] : sceneFallback) };
}
export function portraitFor(id) {
  return { ...(Object.hasOwn(portraits, id) ? portraits[id] : genericPortrait) };
}
export function evidenceFor(id) {
  return { ...(Object.hasOwn(evidence, id) ? evidence[id] : genericEvidence) };
}

// Separate neutral knee-up figure placeholders; no emotional state is inferred.
export const genericFigure = { src: '/art/figures/generic-neutral.svg', alt: 'Temporary illustrated neutral standing figure.' };
const figures = {
  'alice-mercer': { neutral: '/art/figures/alice-mercer-neutral.svg' },
  'ben-carter': { neutral: '/art/figures/ben-carter-neutral.svg' },
  'clara-voss': { neutral: '/art/figures/clara-voss-neutral.svg' },
};
export function figureFor(id, demeanor = 'neutral') {
  const variants = Object.hasOwn(figures, id) ? figures[id] : null;
  const expression = ['neutral', 'receptive', 'irritated', 'uneasy'].includes(demeanor) && variants && Object.hasOwn(variants, demeanor) ? variants[demeanor] : variants?.neutral;
  return expression ? { src: expression, alt: 'Temporary illustrated standing character figure.' } : { ...genericFigure };
}
