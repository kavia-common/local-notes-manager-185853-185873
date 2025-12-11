import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Re-export hooks and contexts for convenient imports across the app without altering App.js
export { useLocalStorage } from './hooks/useLocalStorage';
export { useNotes } from './hooks/useNotes';
export { useSettings } from './hooks/useSettings';
export { NotesProvider, useNotesContext } from './state/notesContext';
export { SettingsProvider, useSettingsContext } from './state/settingsContext';
export * as StorageUtils from './utils/storage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
