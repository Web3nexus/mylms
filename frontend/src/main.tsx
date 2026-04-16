import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { GlobalErrorBoundary } from './GlobalErrorBoundary.tsx'

console.log('[MyLMS] Booting frontend...');

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('[MyLMS] Root element found. Initializing React 19 root...');
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <BrowserRouter>
          <GlobalErrorBoundary>
            <App />
          </GlobalErrorBoundary>
        </BrowserRouter>
      </StrictMode>,
    );
    console.log('[MyLMS] Initial render dispatched successfully.');
  } catch (err) {
    console.error('[MyLMS] Fatal error during React initialization:', err);
    document.body.innerHTML = `<div style="padding: 2rem; background: #fff0f0; color: #a00; font-family: sans-serif;">
      <h1 style="margin: 0 0 1rem 0">Frontend Rendering Error</h1>
      <pre style="white-space: pre-wrap">${err}</pre>
    </div>`;
  }
} else {
  console.error('[MyLMS] CRITICAL: Root element (#root) not found in DOM.');
  document.body.innerHTML = '<h1 style="color: red; padding: 2rem;">CRITICAL ERROR: #root not found</h1>';
}
