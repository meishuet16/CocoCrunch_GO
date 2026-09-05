import React from 'react';
import { createRoot } from 'react-dom/client';
import AppExperience from './AppExperience';
import ExploreReplicaV3 from './components/explore/ExploreReplicaV3';
import './styles.css';
import './coco-character.css';
import './signature-interactions.css';
import './luggage-interactions.css';
import './v2-polish.css';
import './gacha-interactions.css';
import './explore-redesign.css';
import './explore-content-semantics.css';
import './explore-replica-v3.css';
import './explore-replacement-guard.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppExperience />
    <ExploreReplicaV3 />
  </React.StrictMode>,
);
