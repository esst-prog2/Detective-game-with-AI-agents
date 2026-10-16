import React from 'react';
import { createRoot } from 'react-dom/client';
import { InvestigationProvider } from './state/InvestigationProvider.jsx';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/game.css';
import './styles/rooms.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><InvestigationProvider><App /></InvestigationProvider></React.StrictMode>);
