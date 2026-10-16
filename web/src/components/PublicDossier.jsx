export default function PublicDossier({ suspect }) {
  const { dossier } = suspect;
  return <div className="public-dossier"><p className="eyebrow">{dossier.role}</p><p>{dossier.background}</p><p className="dossier-connection">{dossier.relationshipToVictim}</p>
    {dossier.relationships.length ? <ul>{dossier.relationships.map((edge, index) => <li key={`${edge.targetSuspectId}-${index}`}>{edge.label}</li>)}</ul> : <p className="dossier-empty">No additional relationships recorded in this dossier.</p>}
  </div>;
}
