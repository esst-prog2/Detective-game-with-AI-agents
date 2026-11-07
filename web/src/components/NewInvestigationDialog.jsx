import { useEffect, useState } from 'react';
import { useInvestigation } from '../state/InvestigationProvider.jsx';
import ReadingDialog from './ReadingDialog.jsx';

export default function NewInvestigationDialog({ onClose }) {
  const { state, client } = useInvestigation();
  const [cases, setCases] = useState(null);
  const [selected, setSelected] = useState('ashcroft');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    setError(''); setCases(null);
    client.listCases().then((items) => {
      if (current) { setCases(items); setSelected(items.find((item) => item.id === 'ashcroft')?.id ?? items[0].id); }
    }).catch(() => { if (current) setError('Available cases could not be loaded. Your current investigation is unchanged.'); });
    return () => { current = false; };
  }, [client, attempt]);
  return <ReadingDialog title="Start a new investigation" onClose={onClose}>
    <p>Starting a case begins a new investigation with new notes. Your current investigation is unchanged until the new one opens.</p>
    {error && <p role="alert">{error}</p>}
    {!cases && error && <button onClick={() => setAttempt((value) => value + 1)}>Retry case list</button>}
    {cases && <><label htmlFor="new-case">New case</label><select id="new-case" value={selected} disabled={!!state.pending} onChange={(event) => setSelected(event.target.value)}>
      {cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
    </select><p>{cases.find((item) => item.id === selected)?.mode === 'preview' ? 'A limited preview with no final murder accusation or verdict.' : 'A full investigation with a final accusation.'}</p>
      <button className="primary" disabled={!!state.pending} onClick={async () => {
        setError('');
        if (await client.start(selected)) onClose();
        else setError('The new investigation could not be opened. Your current investigation and notes are retained. Please try again.');
      }}>Start selected case</button></>}
  </ReadingDialog>;
}
