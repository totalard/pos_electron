"""
Tax Rule Model for POS System
Supports multiple tax configurations including India-specific GST features
"""

from tortoise import fields
from tortoise.models import Model
from enum import Enum


class TaxType(str, Enum):
    """Tax type enumeration"""
    SIMPLE = "simple"
    GST_CGST = "gst_cgst"
    GST_SGST = "gst_sgst"
    GST_IGST = "gst_igst"
    CESS = "cess"
    VAT = "vat"
    CUSTOM = "custom"


class TaxRule(Model):
    """
    Tax Rule Model
    Supports multiple tax configurations with India-specific GST features
    """
    
    id = fields.IntField(pk=True)
    
    # Basic Information
    name = fields.CharField(
        max_length=100,
        description="Tax rule name (e.g., 'GST 18%', 'VAT 5%')"
    )
    
    description = fields.TextField(
        null=True,
        description="Detailed description of the tax rule"
    )
    
    tax_type = fields.CharEnumField(
        TaxType,
        default=TaxType.SIMPLE,
        description="Type of tax (simple, GST components, VAT, etc.)"
    )
    
    # Tax Rate Configuration
    rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        description="Tax rate percentage (e.g., 18.00 for 18%)"
    )
    
    # India-Specific GST Fields
    hsn_code = fields.CharField(
        max_length=20,
        null=True,
        description="HSN (Harmonized System of Nomenclature) code for goods"
    )
    
    sac_code = fields.CharField(
        max_length=20,
        null=True,
        description="SAC (Services Accounting Code) for services"
    )
    
    cgst_rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        description="CGST (Central GST) rate percentage"
    )
    
    sgst_rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        description="SGST (State GST) rate percentage"
    )
    
    igst_rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        description="IGST (Integrated GST) rate percentage"
    )
    
    cess_rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        description="CESS rate percentage"
    )
    
    # Tax Rule Conditions
    applies_to_categories = fields.JSONField(
        default=list,
        description="List of product category IDs this tax applies to"
    )
    
    min_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Minimum transaction amount for this tax to apply"
    )
    
    max_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Maximum transaction amount for this tax to apply"
    )
    
    customer_types = fields.JSONField(
        default=list,
        description="List of customer types this tax applies to (e.g., ['retail', 'wholesale'])"
    )
    
    # Compound Tax
    is_compound = fields.BooleanField(
        default=False,
        description="Whether this tax is calculated on top of other taxes"
    )
    
    compound_on_taxes = fields.JSONField(
        default=list,
        description="List of tax rule IDs this compound tax is calculated on"
    )
    
    # Status and Priority
    is_active = fields.BooleanField(
        default=True,
        description="Whether this tax rule is currently active"
    )
    
    priority = fields.IntField(
        default=0,
        description="Priority order for applying multiple taxes (higher = applied first)"
    )
    
    # Metadata
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    created_by = fields.IntField(
        null=True,
        description="User ID who created this tax rule"
    )
    
    class Meta:
        table = "tax_rules"
        ordering = ["-priority", "name"]
    
    def __str__(self):
        return f"{self.name} ({self.rate}%)"
    
    def calculate_tax(self, amount: float, base_tax_amount: float = 0) -> dict:
        """
        Calculate tax amount based on the rule configuration
        
        Args:
            amount: Base amount to calculate tax on
            base_tax_amount: Sum of other taxes (for compound tax calculation)
        
        Returns:
            Dictionary with tax breakdown
        """
        if not self.is_active:
            return {"total": 0, "breakdown": {}}
        
        # Calculate base for tax
        tax_base = amount
        if self.is_compound and base_tax_amount > 0:
            tax_base = amount + base_tax_amount
        
        result = {
            "total": 0,
            "breakdown": {},
            "tax_type": self.tax_type.value
        }
        
        if self.tax_type == TaxType.SIMPLE:
            tax_amount = (tax_base * float(self.rate)) / 100
            result["total"] = tax_amount
            result["breakdown"][self.name] = tax_amount
        
        elif self.tax_type in [TaxType.GST_CGST, TaxType.GST_SGST]:
            # For intra-state transactions (CGST + SGST)
            if self.cgst_rate:
                cgst = (tax_base * float(self.cgst_rate)) / 100
                result["breakdown"]["CGST"] = cgst
                result["total"] += cgst
            
            if self.sgst_rate:
                sgst = (tax_base * float(self.sgst_rate)) / 100
                result["breakdown"]["SGST"] = sgst
                result["total"] += sgst
        
        elif self.tax_type == TaxType.GST_IGST:
            # For inter-state transactions (IGST)
            if self.igst_rate:
                igst = (tax_base * float(self.igst_rate)) / 100
                result["breakdown"]["IGST"] = igst
                result["total"] += igst
        
        # Add CESS if applicable
        if self.cess_rate:
            cess = (tax_base * float(self.cess_rate)) / 100
            result["breakdown"]["CESS"] = cess
            result["total"] += cess
        
        return result

