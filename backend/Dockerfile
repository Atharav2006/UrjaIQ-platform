FROM python:3.10-slim

WORKDIR /app

# Install system dependencies: Tesseract OCR + PostgreSQL client libs
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000


# Start FastAPI
# Use Railway's dynamic PORT env var (falls back to 8000 for local dev)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
