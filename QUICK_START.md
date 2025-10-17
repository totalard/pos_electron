# POS Electron Application - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Python >= 3.11
- Virtual environment activated

---

## ⚡ Quick Start (5 minutes)

### 1. Start Backend
```bash
cd apps/python-backend
source venv/bin/activate
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8001
```

### 2. Start Frontend (in new terminal)
```bash
cd apps/electron-app
pnpm dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

---

## 🔐 Default Credentials

| Field | Value |
|-------|-------|
| PIN | 123456 |
| Role | Admin |
| User | Primary User |

---

## ⌨️ Keyboard Shortcuts

### Login Screen
| Key | Action |
|-----|--------|
| 0-9 | Add digit to PIN |
| Enter | Submit PIN |
| Backspace | Delete last digit |
| Escape | Clear all digits |

### Dashboard
| Key | Action |
|-----|--------|
| Click buttons | Navigate screens |
| Hover | Visual feedback |

---

## 👥 User Roles

### Admin User (Role: admin)
- ✓ Access Point of Sale
- ✓ Access Products & Services
- ✓ Access Inventory
- ✓ **Access User Management**
- ✓ **Access Settings**

### Regular User (Role: user)
- ✓ Access Point of Sale
- ✓ Access Products & Services
- ✓ Access Inventory
- ✗ Cannot access User Management
- ✗ Cannot access Settings

---

## 📱 Touch-Safe Design

### Button Sizes
- Keypad buttons: 56x56px
- User selection: 200px height
- Menu items: 180px height
- Back button: 44px height

### Spacing
- Adequate gaps between elements
- Visual feedback on interactions
- Accessible for touch devices

---

## 🧪 Testing Checklist

### Keyboard Input
- [ ] Type 0-9 on login screen
- [ ] Press Enter to submit
- [ ] Press Backspace to delete
- [ ] Press Escape to clear

### Role-Based Access
- [ ] Login as admin (PIN: 123456)
- [ ] Verify Settings visible
- [ ] Verify User Management visible
- [ ] Create new user
- [ ] Login as new user
- [ ] Verify Settings hidden
- [ ] Verify User Management hidden

### Touch-Safe UI
- [ ] All buttons easily clickable
- [ ] Adequate spacing between elements
- [ ] Visual feedback on click/hover
- [ ] Test on tablet resolution (1024x768)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| IMPLEMENTATION_SUMMARY.md | Overview of all changes |
| IMPROVEMENTS_IMPLEMENTATION.md | Detailed implementation |
| TEST_VERIFICATION.md | Testing guide |
| CHANGES_SUMMARY.md | Detailed changes |
| COMPLETION_REPORT.md | Project completion status |

---

## 🔧 Common Commands

### Backend
```bash
# Start development server
cd apps/python-backend
source venv/bin/activate
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8001

# Run tests
pytest

# Type checking
mypy src/

# Linting
pylint src/
```

### Frontend
```bash
# Start development server
cd apps/electron-app
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm exec tsc --noEmit

# Linting
pnpm lint
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8001 is in use
lsof -i :8001

# Activate virtual environment
cd apps/python-backend
source venv/bin/activate

# Install dependencies if needed
pip install -r requirements.txt
```

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
cd apps/electron-app
rm -rf node_modules
pnpm install

# Check if port 5173 is in use
lsof -i :5173
```

### Database Issues
```bash
# Delete database to reset
rm -rf apps/python-backend/data/pos.db

# Restart backend to reinitialize
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/initialize` - Initialize admin user
- `POST /api/auth/login` - Login with PIN
- `GET /api/auth/users` - Get all users
- `POST /api/auth/users` - Create new user (admin only)
- `PUT /api/auth/users/{id}` - Update user (admin only)
- `DELETE /api/auth/users/{id}` - Delete user (admin only)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Health
- `GET /health` - Health check
- `GET /` - Root endpoint

---

## 🎯 Key Features

### 1. Keyboard Support
- Type PIN using physical keyboard
- Full keyboard support (0-9, Enter, Backspace, Escape)
- Works without focusing on keypad

### 2. Role-Based Access
- Admin users have full access
- Regular users have limited access
- Backend enforces role checks
- Frontend hides restricted screens

### 3. Touch-Safe UI
- Minimum 44x44px touch targets
- Adequate spacing between elements
- Visual feedback on interactions
- Accessible for all users

---

## 💡 Tips

1. **Keyboard Input**: Use physical keyboard for faster PIN entry
2. **Role Management**: Create users with different roles for testing
3. **Touch Testing**: Use browser DevTools to simulate touch devices
4. **API Testing**: Use http://localhost:8001/docs for interactive API testing
5. **Database Reset**: Delete `data/pos.db` to reset application state

---

## 📞 Support

For detailed information:
1. Check the documentation files
2. Review code comments in modified files
3. Check API documentation at http://localhost:8001/docs
4. Review test verification guide

---

## ✅ Verification

All features have been implemented and verified:
- ✓ Keyboard support working
- ✓ Role system implemented
- ✓ Touch-safe UI components
- ✓ Code compiles without errors
- ✓ All tests pass

Ready for manual testing and deployment!

