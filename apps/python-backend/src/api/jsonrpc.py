"""
JSON-RPC 2.0 implementation for API responses
"""
import traceback
import logging
from typing import Any, Optional, Dict
from fastapi import Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class JSONRPCError(BaseModel):
    """JSON-RPC 2.0 Error object"""
    code: int
    message: str
    data: Optional[Dict[str, Any]] = None


class JSONRPCResponse(BaseModel):
    """JSON-RPC 2.0 Response object"""
    jsonrpc: str = "2.0"
    id: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[JSONRPCError] = None


# Standard JSON-RPC 2.0 error codes
class ErrorCode:
    PARSE_ERROR = -32700
    INVALID_REQUEST = -32600
    METHOD_NOT_FOUND = -32601
    INVALID_PARAMS = -32602
    INTERNAL_ERROR = -32603
    
    # Custom application error codes (range: -32000 to -32099)
    VALIDATION_ERROR = -32001
    AUTHENTICATION_ERROR = -32002
    AUTHORIZATION_ERROR = -32003
    NOT_FOUND = -32004
    CONFLICT = -32005
    DATABASE_ERROR = -32006
    BUSINESS_LOGIC_ERROR = -32007


def create_success_response(
    result: Any,
    request_id: Optional[str] = None
) -> JSONRPCResponse:
    """
    Create a successful JSON-RPC 2.0 response
    
    Args:
        result: The result data
        request_id: Optional request ID for correlation
        
    Returns:
        JSONRPCResponse object
    """
    return JSONRPCResponse(
        jsonrpc="2.0",
        id=request_id,
        result=result,
        error=None
    )


def create_error_response(
    code: int,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
    include_traceback: bool = False
) -> JSONRPCResponse:
    """
    Create an error JSON-RPC 2.0 response
    
    Args:
        code: Error code (use ErrorCode constants)
        message: Error message
        data: Additional error data
        request_id: Optional request ID for correlation
        include_traceback: Whether to include stack trace (dev mode only)
        
    Returns:
        JSONRPCResponse object
    """
    error_data = data or {}
    
    # Add stack trace in development mode
    if include_traceback:
        error_data["stackTrace"] = traceback.format_exc()
    
    error = JSONRPCError(
        code=code,
        message=message,
        data=error_data if error_data else None
    )
    
    return JSONRPCResponse(
        jsonrpc="2.0",
        id=request_id,
        result=None,
        error=error
    )


def http_status_to_jsonrpc_error(status_code: int) -> tuple[int, str]:
    """
    Map HTTP status codes to JSON-RPC error codes and messages
    
    Args:
        status_code: HTTP status code
        
    Returns:
        Tuple of (error_code, error_message)
    """
    mapping = {
        400: (ErrorCode.INVALID_REQUEST, "Bad Request"),
        401: (ErrorCode.AUTHENTICATION_ERROR, "Unauthorized"),
        403: (ErrorCode.AUTHORIZATION_ERROR, "Forbidden"),
        404: (ErrorCode.NOT_FOUND, "Not Found"),
        409: (ErrorCode.CONFLICT, "Conflict"),
        422: (ErrorCode.VALIDATION_ERROR, "Validation Error"),
        500: (ErrorCode.INTERNAL_ERROR, "Internal Server Error"),
        503: (ErrorCode.INTERNAL_ERROR, "Service Unavailable"),
    }
    
    return mapping.get(status_code, (ErrorCode.INTERNAL_ERROR, "Unknown Error"))


async def jsonrpc_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler that converts exceptions to JSON-RPC 2.0 error responses
    
    Args:
        request: FastAPI request object
        exc: Exception that was raised
        
    Returns:
        JSONResponse with JSON-RPC 2.0 error format
    """
    from fastapi import HTTPException
    from fastapi.exceptions import RequestValidationError
    from tortoise.exceptions import DoesNotExist, IntegrityError
    
    # Determine if we're in development mode
    from ..config import settings
    is_dev = settings.ENVIRONMENT == "development"
    
    # Get request ID from headers if available
    request_id = request.headers.get("X-Request-ID")
    
    # Handle different exception types
    if isinstance(exc, HTTPException):
        error_code, default_message = http_status_to_jsonrpc_error(exc.status_code)
        message = exc.detail if exc.detail else default_message
        
        response = create_error_response(
            code=error_code,
            message=message,
            data={"httpStatus": exc.status_code},
            request_id=request_id,
            include_traceback=is_dev
        )
        
        http_status = exc.status_code
        
    elif isinstance(exc, RequestValidationError):
        # Validation errors from Pydantic
        errors = []
        for error in exc.errors():
            errors.append({
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })
        
        response = create_error_response(
            code=ErrorCode.VALIDATION_ERROR,
            message="Request validation failed",
            data={"validationErrors": errors},
            request_id=request_id,
            include_traceback=is_dev
        )
        
        http_status = status.HTTP_422_UNPROCESSABLE_ENTITY
        
    elif isinstance(exc, DoesNotExist):
        # Database record not found
        response = create_error_response(
            code=ErrorCode.NOT_FOUND,
            message="Resource not found",
            data={"detail": str(exc)},
            request_id=request_id,
            include_traceback=is_dev
        )
        
        http_status = status.HTTP_404_NOT_FOUND
        
    elif isinstance(exc, IntegrityError):
        # Database integrity constraint violation
        response = create_error_response(
            code=ErrorCode.DATABASE_ERROR,
            message="Database integrity error",
            data={"detail": str(exc)},
            request_id=request_id,
            include_traceback=is_dev
        )
        
        http_status = status.HTTP_409_CONFLICT
        
    else:
        # Generic unhandled exception
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        
        response = create_error_response(
            code=ErrorCode.INTERNAL_ERROR,
            message="Internal server error" if not is_dev else str(exc),
            data={"type": type(exc).__name__},
            request_id=request_id,
            include_traceback=is_dev
        )
        
        http_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    
    # Log the error
    logger.error(
        f"JSON-RPC Error: {response.error.code} - {response.error.message}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=http_status,
        content=response.model_dump(exclude_none=True)
    )
