import os
import re

import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not GEMINI_API_KEY or not GEMINI_API_KEY.strip():
    raise RuntimeError("Gemini API key is missing in the environment.")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    MODEL_NAME,
    system_instruction=(
        "You are a friendly AI assistant for general Q&A chat. "
        "The user may ask in English or Telugu. "
        "Always reply ONLY in natural, conversational Telugu. "
        "Explain clearly in Telugu. "
        "If user asks to translate, then translate; otherwise answer normally. "
        "Don't mix English unless absolutely needed (like code or names). "
        "Avoid markdown formatting like **bold**, lists, headings as much as possible."
    ),
)


def clean_text(text: str) -> str:
    """Remove basic HTML and markdown formatting from model text."""
    if not text:
        return ""

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"<br\s*/?>", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = text.replace("**", "").replace("*", "")
    text = re.sub(r"^[\-+\u2022]\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*\d+\.\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*:\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = text.replace("```", "").replace("`", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


app = Flask(__name__)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})


@app.route("/api/chat", methods=["POST"])
def chat_api():
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json."}), 415

        data = request.get_json(silent=True) or {}
        user_prompt = (data.get("prompt") or "").strip()

        if not user_prompt:
            return jsonify({"error": "No prompt provided."}), 400

        if len(user_prompt) > 4000:
            return jsonify({"error": "Prompt is too long."}), 400

        response = model.generate_content(user_prompt)
        reply_text = getattr(response, "text", None)

        if not reply_text:
            try:
                reply_text = "".join(
                    part.text for part in response.candidates[0].content.parts
                )
            except Exception:
                reply_text = ""

        reply_text = (reply_text or "").strip()
        if not reply_text:
            return jsonify({"error": "Empty response from Gemini."}), 502

        return jsonify({"reply": clean_text(reply_text)})

    except Exception:
        app.logger.exception("Unhandled error in /api/chat")
        return jsonify({"error": "Internal server error."}), 500


@app.route("/", methods=["GET"])
def health():
    return "Gemini Telugu Chatbot API is running."


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    app.run(host="0.0.0.0", port=port, debug=debug)

