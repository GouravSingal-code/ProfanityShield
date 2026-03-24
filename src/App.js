import React, { useState, useCallback } from 'react';
import { VoiceRecorder } from './components/VoiceRecorder';
import { NotesList } from './components/NotesList';
import { classifyText } from './services/api';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleSave = useCallback(async (text) => {
    if (!text) return;
    setIsSaving(true);
    setApiError(null);
    try {
      const result = await classifyText(text);
      setNotes((prev) => [
        {
          text,
          isProfane: result.prof,
          reason: result.reason || '',
          method: result.method || 'vocab',
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleClear = useCallback(() => setNotes([]), []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">The Whack Hack</h1>
          <p className="app-subtitle">Real-time Speech Profanity Detection</p>
        </div>
      </header>

      <main className="app-main">
        {apiError && (
          <div className="alert alert-error global-error">
            Backend error: {apiError}. Make sure the server is running.
          </div>
        )}
        <div className="grid">
          <VoiceRecorder onSave={handleSave} isSaving={isSaving} />
          <NotesList notes={notes} onClear={handleClear} />
        </div>
      </main>

      <footer className="app-footer">
        <p>Smart India Hackathon &mdash; Profanity Detection System</p>
      </footer>
    </div>
  );
}

export default App;
