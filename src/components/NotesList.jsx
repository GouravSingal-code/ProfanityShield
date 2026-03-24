import React from 'react';

export function NotesList({ notes, onClear }) {
  if (notes.length === 0) {
    return (
      <div className="card notes-card">
        <h2 className="card-title">Analysis History</h2>
        <p className="empty-state">No notes yet. Record and analyze speech to see results here.</p>
      </div>
    );
  }

  return (
    <div className="card notes-card">
      <div className="notes-header">
        <h2 className="card-title">Analysis History</h2>
        <button className="btn btn-outline btn-sm" onClick={onClear}>
          Clear All
        </button>
      </div>
      <ul className="notes-list">
        {notes.map((note, idx) => (
          <li key={idx} className={`note-item ${note.isProfane ? 'note-flagged' : 'note-clean'}`}>
            <div className="note-badge">
              {note.isProfane ? (
                <span className="badge badge-danger">Flagged</span>
              ) : (
                <span className="badge badge-success">Clean</span>
              )}
              <span className="badge badge-method">
                {note.method === 'ai' ? '🤖 AI' : '📋 Vocab'}
              </span>
            </div>
            <p className="note-text">{note.text}</p>
            {note.reason && <p className="note-reason">{note.reason}</p>}
            <span className="note-time">{note.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
