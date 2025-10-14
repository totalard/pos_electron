"""
Inventory and Stock Transaction models
"""
from enum import Enum
from tortoise import fields
from .base import BaseModel


class TransactionType(str, Enum):
    """Stock transaction type enumeration"""
    PURCHASE = "purchase"      # Stock added via purchase
    SALE = "sale"              # Stock reduced via sale
    ADJUSTMENT = "adjustment"  # Manual stock adjustment
    RETURN = "return"          # Stock returned
    DAMAGE = "damage"          # Stock damaged/lost
    TRANSFER = "transfer"      # Stock transfer between locations


class StockTransaction(BaseModel):
    """
    Stock transaction model for tracking all inventory movements.
    
    This model records every change to product inventory, providing
    a complete audit trail of stock movements.
    """
    
    # Transaction details
    transaction_type = fields.CharEnumField(
        TransactionType,
        description="Type of transaction"
    )
    
    product = fields.ForeignKeyField(
        'models.Product',
        related_name='stock_transactions',
        on_delete=fields.CASCADE,
        description="Product involved in the transaction"
    )
    
    quantity = fields.IntField(
        description="Quantity changed (positive for additions, negative for reductions)"
    )
    
    # Stock levels at time of transaction
    stock_before = fields.IntField(
        description="Stock level before transaction"
    )
    
    stock_after = fields.IntField(
        description="Stock level after transaction"
    )
    
    # Pricing information
    unit_cost = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Unit cost at time of transaction"
    )
    
    total_cost = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Total cost of transaction"
    )
    
    # Reference information
    reference_number = fields.CharField(
        max_length=100,
        null=True,
        description="Reference number (invoice, receipt, etc.)"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes about the transaction"
    )
    
    # User tracking
    performed_by = fields.ForeignKeyField(
        'models.User',
        related_name='stock_transactions',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who performed the transaction"
    )
    
    class Meta:
        table = "stock_transactions"
        indexes = [
            ("transaction_type",),
            ("product_id",),
            ("created_at",),
            ("reference_number",),
        ]
        ordering = ["-created_at"]
    
    def __str__(self) -> str:
        return f"{self.transaction_type.value} - {self.product.name if self.product else 'Unknown'} ({self.quantity})"


class StockAdjustment(BaseModel):
    """
    Stock adjustment model for bulk inventory updates.
    
    This model allows for multiple product adjustments in a single transaction,
    useful for physical inventory counts or bulk updates.
    """
    
    # Adjustment details
    adjustment_date = fields.DatetimeField(
        auto_now_add=True,
        description="Date and time of adjustment"
    )
    
    reason = fields.CharField(
        max_length=255,
        description="Reason for adjustment"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes"
    )
    
    # User tracking
    performed_by = fields.ForeignKeyField(
        'models.User',
        related_name='stock_adjustments',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who performed the adjustment"
    )
    
    # Status
    is_completed = fields.BooleanField(
        default=False,
        description="Whether the adjustment is completed"
    )
    
    class Meta:
        table = "stock_adjustments"
        indexes = [
            ("adjustment_date",),
            ("is_completed",),
        ]
        ordering = ["-adjustment_date"]
    
    def __str__(self) -> str:
        return f"Adjustment on {self.adjustment_date} - {self.reason}"


class StockAdjustmentLine(BaseModel):
    """
    Individual line items for stock adjustments.
    
    Each line represents a single product adjustment within a bulk adjustment.
    """
    
    adjustment = fields.ForeignKeyField(
        'models.StockAdjustment',
        related_name='lines',
        on_delete=fields.CASCADE,
        description="Parent stock adjustment"
    )
    
    product = fields.ForeignKeyField(
        'models.Product',
        related_name='adjustment_lines',
        on_delete=fields.CASCADE,
        description="Product being adjusted"
    )
    
    expected_quantity = fields.IntField(
        description="Expected quantity (from system)"
    )
    
    actual_quantity = fields.IntField(
        description="Actual quantity (from physical count)"
    )
    
    difference = fields.IntField(
        description="Difference (actual - expected)"
    )
    
    notes = fields.TextField(
        null=True,
        description="Notes for this line item"
    )
    
    class Meta:
        table = "stock_adjustment_lines"
        indexes = [
            ("adjustment_id",),
            ("product_id",),
        ]
    
    def __str__(self) -> str:
        return f"{self.product.name if self.product else 'Unknown'} - Diff: {self.difference}"

