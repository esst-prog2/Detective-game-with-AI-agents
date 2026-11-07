import { useInvestigation } from '../state/InvestigationProvider.jsx';

export default function PublicDossier({ suspect }) {
  const { state } = useInvestigation();
  const { dossier } = suspect;
  const normalize = (text) => text.toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const background = normalize(dossier.background);
  const victim = state.snapshot.victim.name;
  const connection = dossier.relationshipToVictim;
  // Suppress repeated public prose, including the existing employment/partner formats.
  // This is presentation only; do not infer a new relationship from a description.
  const repeated = background.includes(normalize(connection))
    || (connection === `Employed by ${victim}.` && background.includes(normalize(`works as ${victim}'s`)))
    || (connection === `Business partner of ${victim}.` && background.includes(normalize(`${victim}'s business partner`)));
  const relationships = dossier.relationships.flatMap((edge) => {
    const target = state.snapshot.suspects.find((person) => person.id === edge.targetSuspectId);
    if (!target) return []; // Never display a guessed name or internal identifier.
    const label = normalize(edge.label).includes(normalize(target.name)) ? edge.label : `${target.name} — ${edge.label}`;
    return background.includes(normalize(label)) ? [] : [label];
  });
  const rows = [...new Set([...(repeated ? [] : [connection]), ...relationships])];
  return <div className="public-dossier"><p className="eyebrow">{dossier.role}</p><p>{dossier.background}</p>
    {rows.length ? <><p className="eyebrow">Relationships</p><ul>{rows.map((label) => <li key={label}>{label}</li>)}</ul></> : <p className="dossier-empty">No additional relationships recorded in this dossier.</p>}
  </div>;
}
