import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletProvider } from './context/WalletContext';
import { AdminApp } from './AdminApp';
import './index.css';

const rootElement = document.getElementById('admin-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <WalletProvider>
        <AdminApp />
      </WalletProvider>
    </React.StrictMode>
  );
}
