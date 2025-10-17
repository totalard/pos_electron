"""
User model for multi-user authentication
"""
from enum import Enum
from tortoise import fields
from .base import BaseModel


class UserRole(str, Enum):
    """User role enumeration"""
    ADMIN = "admin"  # Admin user with full permissions
    USER = "user"    # Regular user with limited permissions


class User(BaseModel):
    """
    User model for PIN-based authentication.
    
    The primary user is created on first app launch and has permissions
    to create and manage other users. Staff users have limited permissions.
    """
    
    # User information
    full_name = fields.CharField(
        max_length=255,
        description="Full name of the user"
    )
    
    mobile_number = fields.CharField(
        max_length=20,
        null=True,
        description="Mobile number (optional)"
    )
    
    # Authentication
    pin_hash = fields.CharField(
        max_length=255,
        description="Hashed PIN for authentication"
    )
    
    # Role and permissions
    role = fields.CharEnumField(
        UserRole,
        default=UserRole.USER,
        description="User role (admin or user)"
    )
    
    is_active = fields.BooleanField(
        default=True,
        description="Whether the user account is active"
    )
    
    # Additional optional fields
    email = fields.CharField(
        max_length=255,
        null=True,
        description="Email address (optional)"
    )

    avatar_color = fields.CharField(
        max_length=50,
        null=True,
        description="Avatar color identifier (e.g., 'blue', 'green', 'purple')"
    )

    notes = fields.TextField(
        null=True,
        description="Additional notes about the user"
    )
    
    # Metadata
    last_login = fields.DatetimeField(
        null=True,
        description="Last login timestamp"
    )
    
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_users',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this account"
    )
    
    class Meta:
        table = "users"
        indexes = [
            ("full_name",),
            ("mobile_number",),
            ("role",),
        ]
    
    def __str__(self) -> str:
        return f"{self.full_name} ({self.role.value})"
    
    @property
    def is_admin(self) -> bool:
        """Check if user is an admin user"""
        return self.role == UserRole.ADMIN

