#!/bin/bash
# Development server startup script for Python backend

# Activate virtual environment
source venv/bin/activate

# Start uvicorn server with hot reload
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8001

