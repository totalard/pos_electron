"""
Tax Rules API Endpoints
Handles CRUD operations for tax rules with India-specific GST support
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from ..database.models import TaxRule, TaxType
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
        hsn_code=tax_rule.hsn_code,
        sac_code=tax_rule.sac_code,
        cgst_rate=float(tax_rule.cgst_rate) if tax_rule.cgst_rate else None,
        sgst_rate=float(tax_rule.sgst_rate) if tax_rule.sgst_rate else None,
        igst_rate=float(tax_rule.igst_rate) if tax_rule.igst_rate else None,
        cess_rate=float(tax_rule.cess_rate) if tax_rule.cess_rate else None,
        applies_to_categories=tax_rule.applies_to_categories,
        min_amount=float(tax_rule.min_amount) if tax_rule.min_amount else None,
        max_amount=float(tax_rule.max_amount) if tax_rule.max_amount else None,
        customer_types=tax_rule.customer_types,
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
        # Validate tax type
        try:
            tax_type_enum = TaxType(tax_rule_data.tax_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tax type: {tax_rule_data.tax_type}"
            )
        
        # Create tax rule
        tax_rule = await TaxRule.create(
            name=tax_rule_data.name,
            description=tax_rule_data.description,
            tax_type=tax_type_enum,
            rate=tax_rule_data.rate,
            hsn_code=tax_rule_data.hsn_code,
            sac_code=tax_rule_data.sac_code,
            cgst_rate=tax_rule_data.cgst_rate,
            sgst_rate=tax_rule_data.sgst_rate,
            igst_rate=tax_rule_data.igst_rate,
            cess_rate=tax_rule_data.cess_rate,
            applies_to_categories=tax_rule_data.applies_to_categories,
            min_amount=tax_rule_data.min_amount,
            max_amount=tax_rule_data.max_amount,
            customer_types=tax_rule_data.customer_types,
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
        
        # Validate tax type if provided
        if 'tax_type' in update_data:
            try:
                update_data['tax_type'] = TaxType(update_data['tax_type'])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid tax type: {update_data['tax_type']}"
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

