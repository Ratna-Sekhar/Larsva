# HRDocForensics

HRDocForensics is an internal tool to analyze HR documents (such as offer letters) for signs of tampering, fakeness, or modifications using a combination of metadata heuristics and an LLM verification pipeline. It also includes counter-offer generation based on extracted details and internal compensation guardrails.

## Features

- **Metadata extraction**: Reads hidden metadata, embedded fonts, and structural flags from PDF documents.
- **Signal generation**: Heuristic checks for text layer anomalies, date mismatches, and known PDF editor producers.
- **LLM pipeline**: Feeds the metadata, signals, and page visuals into OpenAI GPT-4 Vision models for a final authenticity score.
- **Counter-offer module**: Processes extracted offer details against internal equity data (budget ceilings, bands) to suggest a retention counter-offer.

## Tech Stack

- **Backend**: Python 3.11+, FastAPI
- **Dependencies**: PyMuPDF (fitz), pdfplumber, Pillow, OpenAI SDK

## Setup Guide

### 1. Local Development

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`.
   - Update the `.env` file with your actual `OPENAI_API_KEY`.

4. **Run the FastAPI server:**
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Run tests:**
   ```bash
   pytest tests/
   ```

### 2. Docker Deployment

If you prefer to run the service using Docker:

1. Ensure Docker and Docker Compose are installed.
2. Build and start the container:
   ```bash
   docker-compose up --build -d
   ```
3. The API will be available at `http://localhost:8000`.

## API Endpoints

- `GET /api/hrdocforensics/health`: Health check endpoint.
- `POST /api/hrdocforensics/analyze`: Main endpoint for document analysis. Requires a `file` (PDF) and optional `context` or `counter_offer_inputs` form fields.
- `POST /api/hrdocforensics/compare-hash`: Compares two PDF files to check if they are identical byte-for-byte.

## Integration with Next.js Frontend

The frontend for HRDocForensics lives in the main Next.js repository at `/products/HRDocForensics`. API calls made by the frontend to `/api/hrdocforensics/*` are proxied to this FastAPI service via Next.js rewrites.
