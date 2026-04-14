// src/config/Gemini.js

const BACKEND_URL = "http://localhost:5000/api/chat";

const runChat = async (prompt) => {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    console.log("Backend raw response:", data);

    // If backend replied normally
    if (res.ok && data.reply) {
      return data.reply; // just the text from Gemini
    }

    // If backend sent an error field
    if (data.error) {
      return `Error from server: ${data.error}`;
    }

    // Fallback in case of weird shape
    return "Unexpected server response.";
  } catch (err) {
    console.error("Network/server error in runChat:", err);
    return `Network error: ${String(err.message || err)}`;
  }
};

export default runChat;
