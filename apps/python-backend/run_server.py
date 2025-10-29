#!/usr/bin/env python3
"""
Entry point for the POS backend server
This script is used by PyInstaller to create the standalone executable
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import src
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    application_path = Path(sys.executable).parent
    # Add the bundled src directory to the path
    src_path = application_path / '_internal' / 'src'
    if src_path.exists():
        sys.path.insert(0, str(src_path.parent))
else:
    # Running as script
    application_path = Path(__file__).parent
    sys.path.insert(0, str(application_path))

# Now we can import uvicorn and the app
import uvicorn
from src.main import app

if __name__ == "__main__":
    # Get host and port from command line arguments or use defaults
    import argparse
    
    parser = argparse.ArgumentParser(description='POS Backend Server')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    parser.add_argument('--reload', action='store_true', help='Enable auto-reload (development only)')
    
    args = parser.parse_args()
    
    # Configure uvicorn
    config = uvicorn.Config(
        app,
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info",
    )
    
    server = uvicorn.Server(config)
    server.run()

