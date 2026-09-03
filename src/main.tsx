import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './coco-character.css';
import './signature-interactions.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
