import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function VoiceRecorder({ onSave, isSaving }) {
  const { transcript, isListening, error, startListening, stopListening } =
    useSpeechRecognition();

  const handleToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <div className="card recorder-card">
      <h2 className="card-title">Voice Input</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="mic-status">
        <span className={`mic-indicator ${isListening ? 'active' : ''}`} />
        <span className="mic-label">{isListening ? 'Listening...' : 'Microphone off'}</span>
      </div>

      <div className="transcript-box">
        {transcript || <span className="placeholder">Start speaking to see transcription here...</span>}
      </div>

      <div className="recorder-actions">
        <button
          className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleToggle}
          disabled={!!error}
        >
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>

        <button
          className="btn btn-success"
          onClick={() => onSave(transcript)}
          disabled={!transcript || isSaving}
        >
          {isSaving ? 'Analyzing...' : 'Analyze & Save'}
        </button>
      </div>
    </div>
  );
}
