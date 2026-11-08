import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { EmergenciaProvider } from './context/EmergenciaContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EmergenciaProvider>
          <App />
        </EmergenciaProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);