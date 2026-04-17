# Use a slim Python 3.12 image for a smaller footprint
FROM python:3.12-slim

# Install system dependencies required for LightGBM and PyArrow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
# We need the backend code AND the processed data and model
COPY backend/ ./backend/
COPY app/ ./app/
COPY data/processed/ ./data/processed/

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose the port provided by the hosting platform
# Uvicorn will bind to 0.0.0.0 to be accessible externally
CMD ["sh", "-c", "uvicorn backend.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
