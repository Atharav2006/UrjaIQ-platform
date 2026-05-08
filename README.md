# UrjaIQ ⚡

UrjaIQ is an AI-powered platform that helps users analyze, predict, and optimize electricity consumption.

## Prerequisites

- Node.js (v20+ recommended)
- Python 3.8+

## Running the Backend

The backend is built with Python and FastAPI.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

The backend API will be available at `http://localhost:8000`.

## Running the Frontend

The frontend is built with React and Vite.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be accessible typically at `http://localhost:5173`. Open this URL in your browser, enter data into the form, and click calculate to see the connection between frontend and backend.

## Deployment Guide

### 1. Database (Supabase)
The project is configured to use **Supabase** for a forever-free PostgreSQL database.
- Database project is already created.
- Schema has been applied.
- Connection string: `postgresql://postgres:[YOUR_PASSWORD]@db.xsryfqymwmwxtgtzqylt.supabase.co:5432/postgres`

### 2. Backend (Hugging Face Spaces)
The most reliable **no-credit-card** way to host the backend is using a **Hugging Face Docker Space**.
- Create a new Space → Select **Docker** → **Blank**.
- Add the following **Secrets** in Space Settings:
  - `DATABASE_URL`: `postgresql://postgres:YOUR_PASSWORD@db.yfmiljrqsltuusgiujbo.supabase.co:5432/postgres`
  - `GROQ_API_KEY`: (Your Groq API key)
  - `GEMINI_API_KEY`: (Your Gemini API key)
  - `SECRET_KEY`: (Your random string)
- **Always-On Trick**: We've added a GitHub Action in `.github/workflows/keep_alive.yml` that pings your Space URL every 5 minutes to prevent it from sleeping.

### 3. Frontend (Netlify)
Update `VITE_API_URL` in Netlify to: `https://[username]-[space-name].hf.space` (e.g., `https://atharav-urjaiq-api.hf.space`).
