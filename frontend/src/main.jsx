import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { InvestigationProvider } from './context/InvestigationContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <InvestigationProvider>
        <App />
      </InvestigationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
