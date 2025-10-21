# Error Handling Quick Reference

## 🚀 Quick Start

### Backend is Ready ✅
All API endpoints automatically return JSON-RPC 2.0 responses with proper error handling.

### Frontend Usage

```typescript
import { withErrorHandler } from '../utils/apiErrorHandler'
import { customerAPI } from '../services/api'

// Automatic error modal on failure
const data = await withErrorHandler(() => customerAPI.getAllCustomers())

if (data) {
  // Success - use the data
}
```

## 📋 Common Patterns

### 1. Store Action with Error Handling
```typescript
fetchData: async () => {
  set({ isLoading: true })
  
  const data = await withErrorHandler(() => api.getData())
  
  if (data) {
    set({ data, isLoading: false })
  } else {
    set({ isLoading: false })
  }
}
```

### 2. Silent Error Handling
```typescript
const data = await withErrorHandler(
  () => api.getData(),
  { silent: true }
)
```

### 3. Custom Error Handler
```typescript
const data = await withErrorHandler(
  () => api.getData(),
  { 
    onError: (error) => {
      console.log('Custom handling', error)
    }
  }
)
```

### 4. Manual Error Display
```typescript
import { useErrorStore } from '../stores/errorStore'

const { showError } = useErrorStore()

try {
  await api.call()
} catch (error) {
  showError(error)
}
```

## 🎨 Error Modal Features

### Development Mode
- ✅ Full error details
- ✅ Stack trace
- ✅ Error code
- ✅ Debug information

### Production Mode
- ✅ User-friendly messages
- ❌ No stack traces
- ❌ No sensitive data

## 🔧 Configuration

### Set Environment Mode

Create `.env` file:
```env
VITE_NODE_ENV=development
```

Or for production:
```env
VITE_NODE_ENV=production
```

## 🧪 Testing

### Test Network Error
1. Stop backend: `Ctrl+C`
2. Try any API call
3. See error modal

### Test Validation Error
1. Submit empty form
2. See validation details

### Test Not Found
1. Request invalid ID
2. See "Not Found" error

## 📊 Error Codes

| Code | Type |
|------|------|
| -32001 | Validation Error |
| -32002 | Authentication Error |
| -32003 | Authorization Error |
| -32004 | Not Found |
| -32603 | Internal Error |

## 🎯 Key Files

### Backend
- `apps/python-backend/src/api/jsonrpc.py`

### Frontend
- `apps/electron-app/src/renderer/utils/jsonrpc.ts`
- `apps/electron-app/src/renderer/utils/apiErrorHandler.ts`
- `apps/electron-app/src/renderer/stores/errorStore.ts`
- `apps/electron-app/src/renderer/components/common/ErrorModal.tsx`

## 📚 Full Documentation

See `ERROR_HANDLING_GUIDE.md` for complete documentation.
See `IMPLEMENTATION_SUMMARY.md` for implementation details.

## ✨ Benefits

- ✅ Automatic error handling
- ✅ Consistent error display
- ✅ Development-friendly debugging
- ✅ Production-safe messages
- ✅ Less boilerplate code
- ✅ Type-safe errors
