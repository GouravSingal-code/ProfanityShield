# The Whack Hack — Real-time Speech Profanity Detection

> Smart India Hackathon (SIH) project

Demo videos: [Full Demo](https://www.youtube.com/watch?v=JHCqNi5qny4) | [Prototype Demo](https://www.youtube.com/watch?v=aBmWrpe7-50)

## Problem Statement

Detect profanity and foul language in real-time speech. The system:
1. Captures audio via the browser microphone
2. Converts speech to text using the Web Speech Recognition API
3. Sends the transcript to a Flask backend
4. Classifies the text against an NLP profanity vocabulary list
5. Returns and displays a **Flagged / Clean** result

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Web Speech API                      |
| Backend    | Flask 3, Gunicorn                             |
| AI Engine  | Claude Haiku (Anthropic API) + vocab fallback |
| Packaging  | Docker + docker-compose                       |

---

## Getting Started

### Local Development (without Docker)

#### 1. Backend

```bash
cd server
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # Edit as needed
python app.py
```

Server runs at `http://localhost:5000`.

#### 2. Frontend

```bash
# From project root
cp .env.example .env              # Set REACT_APP_API_URL if needed
npm install
npm start
```

App runs at `http://localhost:3000`.

---

### Production (Docker)

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend health check: `http://localhost:5000/health`

---

## AI Classification

The backend uses **Claude Haiku** (`claude-haiku-4-5-20251001`) for LLM-powered content moderation when `ANTHROPIC_API_KEY` is set. The model returns a structured JSON verdict (`profane: true/false` + a one-sentence reason).

If the API key is not configured (e.g. local dev without a key), the system **automatically falls back** to the 1700-term profanity vocabulary list — so the app works in both modes.

The frontend shows a **🤖 AI** or **📋 Vocab** badge on each result so you always know which classifier ran.

---

## API Reference

| Method | Endpoint  | Body                  | Response                                                      |
|--------|-----------|-----------------------|---------------------------------------------------------------|
| GET    | `/health` | —                     | `{"status": "ok", "classifier": "ai"/"vocab"}`               |
| POST   | `/add`    | `{"text": "string"}`  | `{"prof": bool, "reason": "...", "method": "ai"/"vocab", "text": "…"}` |

---

## Project Structure

```
sih_project/
├── src/
│   ├── components/
│   │   ├── VoiceRecorder.jsx
│   │   └── NotesList.jsx
│   ├── hooks/
│   │   └── useSpeechRecognition.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── App.css
├── server/
│   ├── app.py               # Flask application
│   ├── requirements.txt
│   ├── data/
│   │   └── profanity_vocab.txt
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Notes

- Speech Recognition requires **Google Chrome** (or a Chromium-based browser).
- The profanity vocab list contains ~1700 terms sourced from common open datasets.
