# Proxy Dockerfile for Hugging Face
FROM python:3.9

# Move everything into the container
WORKDIR /app
COPY . .

# Run from the backend directory
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Start the backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
