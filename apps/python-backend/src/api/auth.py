"""
Authentication API endpoints
"""
import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status
from tortoise.exceptions import DoesNotExist, IntegrityError

from ..database.models import User, UserRole
from ..utils.auth import hash_pin, verify_pin
from .schemas import (
    UserCreate,
    UserUpdate,
    UserChangePIN,
    UserResponse,
    UserLogin,
    UserLoginResponse
)
from .helpers import user_to_response

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/initialize", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def initialize_primary_user():
    """
    Initialize the primary user on first app launch.

    This endpoint creates a default primary user with PIN '123456' if no users exist.
    Should only be called once during initial setup.
    """
    # Check if any users exist
    user_count = await User.all().count()

    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primary user already exists. Cannot initialize again."
        )

    # Create primary user with default 6-digit PIN
    default_pin = "123456"
    pin_hash = hash_pin(default_pin)
    
    try:
        primary_user = await User.create(
            full_name="Primary User",
            pin_hash=pin_hash,
            role=UserRole.ADMIN,
            is_active=True
        )

        logger.info(f"Admin user created with ID: {primary_user.id}")

        return user_to_response(primary_user)
    
    except IntegrityError as e:
        logger.error(f"Failed to create primary user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create primary user"
        )


@router.post("/login", response_model=UserLoginResponse)
async def login(credentials: UserLogin):
    """
    Authenticate a user with PIN.
    
    Returns user information if authentication is successful.
    """
    # Get all active users
    users = await User.filter(is_active=True).all()
    
    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users found. Please initialize the system first."
        )
    
    # Try to authenticate with each user's PIN
    authenticated_user = None
    for user in users:
        if verify_pin(credentials.pin, user.pin_hash):
            authenticated_user = user
            break
    
    if not authenticated_user:
        logger.warning("Failed login attempt with invalid PIN")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PIN"
        )
    
    # Update last login timestamp
    authenticated_user.last_login = datetime.utcnow()
    await authenticated_user.save()
    
    logger.info(f"User {authenticated_user.full_name} logged in successfully")

    user_response = user_to_response(authenticated_user)

    return UserLoginResponse(
        success=True,
        message="Login successful",
        user=user_response,
        token=None  # TODO: Implement JWT token generation
    )


@router.get("/users", response_model=List[UserResponse])
async def get_all_users():
    """
    Get all users.
    
    Note: In production, this should be restricted to primary users only.
    """
    users = await User.all()
    return [user_to_response(user) for user in users]


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get a specific user by ID"""
    try:
        user = await User.get(id=user_id)
        return user_to_response(user)
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, created_by_id: int = 1):
    """
    Create a new user.
    
    Note: In production, created_by_id should come from the authenticated session.
    Only primary users should be able to create new users.
    """
    # Hash the PIN
    pin_hash = hash_pin(user_data.pin)
    
    try:
        # Get the creator user
        creator = await User.get(id=created_by_id)

        # Check if creator is admin user
        if creator.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin users can create new users"
            )

        # Create new user (always as USER role)
        new_user = await User.create(
            full_name=user_data.full_name,
            mobile_number=user_data.mobile_number,
            pin_hash=pin_hash,
            email=user_data.email,
            avatar_color=user_data.avatar_color,
            notes=user_data.notes,
            role=UserRole.USER,
            is_active=True,
            created_by=creator
        )
        
        logger.info(f"New user created: {new_user.full_name} (ID: {new_user.id})")

        return user_to_response(new_user)
    
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creator user with ID {created_by_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to create user: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user. User may already exist."
        )


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_data: UserUpdate, admin_id: int = 1):
    """
    Update user information.

    Note: Cannot update PIN through this endpoint. Use change-pin endpoint instead.
    Only admin users can update user information.
    """
    try:
        # Check if requester is admin
        admin_user = await User.get(id=admin_id)
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin users can update user information"
            )

        user = await User.get(id=user_id)

        # Update only provided fields
        update_data = user_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        await user.save()

        logger.info(f"User {user_id} updated successfully by admin {admin_id}")

        return user_to_response(user)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )


@router.post("/users/{user_id}/change-pin", response_model=dict)
async def change_pin(user_id: int, pin_data: UserChangePIN):
    """
    Change user PIN.
    
    Requires old PIN for verification.
    """
    try:
        user = await User.get(id=user_id)
        
        # Verify old PIN
        if not verify_pin(pin_data.old_pin, user.pin_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid old PIN"
            )
        
        # Hash and save new PIN
        user.pin_hash = hash_pin(pin_data.new_pin)
        await user.save()
        
        logger.info(f"PIN changed for user {user_id}")
        
        return {"success": True, "message": "PIN changed successfully"}
    
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, admin_id: int = 1):
    """
    Delete a user (soft delete by setting is_active to False).

    Note: Primary user cannot be deleted. Only admin users can delete users.
    """
    try:
        # Check if requester is admin
        admin_user = await User.get(id=admin_id)
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin users can delete users"
            )

        user = await User.get(id=user_id)

        # Prevent deletion of admin user
        if user.role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete admin user"
            )

        # Soft delete
        user.is_active = False
        await user.save()

        logger.info(f"User {user_id} deactivated by admin {admin_id}")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

