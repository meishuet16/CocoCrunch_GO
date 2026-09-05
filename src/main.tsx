import React from 'react';
import { createRoot } from 'react-dom/client';
import AppExperience from './AppExperience';
import './styles.css';
import './coco-character.css';
import './signature-interactions.css';
import './luggage-interactions.css';
import './v2-polish.css';
import './gacha-interactions.css';
import './explore-redesign.css';
import './explore-content-semantics.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppExperience />
  </React.StrictMode>,
);
