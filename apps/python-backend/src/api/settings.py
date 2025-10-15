"""
Settings API endpoints for managing company and user settings.
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from ..database.models import CompanySettings, UserSettings, User
from .schemas import (
    CompanySettingsUpdate,
    CompanySettingsResponse,
    UserSettingsUpdate,
    UserSettingsResponse
)

router = APIRouter(prefix="/settings", tags=["settings"])


# Company Settings Endpoints
@router.get("/company", response_model=CompanySettingsResponse)
async def get_company_settings():
    """
    Get company-wide settings.
    Only one company settings record should exist.
    """
    settings = await CompanySettings.first()

    if not settings:
        # Create default settings if none exist
        settings = await CompanySettings.create()

    return settings


@router.put("/company", response_model=CompanySettingsResponse)
async def update_company_settings(settings_update: CompanySettingsUpdate):
    """
    Update company-wide settings.
    Note: In production, this should be protected with authentication.
    """
    # Get or create company settings
    settings = await CompanySettings.first()
    if not settings:
        settings = await CompanySettings.create()

    # Update only provided fields
    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    await settings.save()
    return settings


# User Settings Endpoints
@router.get("/user/{user_id}", response_model=UserSettingsResponse)
async def get_user_settings_by_id(user_id: int):
    """
    Get settings for a specific user.
    Note: In production, this should be protected with authentication.
    """
    # Check if user exists
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get or create settings
    settings = await UserSettings.filter(user_id=user_id).first()
    if not settings:
        settings = await UserSettings.create(user_id=user_id)

    return settings


@router.put("/user/{user_id}", response_model=UserSettingsResponse)
async def update_user_settings(user_id: int, settings_update: UserSettingsUpdate):
    """
    Update user's settings.
    Note: In production, this should be protected with authentication.
    """
    # Check if user exists
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get or create user settings
    settings = await UserSettings.filter(user_id=user_id).first()
    if not settings:
        settings = await UserSettings.create(user_id=user_id)

    # Update only provided fields
    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    await settings.save()
    return settings


@router.delete("/user/{user_id}")
async def reset_user_settings(user_id: int):
    """
    Reset user settings to defaults.
    Note: In production, this should be protected with authentication.
    """
    # Check if user exists
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete existing settings
    settings = await UserSettings.filter(user_id=user_id).first()
    if settings:
        await settings.delete()

    # Create new default settings
    new_settings = await UserSettings.create(user_id=user_id)

    return {
        "message": "User settings reset to defaults",
        "settings": await UserSettingsResponse.from_tortoise_orm(new_settings)
    }

