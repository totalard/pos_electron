"""
User Activity Log model for tracking user sessions and actions
"""
from tortoise import fields
from .base import BaseModel


class ActivityType(str):
    """Activity type enum"""
    LOGIN = "login"
    LOGOUT = "logout"
    SALE = "sale"
    REFUND = "refund"
    PRODUCT_CREATE = "product_create"
    PRODUCT_UPDATE = "product_update"
    PRODUCT_DELETE = "product_delete"
    CUSTOMER_CREATE = "customer_create"
    CUSTOMER_UPDATE = "customer_update"
    CUSTOMER_DELETE = "customer_delete"
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    SETTINGS_UPDATE = "settings_update"
    INVENTORY_ADJUSTMENT = "inventory_adjustment"
    REPORT_GENERATED = "report_generated"
    BACKUP_CREATED = "backup_created"
    BACKUP_RESTORED = "backup_restored"


class UserActivityLog(BaseModel):
    """
    User Activity Log model for tracking user sessions and actions.
    
    Tracks all user activities including logins, sales, and administrative actions.
    """
    
    # User reference
    user = fields.ForeignKeyField(
        'models.User',
        related_name='activity_logs',
        on_delete=fields.CASCADE,
        description="User who performed this activity"
    )
    
    # Activity details
    activity_type = fields.CharField(
        max_length=50,
        description="Type of activity performed"
    )
    
    description = fields.TextField(
        null=True,
        description="Detailed description of the activity"
    )
    
    # Session information
    session_id = fields.CharField(
        max_length=100,
        null=True,
        description="Session identifier for grouping activities"
    )
    
    ip_address = fields.CharField(
        max_length=45,
        null=True,
        description="IP address of the user (IPv4 or IPv6)"
    )
    
    # Performance metrics
    duration_ms = fields.IntField(
        null=True,
        description="Duration of the activity in milliseconds"
    )
    
    # Additional data (JSON)
    metadata = fields.JSONField(
        null=True,
        description="Additional metadata about the activity (JSON)"
    )
    
    class Meta:
        table = "user_activity_logs"
        indexes = [
            ("user_id",),
            ("activity_type",),
            ("session_id",),
            ("created_at",),
        ]
        ordering = ["-created_at"]
    
    def __str__(self) -> str:
        return f"{self.user.full_name if self.user else 'Unknown'} - {self.activity_type} - {self.created_at}"

