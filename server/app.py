import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","))

# ── Vocabulary fallback ──────────────────────────────────────────────────────
VOCAB_FILE = os.path.join(os.path.dirname(__file__), "data", "profanity_vocab.txt")

def _load_vocab() -> set:
    try:
        with open(VOCAB_FILE, "r") as f:
            return {line.strip().lower() for line in f if line.strip()}
    except FileNotFoundError:
        logger.warning("Profanity vocab file not found at %s — fallback disabled.", VOCAB_FILE)
        return set()

PROFANITY_VOCAB: set = _load_vocab()
logger.info("Loaded %d profanity terms into fallback vocab.", len(PROFANITY_VOCAB))


# ── AI classifier (Claude) ───────────────────────────────────────────────────
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
_anthropic_client = None

if ANTHROPIC_API_KEY:
    try:
        import anthropic
        _anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        logger.info("Anthropic client initialized — AI classification enabled.")
    except ImportError:
        logger.warning("anthropic package not installed. Falling back to vocab check.")
else:
    logger.info("ANTHROPIC_API_KEY not set — using vocab-based fallback classifier.")


def _classify_with_ai(text: str) -> dict:
    """Classify text using Claude. Returns {prof: bool, reason: str, method: 'ai'}."""
    message = _anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=128,
        system=(
            "You are a content moderation classifier. "
            "Your ONLY job is to determine if a piece of text contains profanity, "
            "hate speech, sexual content, graphic violence, or otherwise harmful language. "
            "Reply with a JSON object ONLY — no markdown, no explanation — in this exact shape:\n"
            '{"profane": true/false, "reason": "<one sentence>"}'
        ),
        messages=[{"role": "user", "content": text}],
    )
    import json
    raw = message.content[0].text.strip()
    result = json.loads(raw)
    return {"prof": bool(result.get("profane", False)), "reason": result.get("reason", ""), "method": "ai"}


def _classify_with_vocab(text: str) -> dict:
    """Classify text using the profanity word-list fallback."""
    if "*" in text:
        return {"prof": True, "reason": "Contains masked word (*).", "method": "vocab"}
    words = text.lower().split()
    for word in words:
        clean = word.strip(".,!?;:'\"")
        if clean in PROFANITY_VOCAB:
            return {"prof": True, "reason": f"Matched profanity term: '{clean}'.", "method": "vocab"}
    return {"prof": False, "reason": "No profanity detected.", "method": "vocab"}


def classify(text: str) -> dict:
    if _anthropic_client:
        try:
            return _classify_with_ai(text)
        except Exception as exc:
            logger.error("AI classification failed (%s) — falling back to vocab.", exc)
    return _classify_with_vocab(text)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "classifier": "ai" if _anthropic_client else "vocab",
    }), 200


@app.route("/add", methods=["POST"])
def classify_text():
    payload = request.get_json(silent=True)
    if not payload or "text" not in payload:
        return jsonify({"error": "Request body must include 'text' field."}), 400

    text: str = payload["text"].strip()
    if not text:
        return jsonify({"error": "'text' field must not be empty."}), 400

    logger.info("Classifying text (length=%d)", len(text))
    result = classify(text)
    logger.info("Result: prof=%s method=%s", result["prof"], result["method"])

    return jsonify({**result, "text": text}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    logger.info("Starting server on port %d (debug=%s)", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug)
