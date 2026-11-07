import { useInvestigation } from '../state/InvestigationProvider.jsx';
export default function PreviewNotice() {
  const { state, client } = useInvestigation();
  if (state.case?.mode !== 'preview') return null;
  return <section className="preview-notice" aria-label="Preview objective"><h2>Repair dispute preview</h2><p>Only Mara and Owen, reception and the boathouse are included. Inspect both boathouse records, hear Owen's account, then use an available evidence question. Review the explanation beside Mara's account.</p><p>Repair spending does not establish murder guilt. The full murder investigation and final accusation are not included. You can continue exploring. Starting another case begins with new notes.</p><button disabled={!!state.pending} onClick={() => client.start('ashcroft')}>Start a new Ashcroft investigation</button></section>;
}
