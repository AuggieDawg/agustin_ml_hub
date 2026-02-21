# services/ml/Dockerfile
#
# Minimal, reproducible ML service container.
# - We keep this separate from the Next.js runtime to avoid mixing concerns.
# - "Compute plane" runs here; Next.js stays the control plane.

FROM python:3.12-slim

# Prevent Python from writing pyc files and enable unbuffered logs.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies (minimal). If later you need scipy/sklearn heavy builds,
# we may add build-essential here, but keep it lean for now.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (better layer caching).
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the FastAPI app.
COPY app /app/app

EXPOSE 8000

# Run Uvicorn.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
