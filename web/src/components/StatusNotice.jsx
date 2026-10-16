import { useInvestigation } from '../state/InvestigationProvider.jsx';
export default function StatusNotice() {
  const { state, client } = useInvestigation();
  return <div className="status-area">
    <div className="live-status" role="status" aria-live="polite">{state.pending ? <><span className="loading-mark" aria-hidden="true">✦</span> {state.pending.label}</> : state.notice}</div>
    {state.error && <div className="error-notice" role="alert"><p>{state.error.message}</p>
      {!state.expired && state.snapshot && <button disabled={!!state.pending} onClick={() => client.refresh()}>Refresh investigation</button>}
      {state.expired && <button disabled={!!state.pending} onClick={() => client.start()}>Start new investigation</button>}
    </div>}
  </div>;
}
