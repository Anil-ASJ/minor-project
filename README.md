# Gemini Clone

This project is a React + Flask chatbot UI backed by the Google Gemini API.

## Setup

1. Clone the repository.
2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Install backend dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root:

   ```env
   GEMINI_API_KEY=your_google_api_key_here
   PORT=5000
   FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
   ```

5. Start the Flask backend:

   ```bash
   python app.py
   ```

6. Start the frontend:

   ```bash
   npm run dev
   ```

## Security Notes

- Never commit a real API key to source control.
- Keep `.env` local only.
- Rotate any key that was previously pushed to GitHub.
