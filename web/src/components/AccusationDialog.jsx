import { useEffect, useRef, useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import Portrait from './Portrait.jsx';
export default function AccusationDialog({ initialId, onClose }) {
  const { state, client, canAct } = useInvestigation();
  const [id, setId] = useState(initialId ?? state.snapshot.suspects[0]?.id);
  const dialog = useRef(null);
  const cancel = useRef(null);
  const suspect = state.snapshot.suspects.find((suspect) => suspect.id === id);
  useEffect(() => {
    dialog.current.showModal();
    cancel.current.focus();
    return () => { dialog.current?.close(); };
  }, []);
  useEffect(() => { if (state.endedKnown || state.expired) onClose(); }, [state.endedKnown, state.expired, onClose]);
  async function decide(confirmed) { if (canAct && await client.accuse(id, confirmed)) onClose(); }
  function trapFocus(event) {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('select:not(:disabled),button:not(:disabled)')];
    const first = controls[0]; const last = controls.at(-1);
    if (!first) { event.preventDefault(); dialog.current.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <dialog ref={dialog} tabIndex="-1" className="accusation-dialog" aria-labelledby="accusation-title" onKeyDown={trapFocus} onCancel={(event) => { event.preventDefault(); void decide(false); }}>
    <div className="dialog-seal" aria-hidden="true">◆</div><p className="eyebrow">THE FINAL ACCUSATION</p><h2 id="accusation-title">Name your suspect.</h2><p>Confirming ends this investigation. Be certain you are ready to close the case.</p>
    <label htmlFor="accused">Selected suspect</label><select id="accused" value={id} disabled={!canAct} onChange={(event) => setId(event.target.value)}>{state.snapshot.suspects.map((suspect) => <option key={suspect.id} value={suspect.id}>{suspect.name}</option>)}</select>
    {suspect && <div className="accused-preview"><Portrait suspect={suspect} /><span>{suspect.name}<small>Suspect</small></span></div>}
    {state.pending && <p role="status">{state.pending.label}</p>}{state.error && <div role="alert"><p>{state.error.message}</p><button disabled={!!state.pending} onClick={() => client.refresh()}>Refresh investigation</button></div>}
    <div className="dialog-actions"><button ref={cancel} disabled={!canAct} onClick={() => decide(false)}>Cancel accusation</button><button className="danger" disabled={!canAct} onClick={() => decide(true)}>Confirm accusation</button></div>
  </dialog>;
}
