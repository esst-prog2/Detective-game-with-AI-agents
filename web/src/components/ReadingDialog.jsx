import { useEffect, useRef } from 'react';
export default function ReadingDialog({ title, children, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const trigger = document.activeElement; const node = dialog.current;
    node.showModal(); node.querySelector('button').focus();
    return () => { node.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  function keyboard(event) {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('button:not(:disabled),a[href],input,select,summary')];
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <dialog ref={dialog} className="reading-dialog" aria-labelledby="reading-title" onKeyDown={keyboard} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header><h2 id="reading-title">{title}</h2><button onClick={onClose}>Close</button></header>{children}
  </dialog>;
}
