export default function ConversationHistory({ records, suspect }) {
  return <><p className="history-note">Received testimony is an account, not a verified fact. Recent server turns can be recovered on refresh; older replies are kept only in this browser investigation.</p>{records.length ? <ol className="received-history">{records.map((record) => <li key={record.id}>
    <p className="question-history">You: {record.question}</p>
    {record.narration && <p className="performance-narration"><em>{record.narration}</em></p>}
    <p><strong>{record.kind === 'unsupported' ? 'Guidance (browser note)' : suspect.name}:</strong> {record.dialogue}</p>
  </li>)}</ol> : <p>No received replies yet.</p>}</>;
}
