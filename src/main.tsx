import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent browser extension errors (e.g. MetaMask, Web3 injected scripts) from cluttering logs or crashing
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason || '');
  if (
    msg.toLowerCase().includes('metamask') ||
    msg.toLowerCase().includes('ethereum') ||
    msg.toLowerCase().includes('web3')
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.toLowerCase().includes('metamask') ||
    msg.toLowerCase().includes('ethereum') ||
    msg.toLowerCase().includes('web3')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

