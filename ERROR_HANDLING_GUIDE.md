# Error Handling Implementation Guide

## Overview

This application now implements comprehensive JSON-RPC 2.0 error handling with automatic error modals in development mode.

## Features

### Backend (Python/FastAPI)

1. **JSON-RPC 2.0 Compliant Responses**
   - All API responses follow JSON-RPC 2.0 specification
   - Consistent error format across all endpoints
   - Automatic exception handling via global middleware

2. **Error Codes**
   - Standard JSON-RPC codes: -32700 to -32603
   - Custom application codes: -32001 to -32099
   - Detailed error information with stack traces in dev mode

3. **Files Modified/Created**
   - `apps/python-backend/src/api/jsonrpc.py` - JSON-RPC implementation
   - `apps/python-backend/src/main.py` - Exception handler registration

### Frontend (React/TypeScript)

1. **JSON-RPC Client**
   - Automatic response parsing
   - Error detection and handling
   - Type-safe API calls

2. **Error Modal Component**
   - Displays errors with detailed information
   - Shows stack traces in development mode only
   - Color-coded by error severity
   - Collapsible details and stack trace sections

3. **Global Error Store**
   - Centralized error management
   - Error history tracking (last 50 errors)
   - Easy error display and dismissal

4. **Files Created**
   - `apps/electron-app/src/renderer/utils/jsonrpc.ts` - JSON-RPC client
   - `apps/electron-app/src/renderer/utils/env.ts` - Environment detection
   - `apps/electron-app/src/renderer/utils/apiErrorHandler.ts` - Error handler wrapper
   - `apps/electron-app/src/renderer/stores/errorStore.ts` - Error state management
   - `apps/electron-app/src/renderer/components/common/ErrorModal.tsx` - Error modal UI

## Usage

### Backend

All exceptions are automatically caught and converted to JSON-RPC 2.0 error responses:

```python
from fastapi import HTTPException

# This will be automatically converted to JSON-RPC error
raise HTTPException(status_code=404, detail="Customer not found")
```

### Frontend

#### Option 1: Using withErrorHandler (Recommended)

```typescript
import { withErrorHandler } from '../utils/apiErrorHandler'
import { customerAPI } from '../services/api'

// Automatically shows error modal on failure
const customers = await withErrorHandler(
  () => customerAPI.getAllCustomers()
)

if (customers) {
  // Success - use the data
  console.log(customers)
}
```

#### Option 2: Manual Error Handling

```typescript
import { useErrorStore } from '../stores/errorStore'
import { customerAPI } from '../services/api'

const { showError } = useErrorStore()

try {
  const customers = await customerAPI.getAllCustomers()
} catch (error) {
  // Manually show error modal
  showError(error)
}
```

#### Option 3: Silent Error Handling

```typescript
import { withErrorHandler } from '../utils/apiErrorHandler'

// Don't show error modal, handle silently
const customers = await withErrorHandler(
  () => customerAPI.getAllCustomers(),
  { 
    silent: true,
    onError: (error) => console.log('Custom handling', error)
  }
)
```

## Error Modal Features

### Development Mode
- Full error details
- Stack trace display
- Error code and type
- Additional debug information

### Production Mode
- User-friendly error messages
- No stack traces
- No sensitive information
- Clean error display

## Environment Configuration

Set in `.env` file:

```env
# Development mode - shows detailed errors
VITE_NODE_ENV=development

# Production mode - shows user-friendly errors only
VITE_NODE_ENV=production
```

## Testing Error Handling

### Test Scenarios

1. **Network Error**
   - Stop the backend server
   - Try any API call
   - Should show connection error modal

2. **Validation Error**
   - Submit invalid data (e.g., empty required field)
   - Should show validation error with field details

3. **Not Found Error**
   - Request non-existent resource
   - Should show "Not Found" error

4. **Authentication Error**
   - Use invalid PIN
   - Should show authentication error

5. **Server Error**
   - Trigger server exception
   - Should show internal error with stack trace (dev mode only)

## API Error Codes

| Code | Name | Description |
|------|------|-------------|
| -32700 | Parse Error | Invalid JSON |
| -32600 | Invalid Request | Invalid request format |
| -32601 | Method Not Found | Method does not exist |
| -32602 | Invalid Params | Invalid method parameters |
| -32603 | Internal Error | Internal server error |
| -32001 | Validation Error | Request validation failed |
| -32002 | Authentication Error | Authentication required |
| -32003 | Authorization Error | Access denied |
| -32004 | Not Found | Resource not found |
| -32005 | Conflict | Resource conflict |
| -32006 | Database Error | Database operation failed |
| -32007 | Business Logic Error | Business rule violation |

## Best Practices

1. **Always use withErrorHandler for API calls in stores**
   - Provides consistent error handling
   - Automatic error modal display
   - Reduces boilerplate code

2. **Use silent mode for background operations**
   - Don't interrupt user with errors for non-critical operations
   - Log errors for debugging

3. **Provide custom error handlers for specific cases**
   - Form validation errors
   - Retry logic
   - Fallback behavior

4. **Test in both development and production modes**
   - Verify error messages are appropriate
   - Ensure no sensitive data leaks in production

## Migration Guide

To update existing stores to use the new error handling:

### Before
```typescript
fetchCustomers: async () => {
  set({ isLoading: true, error: null })
  try {
    const customers = await customerAPI.getAllCustomers()
    set({ customers, isLoading: false })
  } catch (error) {
    set({ 
      error: error instanceof Error ? error.message : 'Failed',
      isLoading: false 
    })
  }
}
```

### After
```typescript
fetchCustomers: async () => {
  set({ isLoading: true, error: null })
  
  const customers = await withErrorHandler(
    () => customerAPI.getAllCustomers()
  )
  
  if (customers) {
    set({ customers, isLoading: false })
  } else {
    set({ isLoading: false })
  }
}
```

## Troubleshooting

### Error modal not showing
- Check that `<ErrorModal />` is included in App.tsx
- Verify errorStore is properly imported
- Check browser console for errors

### Stack trace not visible in dev mode
- Verify `VITE_NODE_ENV=development` in .env
- Check that backend has `ENVIRONMENT=development` in config
- Restart both frontend and backend

### Errors not formatted correctly
- Ensure backend is using the new jsonrpc exception handler
- Check that API service is using handleResponse helper
- Verify fetch calls are going through the API service layer
