# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for building the POS Python backend server
This creates a standalone executable that includes all dependencies
"""

import sys
from pathlib import Path

# Get the project root directory
project_root = Path(SPECPATH)

# Define paths
src_path = project_root / 'src'
data_path = project_root / 'data'
uploads_path = project_root / 'uploads'

# Collect package metadata
from PyInstaller.utils.hooks import copy_metadata

# Helper function to safely copy metadata
def safe_copy_metadata(package_name):
    try:
        return copy_metadata(package_name)
    except Exception:
        print(f"Warning: Could not copy metadata for {package_name}")
        return []

# Collect all Python files from src directory
a = Analysis(
    ['run_server.py'],
    pathex=[str(project_root)],
    binaries=[],
    datas=[
        # Include all source files as data (for runtime imports)
        (str(src_path), 'src'),
        # Include data directory (database will be created here)
        (str(data_path), 'data'),
        # Include uploads directory
        (str(uploads_path), 'uploads'),
    ] + safe_copy_metadata('tortoise-orm') + safe_copy_metadata('fastapi') + safe_copy_metadata('uvicorn') + safe_copy_metadata('pydantic'),
    hiddenimports=[
        # FastAPI and dependencies
        'fastapi',
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'starlette',
        'starlette.applications',
        'starlette.middleware',
        'starlette.middleware.cors',
        'starlette.routing',
        'pydantic',
        'pydantic_core',
        'pydantic_settings',
        
        # Tortoise ORM
        'tortoise',
        'tortoise.backends',
        'tortoise.backends.sqlite',
        'tortoise.models',
        'tortoise.fields',
        'tortoise.transactions',
        'tortoise.exceptions',
        'aerich',
        'aiosqlite',
        'pypika_tortoise',
        
        # All database models
        'src.database',
        'src.database.models',
        'src.database.models.user',
        'src.database.models.customer',
        'src.database.models.product',
        'src.database.models.tax_rule',
        'src.database.models.discount',
        'src.database.models.pos_session',
        'src.database.models.user_activity',
        'src.database.models.account',
        'src.database.models.journal_entry',
        'src.database.models.fiscal_year',
        'src.database.models.purchase',
        
        # API modules
        'src.api',
        'src.api.auth',
        'src.api.customers',
        'src.api.products',
        'src.api.product_management',
        'src.api.settings',
        'src.api.tax_rules',
        'src.api.demo',
        'src.api.transactions',
        'src.api.discounts',
        'src.api.pos_sessions',
        'src.api.dashboard',
        'src.api.accounting',
        'src.api.user_activity',
        'src.api.purchases',
        'src.api.jsonrpc',
        
        # Services
        'src.services',
        
        # Utils
        'src.utils',
        
        # Other dependencies
        'multipart',
        'python_multipart',
        'watchdog',
        'watchfiles',
        'httptools',
        'uvloop',
        'websockets',
        'yaml',
        'dotenv',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude development tools
        'pytest',
        'pytest_asyncio',
        'black',
        'pylint',
        'mypy',
        'isort',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='pos-server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Keep console for logging
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='pos-server',
)

