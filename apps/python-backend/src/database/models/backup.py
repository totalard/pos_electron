"""
Backup history model for tracking backups and restores.
"""

from tortoise import fields
from tortoise.models import Model


class BackupHistory(Model):
    """Track backup and restore operations"""
    
    id = fields.IntField(pk=True)
    
    # Backup file information
    filename = fields.CharField(max_length=255)
    file_path = fields.CharField(max_length=1024)
    file_size_bytes = fields.BigIntField()
    file_size_mb = fields.FloatField()
    
    # Database information at time of backup
    database_size_bytes = fields.BigIntField()
    database_size_mb = fields.FloatField()
    
    # Backup metadata
    checksum = fields.CharField(max_length=64)
    backup_type = fields.CharField(
        max_length=20,
        default='full'  # full, incremental, selective
    )
    
    # Backup features
    compression_enabled = fields.BooleanField(default=True)
    encryption_enabled = fields.BooleanField(default=False)
    selected_tables = fields.TextField(null=True)  # JSON array of table names
    
    # Status
    status = fields.CharField(
        max_length=20,
        default='success'  # success, partial, failed
    )
    error_message = fields.TextField(null=True)
    
    # Operation tracking
    operation_type = fields.CharField(
        max_length=20,
        default='backup'  # backup, restore
    )
    
    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "backup_history"
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"BackupHistory({self.filename} - {self.operation_type})"


class BackupSchedule(Model):
    """Backup scheduling configuration"""
    
    id = fields.IntField(pk=True)
    
    # Schedule configuration
    enabled = fields.BooleanField(default=False)
    schedule_type = fields.CharField(
        max_length=20,
        default='interval'  # interval, daily, weekly, monthly
    )
    
    # Interval-based scheduling
    interval_hours = fields.IntField(default=24)
    
    # Time-based scheduling
    scheduled_time = fields.CharField(max_length=8, null=True)  # HH:MM format
    scheduled_days = fields.TextField(null=True)  # JSON array: ["mon", "tue", ...]
    
    # Backup settings
    backup_type = fields.CharField(max_length=20, default='full')
    compression_enabled = fields.BooleanField(default=True)
    encryption_enabled = fields.BooleanField(default=False)
    
    # Retention policy
    retention_days = fields.IntField(default=30)
    max_backup_count = fields.IntField(default=10)
    
    # Notification
    notify_on_success = fields.BooleanField(default=False)
    notify_on_failure = fields.BooleanField(default=True)
    
    # Last execution
    last_backup_at = fields.DatetimeField(null=True)
    last_backup_status = fields.CharField(
        max_length=20,
        null=True  # success, failed, partial
    )
    
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "backup_schedule"
    
    def __str__(self):
        return f"BackupSchedule({self.schedule_type} - {'Enabled' if self.enabled else 'Disabled'})"