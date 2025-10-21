"""
Schema synchronization service.

Orchestrates automatic schema generation, validation, and synchronization.
"""
import asyncio
import logging
import difflib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


class SchemaSyncService:
    """
    Central service for schema synchronization.
    
    Handles:
    - Schema generation orchestration
    - Schema comparison and validation
    - Backup management
    - Conflict detection and resolution
    """
    
    def __init__(
        self,
        manual_schema_path: Optional[Path] = None,
        generated_schema_path: Optional[Path] = None,
        backup_enabled: bool = True,
        auto_merge: bool = False
    ):
        """
        Initialize schema sync service.
        
        Args:
            manual_schema_path: Path to manually maintained schemas
            generated_schema_path: Path for generated schemas
            backup_enabled: Whether to backup schemas before regeneration
            auto_merge: Whether to automatically merge custom schemas
        """
        self.manual_schema_path = manual_schema_path or (
            Path(__file__).parent.parent / "api" / "schemas.py"
        )
        self.generated_schema_path = generated_schema_path or (
            Path(__file__).parent.parent / "api" / "schemas_generated.py"
        )
        self.backup_enabled = backup_enabled
        self.auto_merge = auto_merge
        
        self._last_sync: Optional[datetime] = None
        self._sync_lock = asyncio.Lock()
        
    async def sync_schemas(
        self,
        force: bool = False,
        dry_run: bool = False
    ) -> Dict[str, any]:
        """
        Synchronize schemas from models.
        
        Args:
            force: Force regeneration even if no changes detected
            dry_run: Preview changes without writing files
            
        Returns:
            Dictionary with sync results
        """
        async with self._sync_lock:
            result = {
                'success': False,
                'timestamp': datetime.now().isoformat(),
                'changes_detected': False,
                'backup_created': False,
                'schemas_generated': False,
                'errors': [],
                'warnings': []
            }
            
            try:
                logger.info("Starting schema synchronization...")
                
                # Step 1: Backup existing schemas
                if self.backup_enabled and not dry_run:
                    backup_result = await self._backup_schemas()
                    result['backup_created'] = backup_result['success']
                    if not backup_result['success']:
                        result['warnings'].append(f"Backup failed: {backup_result.get('error')}")
                
                # Step 2: Generate new schemas
                logger.info("Generating schemas from models...")
                from src.utils.schema_generator import generate_schemas_from_models
                
                if dry_run:
                    logger.info("DRY RUN: Would generate schemas to %s", self.generated_schema_path)
                    result['schemas_generated'] = True
                else:
                    generated_path = await generate_schemas_from_models(self.generated_schema_path)
                    result['schemas_generated'] = True
                    result['generated_path'] = str(generated_path)
                    logger.info(f"Schemas generated successfully: {generated_path}")
                
                # Step 3: Compare with existing schemas
                if self.manual_schema_path.exists():
                    comparison = await self._compare_schemas()
                    result['comparison'] = comparison
                    result['changes_detected'] = comparison['has_differences']
                    
                    if comparison['has_differences']:
                        logger.info("Schema differences detected")
                        if comparison.get('conflicts'):
                            result['warnings'].append(
                                f"Found {len(comparison['conflicts'])} potential conflicts"
                            )
                else:
                    logger.info("No existing manual schemas to compare")
                
                # Step 4: Validate generated schemas
                validation_result = await self._validate_schemas()
                result['validation'] = validation_result
                
                if not validation_result['valid']:
                    result['errors'].extend(validation_result['errors'])
                    result['success'] = False
                    return result
                
                self._last_sync = datetime.now()
                result['success'] = True
                logger.info("Schema synchronization completed successfully")
                
            except Exception as e:
                logger.error(f"Schema synchronization failed: {e}", exc_info=True)
                result['errors'].append(str(e))
                result['success'] = False
                
            return result
    
    async def _backup_schemas(self) -> Dict[str, any]:
        """
        Create backup of existing schemas.
        
        Returns:
            Backup result dictionary
        """
        try:
            from src.utils.schema_backup import create_schema_backup
            
            backup_result = await create_schema_backup(
                self.manual_schema_path,
                self.generated_schema_path
            )
            
            return backup_result
            
        except Exception as e:
            logger.error(f"Failed to create schema backup: {e}")
            return {'success': False, 'error': str(e)}
    
    async def _compare_schemas(self) -> Dict[str, any]:
        """
        Compare manual and generated schemas.
        
        Returns:
            Comparison result dictionary
        """
        result = {
            'has_differences': False,
            'added_schemas': [],
            'removed_schemas': [],
            'modified_schemas': [],
            'conflicts': [],
            'diff': None
        }
        
        try:
            if not self.manual_schema_path.exists():
                result['has_differences'] = True
                return result
                
            if not self.generated_schema_path.exists():
                logger.warning("Generated schemas not found for comparison")
                return result
            
            # Read both files
            manual_content = self.manual_schema_path.read_text()
            generated_content = self.generated_schema_path.read_text()
            
            # Generate diff
            diff = list(difflib.unified_diff(
                manual_content.splitlines(keepends=True),
                generated_content.splitlines(keepends=True),
                fromfile='manual_schemas.py',
                tofile='generated_schemas.py',
                lineterm=''
            ))
            
            if diff:
                result['has_differences'] = True
                result['diff'] = ''.join(diff)
                
                # Analyze differences
                result.update(self._analyze_schema_diff(manual_content, generated_content))
            
        except Exception as e:
            logger.error(f"Schema comparison failed: {e}")
            result['error'] = str(e)
            
        return result
    
    def _analyze_schema_diff(
        self, 
        manual_content: str, 
        generated_content: str
    ) -> Dict[str, List[str]]:
        """
        Analyze differences between manual and generated schemas.
        
        Args:
            manual_content: Manual schema file content
            generated_content: Generated schema file content
            
        Returns:
            Dictionary with categorized differences
        """
        result = {
            'added_schemas': [],
            'removed_schemas': [],
            'modified_schemas': [],
            'conflicts': []
        }
        
        # Extract class definitions
        manual_classes = self._extract_class_names(manual_content)
        generated_classes = self._extract_class_names(generated_content)
        
        # Find added/removed schemas
        result['added_schemas'] = list(generated_classes - manual_classes)
        result['removed_schemas'] = list(manual_classes - generated_classes)
        
        # Find modified schemas
        common_classes = manual_classes & generated_classes
        for class_name in common_classes:
            manual_def = self._extract_class_definition(manual_content, class_name)
            generated_def = self._extract_class_definition(generated_content, class_name)
            
            if manual_def != generated_def:
                result['modified_schemas'].append(class_name)
                
                # Check for potential conflicts (custom validators, etc.)
                if '@field_validator' in manual_def or 'def ' in manual_def:
                    result['conflicts'].append({
                        'schema': class_name,
                        'reason': 'Contains custom validators or methods'
                    })
        
        return result
    
    def _extract_class_names(self, content: str) -> set:
        """
        Extract class names from Python file content.
        
        Args:
            content: Python file content
            
        Returns:
            Set of class names
        """
        import re
        pattern = r'^class\s+(\w+)\s*\('
        matches = re.finditer(pattern, content, re.MULTILINE)
        return {match.group(1) for match in matches}
    
    def _extract_class_definition(self, content: str, class_name: str) -> str:
        """
        Extract full class definition from content.
        
        Args:
            content: Python file content
            class_name: Name of class to extract
            
        Returns:
            Class definition as string
        """
        import re
        
        # Find class definition start
        pattern = rf'^class\s+{class_name}\s*\([^)]*\):'
        match = re.search(pattern, content, re.MULTILINE)
        
        if not match:
            return ""
            
        start_pos = match.start()
        lines = content[start_pos:].split('\n')
        
        # Extract class body (until next class or end)
        class_lines = [lines[0]]
        indent_level = None
        
        for line in lines[1:]:
            if not line.strip():
                class_lines.append(line)
                continue
                
            # Determine indent level from first non-empty line
            if indent_level is None and line.strip():
                indent_level = len(line) - len(line.lstrip())
                
            # Check if we've reached the end of the class
            if line.strip() and not line.startswith(' ' * indent_level):
                if line.startswith('class ') or line.startswith('def '):
                    break
                    
            class_lines.append(line)
        
        return '\n'.join(class_lines)
    
    async def _validate_schemas(self) -> Dict[str, any]:
        """
        Validate generated schemas.
        
        Returns:
            Validation result dictionary
        """
        result = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        try:
            if not self.generated_schema_path.exists():
                result['valid'] = False
                result['errors'].append("Generated schema file not found")
                return result
            
            # Try to import and validate syntax
            import ast
            content = self.generated_schema_path.read_text()
            
            try:
                ast.parse(content)
            except SyntaxError as e:
                result['valid'] = False
                result['errors'].append(f"Syntax error in generated schemas: {e}")
                return result
            
            # Additional validation could be added here
            # - Check for required base classes
            # - Validate field types
            # - Check for circular dependencies
            
            logger.info("Schema validation passed")
            
        except Exception as e:
            logger.error(f"Schema validation failed: {e}")
            result['valid'] = False
            result['errors'].append(str(e))
            
        return result
    
    async def get_sync_status(self) -> Dict[str, any]:
        """
        Get current synchronization status.
        
        Returns:
            Status dictionary
        """
        return {
            'last_sync': self._last_sync.isoformat() if self._last_sync else None,
            'manual_schema_exists': self.manual_schema_path.exists(),
            'generated_schema_exists': self.generated_schema_path.exists(),
            'manual_schema_path': str(self.manual_schema_path),
            'generated_schema_path': str(self.generated_schema_path),
            'backup_enabled': self.backup_enabled,
            'auto_merge': self.auto_merge
        }


# Global service instance
_sync_service: Optional[SchemaSyncService] = None


def get_sync_service() -> SchemaSyncService:
    """
    Get or create global schema sync service instance.
    
    Returns:
        SchemaSyncService instance
    """
    global _sync_service
    
    if _sync_service is None:
        _sync_service = SchemaSyncService()
        
    return _sync_service


async def sync_schemas_from_models(
    force: bool = False,
    dry_run: bool = False
) -> Dict[str, any]:
    """
    Convenience function to sync schemas.
    
    Args:
        force: Force regeneration
        dry_run: Preview changes only
        
    Returns:
        Sync result dictionary
    """
    service = get_sync_service()
    return await service.sync_schemas(force=force, dry_run=dry_run)
