# Backend Documentation

Welcome to the POS Backend documentation.

## Documentation Index

### Schema Synchronization

The automatic schema synchronization system eliminates manual Pydantic schema maintenance.

- **[Quick Start Guide](QUICK_START_SCHEMA_SYNC.md)** - Get started in 5 minutes
- **[Full Documentation](SCHEMA_SYNC.md)** - Comprehensive guide to all features
- **[Implementation Summary](../IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[Completion Report](../COMPLETION_REPORT.md)** - Project completion summary
- **[Checklist](../SCHEMA_SYNC_CHECKLIST.md)** - Verification checklist

### Other Documentation

- **[Settings Migration](SETTINGS_MIGRATION.md)** - Settings system migration guide
- **[Settings Refactoring](SETTINGS_REFACTORING_SUMMARY.md)** - Settings refactoring summary

## Quick Links

### Getting Started
1. [Install dependencies](../README.md#install-dependencies)
2. [Run development server](../README.md#run-development-server)
3. [Test schema sync](QUICK_START_SCHEMA_SYNC.md)

### Common Tasks

#### Schema Synchronization
```bash
# Automatic (on server start)
python -m uvicorn src.main:app --reload

# Manual sync
python -m src.cli.schema_sync_cli sync

# Check status
python -m src.cli.schema_sync_cli status
```

#### Testing
```bash
# Run schema sync tests
python test_schema_sync.py

# Run all tests
python -m pytest
```

#### Configuration
```bash
# Copy example config
cp .env.schema_sync.example .env

# Edit configuration
nano .env
```

## Documentation Structure

```
docs/
├── README.md                        # This file
├── SCHEMA_SYNC.md                   # Full schema sync documentation
├── QUICK_START_SCHEMA_SYNC.md       # Quick start guide
├── SETTINGS_MIGRATION.md            # Settings migration guide
└── SETTINGS_REFACTORING_SUMMARY.md  # Settings refactoring summary
```

## Key Features

### Automatic Schema Synchronization
- ✅ Auto-generates Pydantic schemas from Tortoise ORM models
- ✅ Watches model files for changes (development mode)
- ✅ Validates generated schemas
- ✅ Creates automatic backups
- ✅ CLI commands for manual control

### Benefits
- **Zero Maintenance**: Schemas auto-update with models
- **Always in Sync**: No schema/model drift
- **Type Safety**: Full Pydantic validation
- **Production Ready**: Configurable for all environments

## Support

### Documentation
- Read the [Quick Start Guide](QUICK_START_SCHEMA_SYNC.md)
- Check the [Full Documentation](SCHEMA_SYNC.md)
- Review [Implementation Details](../IMPLEMENTATION_SUMMARY.md)

### Commands
```bash
# Get help
python -m src.cli.schema_sync_cli --help

# Check status
python -m src.cli.schema_sync_cli status

# Run tests
python test_schema_sync.py
```

### Troubleshooting
See the troubleshooting section in [SCHEMA_SYNC.md](SCHEMA_SYNC.md#troubleshooting)

## Contributing

When adding new features:
1. Update relevant documentation
2. Add tests
3. Update this index
4. Follow existing patterns

## Version History

- **v1.0.0** (2025-01-21) - Initial implementation of automatic schema synchronization

---

**Last Updated**: January 21, 2025
