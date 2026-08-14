import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // ផ្លាស់ប្តូរមក HashRouter
import App from './App.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <HashRouter> {/* ផ្លាស់ប្តូរមក HashRouter ទីនេះ */}
          <App />
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);