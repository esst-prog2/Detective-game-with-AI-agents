import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { createInvestigationClient } from '../api/investigation-client.js';
import { initialState, investigationReducer } from './investigation-state.js';

const Context = createContext(null);
export function InvestigationProvider({ children }) {
  const [state, dispatch] = useReducer(investigationReducer, initialState);
  const [client] = useState(() => createInvestigationClient({ emit: dispatch }));
  useEffect(() => () => client.dispose(), [client]);
  const canAct = !!state.snapshot && !state.pending && !state.expired && !state.uncertain && !state.endedKnown;
  return <Context.Provider value={{ state, dispatch, client, canAct }}>{children}</Context.Provider>;
}
export const useInvestigation = () => useContext(Context);
