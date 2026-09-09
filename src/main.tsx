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
import './me-redesign.css';

window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error || e.message);
  let el = document.getElementById('debug-error-box');
  if (!el) {
    el = document.createElement('div');
    el.id = 'debug-error-box';
    el.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;z-index:999999;background:#fee2e2;color:#991b1b;padding:16px;border:2px solid #ef4444;border-radius:8px;font-family:monospace;white-space:pre-wrap;font-size:13px;max-height:80vh;overflow:auto;box-shadow:0 10px 25px rgba(0,0,0,0.2);';
    document.body.appendChild(el);
  }
  el.textContent = `[JS Error] ${e.message}\nAt: ${e.filename}:${e.lineno}:${e.colno}\n\nStack:\n${e.error?.stack || ''}`;
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Rejection]', e.reason);
  let el = document.getElementById('debug-error-box');
  if (!el) {
    el = document.createElement('div');
    el.id = 'debug-error-box';
    el.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;z-index:999999;background:#fee2e2;color:#991b1b;padding:16px;border:2px solid #ef4444;border-radius:8px;font-family:monospace;white-space:pre-wrap;font-size:13px;max-height:80vh;overflow:auto;box-shadow:0 10px 25px rgba(0,0,0,0.2);';
    document.body.appendChild(el);
  }
  el.textContent = `[Unhandled Promise Rejection]\nReason: ${e.reason?.message || String(e.reason)}\n\nStack:\n${e.reason?.stack || ''}`;
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('React ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ padding: 24, margin: 20, background: '#fee2e2', color: '#991b1b', borderRadius: 8, border: '2px solid #ef4444', fontFamily: 'monospace' }}>
          <h3 style={{ margin: '0 0 10px' }}>⚠️ React Render Error</h3>
          <p style={{ fontWeight: 'bold', fontSize: 16 }}>{err.message}</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.85, background: '#fff', padding: 12, borderRadius: 6 }}>{err.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppExperience />
    </ErrorBoundary>
  </React.StrictMode>,
);

