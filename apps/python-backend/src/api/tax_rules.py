"""
Tax Rules API Endpoints
Handles CRUD operations for tax rules with India-specific GST support
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import date
from ..database.models import (
    TaxRule,
    TaxType,
    TaxCalculationMethod,
    TaxInclusionType,
    RoundingMethod
)
from .schemas import TaxRuleCreate, TaxRuleUpdate, TaxRuleResponse

router = APIRouter(prefix="/tax-rules", tags=["Tax Rules"])


def tax_rule_to_response(tax_rule: TaxRule) -> TaxRuleResponse:
    """Convert TaxRule model to response schema"""
    return TaxRuleResponse(
        id=tax_rule.id,
        name=tax_rule.name,
        description=tax_rule.description,
        tax_type=tax_rule.tax_type.value,
        rate=float(tax_rule.rate),
        calculation_method=tax_rule.calculation_method.value,
        fixed_amount=float(tax_rule.fixed_amount) if tax_rule.fixed_amount else None,
        inclusion_type=tax_rule.inclusion_type.value,
        rounding_method=tax_rule.rounding_method.value,
        hsn_code=tax_rule.hsn_code,
        sac_code=tax_rule.sac_code,
        cgst_rate=float(tax_rule.cgst_rate) if tax_rule.cgst_rate else None,
        sgst_rate=float(tax_rule.sgst_rate) if tax_rule.sgst_rate else None,
        igst_rate=float(tax_rule.igst_rate) if tax_rule.igst_rate else None,
        cess_rate=float(tax_rule.cess_rate) if tax_rule.cess_rate else None,
        applies_to_categories=tax_rule.applies_to_categories,
        applies_to_products=tax_rule.applies_to_products,
        min_amount=float(tax_rule.min_amount) if tax_rule.min_amount else None,
        max_amount=float(tax_rule.max_amount) if tax_rule.max_amount else None,
        customer_types=tax_rule.customer_types,
        is_tax_exempt=tax_rule.is_tax_exempt,
        effective_from=tax_rule.effective_from.isoformat() if tax_rule.effective_from else None,
        effective_to=tax_rule.effective_to.isoformat() if tax_rule.effective_to else None,
        is_compound=tax_rule.is_compound,
        compound_on_taxes=tax_rule.compound_on_taxes,
        is_active=tax_rule.is_active,
        priority=tax_rule.priority,
        created_at=tax_rule.created_at.isoformat(),
        updated_at=tax_rule.updated_at.isoformat(),
        created_by=tax_rule.created_by
    )


@router.get("/", response_model=List[TaxRuleResponse])
async def get_all_tax_rules(active_only: bool = False):
    """Get all tax rules"""
    try:
        if active_only:
            tax_rules = await TaxRule.filter(is_active=True).all()
        else:
            tax_rules = await TaxRule.all()
        
        return [tax_rule_to_response(rule) for rule in tax_rules]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tax rules: {str(e)}"
        )


@router.get("/{tax_rule_id}", response_model=TaxRuleResponse)
async def get_tax_rule(tax_rule_id: int):
    """Get a specific tax rule by ID"""
    tax_rule = await TaxRule.get_or_none(id=tax_rule_id)
    
    if not tax_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax rule with ID {tax_rule_id} not found"
        )
    
    return tax_rule_to_response(tax_rule)


@router.post("/", response_model=TaxRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_tax_rule(tax_rule_data: TaxRuleCreate, created_by: int = 1):
    """Create a new tax rule"""
    try:
        # Validate enums
        try:
            tax_type_enum = TaxType(tax_rule_data.tax_type)
            calculation_method_enum = TaxCalculationMethod(tax_rule_data.calculation_method)
            inclusion_type_enum = TaxInclusionType(tax_rule_data.inclusion_type)
            rounding_method_enum = RoundingMethod(tax_rule_data.rounding_method)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid enum value: {str(e)}"
            )

        # Parse dates if provided
        effective_from = None
        effective_to = None
        if tax_rule_data.effective_from:
            try:
                effective_from = date.fromisoformat(tax_rule_data.effective_from)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid effective_from date format. Use YYYY-MM-DD"
                )

        if tax_rule_data.effective_to:
            try:
                effective_to = date.fromisoformat(tax_rule_data.effective_to)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid effective_to date format. Use YYYY-MM-DD"
                )

        # Create tax rule
        tax_rule = await TaxRule.create(
            name=tax_rule_data.name,
            description=tax_rule_data.description,
            tax_type=tax_type_enum,
            rate=tax_rule_data.rate,
            calculation_method=calculation_method_enum,
            fixed_amount=tax_rule_data.fixed_amount,
            inclusion_type=inclusion_type_enum,
            rounding_method=rounding_method_enum,
            hsn_code=tax_rule_data.hsn_code,
            sac_code=tax_rule_data.sac_code,
            cgst_rate=tax_rule_data.cgst_rate,
            sgst_rate=tax_rule_data.sgst_rate,
            igst_rate=tax_rule_data.igst_rate,
            cess_rate=tax_rule_data.cess_rate,
            applies_to_categories=tax_rule_data.applies_to_categories,
            applies_to_products=tax_rule_data.applies_to_products,
            min_amount=tax_rule_data.min_amount,
            max_amount=tax_rule_data.max_amount,
            customer_types=tax_rule_data.customer_types,
            is_tax_exempt=tax_rule_data.is_tax_exempt,
            effective_from=effective_from,
            effective_to=effective_to,
            is_compound=tax_rule_data.is_compound,
            compound_on_taxes=tax_rule_data.compound_on_taxes,
            is_active=tax_rule_data.is_active,
            priority=tax_rule_data.priority,
            created_by=created_by
        )

        return tax_rule_to_response(tax_rule)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tax rule: {str(e)}"
        )


@router.put("/{tax_rule_id}", response_model=TaxRuleResponse)
async def update_tax_rule(tax_rule_id: int, tax_rule_data: TaxRuleUpdate):
    """Update an existing tax rule"""
    tax_rule = await TaxRule.get_or_none(id=tax_rule_id)

    if not tax_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax rule with ID {tax_rule_id} not found"
        )

    try:
        # Update fields
        update_data = tax_rule_data.model_dump(exclude_unset=True)

        # Validate and convert enums if provided
        if 'tax_type' in update_data:
            try:
                update_data['tax_type'] = TaxType(update_data['tax_type'])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid tax type: {update_data['tax_type']}"
                )

        if 'calculation_method' in update_data:
            try:
                update_data['calculation_method'] = TaxCalculationMethod(update_data['calculation_method'])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid calculation method: {update_data['calculation_method']}"
                )

        if 'inclusion_type' in update_data:
            try:
                update_data['inclusion_type'] = TaxInclusionType(update_data['inclusion_type'])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid inclusion type: {update_data['inclusion_type']}"
                )

        if 'rounding_method' in update_data:
            try:
                update_data['rounding_method'] = RoundingMethod(update_data['rounding_method'])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid rounding method: {update_data['rounding_method']}"
                )

        # Parse dates if provided
        if 'effective_from' in update_data and update_data['effective_from']:
            try:
                update_data['effective_from'] = date.fromisoformat(update_data['effective_from'])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid effective_from date format. Use YYYY-MM-DD"
                )

        if 'effective_to' in update_data and update_data['effective_to']:
            try:
                update_data['effective_to'] = date.fromisoformat(update_data['effective_to'])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid effective_to date format. Use YYYY-MM-DD"
                )

        # Update the tax rule
        for field, value in update_data.items():
            setattr(tax_rule, field, value)

        await tax_rule.save()

        return tax_rule_to_response(tax_rule)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tax rule: {str(e)}"
        )


@router.delete("/{tax_rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tax_rule(tax_rule_id: int):
    """Delete a tax rule"""
    tax_rule = await TaxRule.get_or_none(id=tax_rule_id)
    
    if not tax_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax rule with ID {tax_rule_id} not found"
        )
    
    try:
        await tax_rule.delete()
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete tax rule: {str(e)}"
        )


@router.post("/{tax_rule_id}/toggle", response_model=TaxRuleResponse)
async def toggle_tax_rule(tax_rule_id: int):
    """Toggle tax rule active status"""
    tax_rule = await TaxRule.get_or_none(id=tax_rule_id)
    
    if not tax_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax rule with ID {tax_rule_id} not found"
        )
    
    try:
        tax_rule.is_active = not tax_rule.is_active
        await tax_rule.save()
        
        return tax_rule_to_response(tax_rule)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle tax rule: {str(e)}"
        )


@router.post("/calculate", response_model=dict)
async def calculate_taxes(amount: float, tax_rule_ids: List[int]):
    """Calculate taxes for a given amount using specified tax rules"""
    try:
        tax_rules = await TaxRule.filter(id__in=tax_rule_ids, is_active=True).all()

        if not tax_rules:
            return {"total_tax": 0, "breakdown": {}, "grand_total": amount}

        # Sort by priority
        tax_rules.sort(key=lambda x: x.priority, reverse=True)

        total_tax = 0
        breakdown = {}
        base_tax_amount = 0

        for rule in tax_rules:
            result = rule.calculate_tax(amount, base_tax_amount)
            total_tax += result["total"]
            breakdown[rule.name] = result

            if not rule.is_compound:
                base_tax_amount += result["total"]

        return {
            "base_amount": amount,
            "total_tax": total_tax,
            "breakdown": breakdown,
            "grand_total": amount + total_tax
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate taxes: {str(e)}"
        )


@router.post("/{tax_rule_id}/preview", response_model=dict)
async def preview_tax_calculation(tax_rule_id: int, amount: float = 100.0):
    """Preview tax calculation for a specific tax rule with example amounts"""
    tax_rule = await TaxRule.get_or_none(id=tax_rule_id)

    if not tax_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax rule with ID {tax_rule_id} not found"
        )

    try:
        # Calculate tax for the given amount
        result = tax_rule.calculate_tax(amount, 0)

        # Generate examples for common amounts
        examples = []
        for test_amount in [10, 50, 100, 500, 1000]:
            calc = tax_rule.calculate_tax(test_amount, 0)
            examples.append({
                "amount": test_amount,
                "tax": calc["total"],
                "total": test_amount + calc["total"] if tax_rule.inclusion_type.value == "exclusive" else test_amount,
                "breakdown": calc.get("breakdown", {})
            })

        return {
            "tax_rule": {
                "id": tax_rule.id,
                "name": tax_rule.name,
                "tax_type": tax_rule.tax_type.value,
                "rate": float(tax_rule.rate),
                "calculation_method": tax_rule.calculation_method.value,
                "inclusion_type": tax_rule.inclusion_type.value,
                "is_active": tax_rule.is_active
            },
            "calculation": {
                "amount": amount,
                "tax": result["total"],
                "total": amount + result["total"] if tax_rule.inclusion_type.value == "exclusive" else amount,
                "breakdown": result.get("breakdown", {})
            },
            "examples": examples
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to preview tax calculation: {str(e)}"
        )

