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


class TaxCalculationMethod(str, Enum):
    """Tax calculation method enumeration"""
    PERCENTAGE = "percentage"  # Tax calculated as percentage of amount
    FIXED_AMOUNT = "fixed_amount"  # Fixed tax amount


class TaxInclusionType(str, Enum):
    """Tax inclusion type enumeration"""
    EXCLUSIVE = "exclusive"  # Tax added to price
    INCLUSIVE = "inclusive"  # Tax included in price


class RoundingMethod(str, Enum):
    """Rounding method enumeration"""
    ROUND_HALF_UP = "round_half_up"  # Round 0.5 up (standard rounding)
    ROUND_UP = "round_up"  # Always round up
    ROUND_DOWN = "round_down"  # Always round down
    NO_ROUNDING = "no_rounding"  # No rounding (keep all decimals)


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

    # Tax Calculation Configuration
    calculation_method = fields.CharEnumField(
        TaxCalculationMethod,
        default=TaxCalculationMethod.PERCENTAGE,
        description="Method for calculating tax (percentage or fixed amount)"
    )

    fixed_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Fixed tax amount (used when calculation_method is fixed_amount)"
    )

    inclusion_type = fields.CharEnumField(
        TaxInclusionType,
        default=TaxInclusionType.EXCLUSIVE,
        description="Whether tax is inclusive (included in price) or exclusive (added to price)"
    )

    rounding_method = fields.CharEnumField(
        RoundingMethod,
        default=RoundingMethod.ROUND_HALF_UP,
        description="Method for rounding tax amounts"
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
        description="List of product category IDs this tax applies to (empty = all categories)"
    )

    applies_to_products = fields.JSONField(
        default=list,
        description="List of specific product IDs this tax applies to (empty = all products)"
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

    # Tax Exemption
    is_tax_exempt = fields.BooleanField(
        default=False,
        description="Whether this is a tax exemption rule (zero-rated)"
    )

    # Date Range
    effective_from = fields.DateField(
        null=True,
        description="Date from which this tax rule is effective"
    )

    effective_to = fields.DateField(
        null=True,
        description="Date until which this tax rule is effective (null = no end date)"
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
    
    def _apply_rounding(self, amount: float) -> float:
        """Apply rounding method to tax amount"""
        from decimal import Decimal, ROUND_HALF_UP, ROUND_UP, ROUND_DOWN

        if self.rounding_method == RoundingMethod.NO_ROUNDING:
            return amount

        decimal_amount = Decimal(str(amount))

        if self.rounding_method == RoundingMethod.ROUND_HALF_UP:
            return float(decimal_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
        elif self.rounding_method == RoundingMethod.ROUND_UP:
            return float(decimal_amount.quantize(Decimal('0.01'), rounding=ROUND_UP))
        elif self.rounding_method == RoundingMethod.ROUND_DOWN:
            return float(decimal_amount.quantize(Decimal('0.01'), rounding=ROUND_DOWN))

        return amount

    def calculate_tax(self, amount: float, base_tax_amount: float = 0, check_date: bool = True) -> dict:
        """
        Calculate tax amount based on the rule configuration

        Args:
            amount: Base amount to calculate tax on
            base_tax_amount: Sum of other taxes (for compound tax calculation)
            check_date: Whether to check effective date range

        Returns:
            Dictionary with tax breakdown
        """
        from datetime import date

        if not self.is_active:
            return {"total": 0, "breakdown": {}, "is_exempt": False}

        # Check date range if enabled
        if check_date:
            today = date.today()
            if self.effective_from and today < self.effective_from:
                return {"total": 0, "breakdown": {}, "is_exempt": False, "reason": "Not yet effective"}
            if self.effective_to and today > self.effective_to:
                return {"total": 0, "breakdown": {}, "is_exempt": False, "reason": "No longer effective"}

        # Check if tax exempt
        if self.is_tax_exempt:
            return {"total": 0, "breakdown": {self.name: 0}, "is_exempt": True}

        # Calculate base for tax
        tax_base = amount

        # For inclusive tax, extract tax from the amount
        if self.inclusion_type == TaxInclusionType.INCLUSIVE:
            if self.calculation_method == TaxCalculationMethod.PERCENTAGE:
                # For inclusive tax: tax = amount - (amount / (1 + rate/100))
                tax_base = amount / (1 + float(self.rate) / 100)
        elif self.is_compound and base_tax_amount > 0:
            # For compound tax, add previous taxes to base
            tax_base = amount + base_tax_amount

        result = {
            "total": 0,
            "breakdown": {},
            "tax_type": self.tax_type.value,
            "inclusion_type": self.inclusion_type.value,
            "is_exempt": False
        }

        # Calculate tax based on method
        if self.calculation_method == TaxCalculationMethod.FIXED_AMOUNT:
            # Fixed amount tax
            tax_amount = float(self.fixed_amount) if self.fixed_amount else 0
            result["total"] = self._apply_rounding(tax_amount)
            result["breakdown"][self.name] = result["total"]

        elif self.tax_type == TaxType.SIMPLE:
            if self.inclusion_type == TaxInclusionType.INCLUSIVE:
                # Tax is already included in the price
                tax_amount = amount - tax_base
            else:
                # Tax is added to the price
                tax_amount = (tax_base * float(self.rate)) / 100

            result["total"] = self._apply_rounding(tax_amount)
            result["breakdown"][self.name] = result["total"]

        elif self.tax_type in [TaxType.GST_CGST, TaxType.GST_SGST]:
            # For intra-state transactions (CGST + SGST)
            if self.cgst_rate:
                cgst = (tax_base * float(self.cgst_rate)) / 100
                cgst = self._apply_rounding(cgst)
                result["breakdown"]["CGST"] = cgst
                result["total"] += cgst

            if self.sgst_rate:
                sgst = (tax_base * float(self.sgst_rate)) / 100
                sgst = self._apply_rounding(sgst)
                result["breakdown"]["SGST"] = sgst
                result["total"] += sgst

        elif self.tax_type == TaxType.GST_IGST:
            # For inter-state transactions (IGST)
            if self.igst_rate:
                igst = (tax_base * float(self.igst_rate)) / 100
                igst = self._apply_rounding(igst)
                result["breakdown"]["IGST"] = igst
                result["total"] += igst

        # Add CESS if applicable
        if self.cess_rate:
            cess = (tax_base * float(self.cess_rate)) / 100
            cess = self._apply_rounding(cess)
            result["breakdown"]["CESS"] = cess
            result["total"] += cess

        return result

