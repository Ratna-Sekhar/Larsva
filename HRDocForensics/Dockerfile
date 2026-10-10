# ── Build stage ──
FROM python:3.14-slim AS builder

WORKDIR /app

# System deps for PyMuPDF and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --target=/deps -r requirements.txt

# ── Runtime stage ──
FROM python:3.14-slim

WORKDIR /app

# Runtime deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages
COPY --from=builder /deps /usr/local/lib/python3.14/site-packages

# Copy application
COPY app/ app/
COPY config/ config/
COPY prompts/ prompts/

# Don't run as root
RUN useradd -m -r appuser
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/hrdocforensics/health')"

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
