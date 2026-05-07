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
