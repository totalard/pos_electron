# POS Python Backend

FastAPI-based backend service for the POS application.

## Setup

### Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

## Development

### Run Development Server

```bash
# From the monorepo root
pnpm --filter python-backend dev

# Or directly
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8001
```

The API will be available at:
- API: http://localhost:8001
- Interactive docs: http://localhost:8001/docs
- Alternative docs: http://localhost:8001/redoc

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

## Project Structure

```
python-backend/
├── src/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry point
│   ├── config.py        # Configuration settings
│   └── api/             # API routes
│       ├── __init__.py
│       └── products.py  # Products endpoints
├── requirements.txt     # Python dependencies
└── README.md
```

## Code Quality

### Linting

```bash
python -m pylint src/
```

### Type Checking

```bash
python -m mypy src/
```

### Formatting

```bash
python -m black src/
```

### Testing

```bash
python -m pytest
```

