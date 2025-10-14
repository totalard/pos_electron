"""
Base model with auto-generated fields for all database models
"""
from tortoise import fields, models


class BaseModel(models.Model):
    """
    Abstract base model that provides common fields for all models.
    
    All models should inherit from this base class to automatically get:
    - id: Auto-incrementing primary key
    - created_at: Timestamp when the record was created
    - updated_at: Timestamp when the record was last updated
    
    Example:
        class Product(BaseModel):
            name = fields.CharField(max_length=255)
            price = fields.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                table = "products"
    """
    
    # Primary key - auto-incrementing integer
    id = fields.IntField(pk=True, description="Primary key")
    
    # Timestamp fields - automatically managed
    created_at = fields.DatetimeField(
        auto_now_add=True,
        description="Timestamp when the record was created"
    )
    
    updated_at = fields.DatetimeField(
        auto_now=True,
        description="Timestamp when the record was last updated"
    )
    
    class Meta:
        """Model metadata configuration"""
        abstract = True  # This is an abstract model, won't create a table
    def __str__(self) -> str:
        """String representation of the model"""
        return f"{self.__class__.__name__}(id={self.id})"
