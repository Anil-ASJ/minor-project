# app.py
import os
import re  # 👈 NEW: for cleaning text
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# -----------------------------------
# 1. GEMINI API KEY CONFIG
# -----------------------------------

# ⚠️ Better to load this from environment in real projects
GEMINI_API_KEY = "REMOVED"

if not GEMINI_API_KEY or GEMINI_API_KEY.strip() == "":
    raise RuntimeError("Gemini API key is missing in app.py")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

try:
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
    print(f"[OK] Loaded Gemini model: {MODEL_NAME}")
except Exception as e:
    print("[FATAL] Could not create GenerativeModel:", repr(e))
    raise


# -----------------------------------
# 1.5 CLEAN TEXT FUNCTION
# -----------------------------------

def clean_text(text: str) -> str:
    """Remove <br/>, numbering, bullets, **, *, headings, etc. from model text."""
    if not text:
        return ""

    # Normalize newlines
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove <br>, <br/>, <br /> → just space
    text = re.sub(r"<br\s*/?>", " ", text)

    # Remove any other HTML tags like <p>, <b>, etc.
    text = re.sub(r"<[^>]+>", " ", text)

    # Remove markdown bold/italic pairs first (**text**, *text*)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)

    # Remove any leftover ** or *
    text = text.replace("**", "").replace("*", "")

    # Remove bullets (-, +, •) at the start of a line
    text = re.sub(r"^[\-\+\•]\s*", "", text, flags=re.MULTILINE)

    # Remove numbered list markers like "1. ", "2. ", etc. at line start
    text = re.sub(r"^\s*\d+\.\s*", "", text, flags=re.MULTILINE)

    # Remove ':' if it appears at start of a line
    text = re.sub(r"^\s*:\s*", "", text, flags=re.MULTILINE)

    # Remove markdown headings (#, ##, ### at start of line)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)

    # Remove backticks used for code
    text = text.replace("```", "").replace("`", "")

    # Collapse multiple spaces/newlines into single spaces
    text = re.sub(r"\s+", " ", text)

    # Final trim
    return text.strip()


# -----------------------------------
# 2. FLASK APP SETUP
# -----------------------------------

app = Flask(__name__)
CORS(app)  # allow calls from React app (localhost)


@app.route("/api/chat", methods=["POST"])
def chat_api():
    """
    Request JSON:
        { "prompt": "your message here" }

    Response JSON:
        { "reply": "Gemini answer in Telugu (clean)" } or { "error": "..." }
    """
    try:
        data = request.get_json(force=True) or {}
        user_prompt = (data.get("prompt") or "").strip()

        print("[REQUEST] /api/chat prompt:", repr(user_prompt))

        if not user_prompt:
            return jsonify({"error": "No prompt provided."}), 400

        # Call Gemini
        response = model.generate_content(user_prompt)
        print("[RAW RESPONSE]", response)

        # Try to safely get the text
        reply_text = getattr(response, "text", None)
        if not reply_text:
            try:
                reply_text = "".join(
                    part.text for part in response.candidates[0].content.parts
                )
            except Exception as inner_e:
                print("[ERROR] Fallback assembling text failed:", repr(inner_e))
                reply_text = ""

        reply_text = (reply_text or "").strip()
        print("[REPLY TEXT RAW]", repr(reply_text))

        if not reply_text:
            return jsonify({"error": "Empty response from Gemini."}), 500

        # 🔥 CLEAN THE TEXT HERE
        cleaned_reply = clean_text(reply_text)
        print("[REPLY TEXT CLEANED]", repr(cleaned_reply))

        return jsonify({"reply": cleaned_reply})

    except Exception as e:
        print("[ERROR] in /api/chat:", repr(e))
        return jsonify({"error": f"Internal server error: {e}"}), 500


@app.route("/", methods=["GET"])
def health():
    return "Gemini Telugu Chatbot API is running."


if __name__ == "__main__":
    print("[INFO] Starting Flask server on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
