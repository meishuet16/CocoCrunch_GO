import React from 'react';
import { createRoot } from 'react-dom/client';
import AppExperience from './AppExperience';
import ExploreReplicaV2 from './components/explore/ExploreReplicaV2';
import './styles.css';
import './coco-character.css';
import './signature-interactions.css';
import './luggage-interactions.css';
import './v2-polish.css';
import './gacha-interactions.css';
import './explore-redesign.css';
import './explore-content-semantics.css';
import './explore-replica-v2.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppExperience />
    <ExploreReplicaV2 />
  </React.StrictMode>,
);
