"""
Customer model for customer management
"""
from tortoise import fields
from .base import BaseModel


class Customer(BaseModel):
    """
    Customer model for managing customer information and loyalty.
    
    Stores customer details including contact information, address,
    and loyalty points for rewards programs.
    """
    
    # Customer information
    name = fields.CharField(
        max_length=255,
        description="Customer full name"
    )
    
    phone = fields.CharField(
        max_length=20,
        null=True,
        description="Customer phone number"
    )
    
    email = fields.CharField(
        max_length=255,
        null=True,
        description="Customer email address"
    )
    
    address = fields.TextField(
        null=True,
        description="Customer address"
    )
    
    # Loyalty program
    loyalty_points = fields.IntField(
        default=0,
        description="Loyalty points accumulated"
    )
    
    # Metadata
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_customers',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this customer record"
    )
    
    class Meta:
        table = "customers"
        indexes = [
            ("name",),
            ("phone",),
            ("email",),
        ]
    
    def __str__(self) -> str:
        return f"{self.name} ({self.phone or self.email or 'No contact'})"

