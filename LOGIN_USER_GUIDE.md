# POS Login System - User Guide

## Quick Start

### Default Login Credentials
- **PIN:** `123456` (6 digits)
- **User:** Primary User (Admin)

## Login Process

### Step 1: Splash Screen
When you launch the application, you'll see the MidLogic POS splash screen for 3 seconds.

### Step 2: User Selection
After the splash screen, you'll see the login page with:

**Left Side (Desktop):**
- Feature carousel showcasing POS capabilities
- Auto-rotates every 5 seconds
- Features include:
  - Fast & Efficient Sales
  - Inventory Management
  - Detailed Reports
  - Multi-User Support

**Right Side:**
- "Welcome Back" heading
- Grid of user avatars
- Each avatar shows:
  - User initials in a colored circle
  - Full name
  - Role badge (Admin/Staff)

**Action:** Click on your user avatar to proceed

### Step 3: PIN Entry
After selecting your user:

**Display:**
- Your avatar and name at the top
- "Back" button to return to user selection
- 6 empty dots representing PIN digits
- Numeric keypad (0-9)
- Show/Hide PIN toggle
- Clear and Submit buttons

**Action:** Enter your 6-digit PIN using the keypad

**Auto-Submit:** The PIN automatically submits when you enter the 6th digit

### Step 4: Authentication
The system will:
1. Show a loading spinner
2. Validate your PIN against the backend
3. Either:
   - **Success:** Redirect to the dashboard
   - **Failure:** Show error message with remaining attempts

### Step 5: Dashboard
Upon successful login, you'll see the main dashboard with navigation options.

## Features

### Security
- **PIN Hashing:** All PINs are hashed with SHA-256 and salt
- **Attempt Limiting:** Maximum 5 failed attempts before lockout
- **Secure Storage:** PINs never stored in plain text

### User Experience
- **Visual Feedback:** Dots fill as you type
- **Error Messages:** Clear, helpful error messages
- **Attempt Counter:** Shows remaining login attempts
- **Loading States:** Visual indicators during authentication
- **Responsive Design:** Works on all screen sizes

### Accessibility
- **Keyboard Support:** Full keyboard navigation
- **Clear Labels:** All buttons and inputs properly labeled
- **Error Handling:** Descriptive error messages
- **Visual Indicators:** Color-coded status messages

## Troubleshooting

### "Failed to initialize system. Please check backend connection."
**Cause:** Backend server is not running or not accessible

**Solution:**
1. Ensure backend is running on port 8001
2. Check terminal for backend errors
3. Restart backend: `pnpm --filter python-backend dev`
4. Click "Retry" button in the app

### "Incorrect PIN. X attempts remaining."
**Cause:** Wrong PIN entered

**Solution:**
1. Verify you're using the correct 6-digit PIN
2. Default PIN is `123456` for Primary User
3. Use "Show PIN" toggle to verify what you typed
4. Click "Back" to select a different user if needed

### "PIN must be exactly 6 digits"
**Cause:** Attempted to submit with less than 6 digits

**Solution:**
1. Ensure you enter all 6 digits
2. The system auto-submits when 6 digits are entered
3. Use the numeric keypad to enter digits

### "Maximum attempts reached. Please restart the application."
**Cause:** 5 failed login attempts

**Solution:**
1. Close the application
2. Restart the application
3. Ensure you have the correct PIN before trying again
4. Contact an administrator if you've forgotten your PIN

### No Users Displayed
**Cause:** No active users in the system

**Solution:**
1. Backend should auto-create Primary User on first run
2. Check backend logs for initialization errors
3. Manually initialize: `curl -X POST http://localhost:8001/api/auth/initialize`

## Tips

### For Faster Login:
1. Remember your user position in the grid
2. Use keyboard shortcuts (if available)
3. Enable "Show PIN" if you frequently mistype

### For Multiple Users:
1. Each user has a unique colored avatar
2. Admin users have a yellow "Admin" badge
3. Staff users have a gray "Staff" badge
4. Avatars show user initials for quick identification

### For Administrators:
1. Create new users through the User Management screen
2. All new users require a 6-digit PIN
3. You can change user PINs through the settings
4. Deactivated users won't appear in the login grid

## Keyboard Shortcuts (Numeric Keypad)

- **0-9:** Enter digit
- **Backspace:** Remove last digit
- **Enter:** Submit PIN (when 6 digits entered)
- **Escape:** Clear all digits

## Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐│
│  │                  │  │                                  ││
│  │  Feature         │  │     Welcome Back                 ││
│  │  Carousel        │  │                                  ││
│  │                  │  │  Select your account to continue ││
│  │  [SVG Icon]      │  │                                  ││
│  │                  │  │  ┌────────┐  ┌────────┐         ││
│  │  Fast Sales      │  │  │   PU   │  │   JS   │         ││
│  │                  │  │  │ Primary│  │  John  │         ││
│  │  Process trans-  │  │  │  User  │  │  Smith │         ││
│  │  actions quickly │  │  │ [Admin]│  │ [Staff]│         ││
│  │                  │  │  └────────┘  └────────┘         ││
│  │                  │  │                                  ││
│  │  ● ○ ○ ○        │  │  ┌────────┐  ┌────────┐         ││
│  │                  │  │  │   MJ   │  │   SK   │         ││
│  │  © 2025 MidLogic│  │  │  Mary  │  │  Sarah │         ││
│  │                  │  │  │  Jones │  │  Kim   │         ││
│  └──────────────────┘  │  │ [Staff]│  │ [Staff]│         ││
│                        │  └────────┘  └────────┘         ││
│                        │                                  ││
│                        └──────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘

After selecting user:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐│
│  │                  │  │  ← Back                          ││
│  │  Feature         │  │                                  ││
│  │  Carousel        │  │      ┌────────┐                 ││
│  │                  │  │      │   PU   │                 ││
│  │  [SVG Icon]      │  │      └────────┘                 ││
│  │                  │  │    Primary User                  ││
│  │  Inventory       │  │  Enter your 6-digit PIN          ││
│  │  Management      │  │                                  ││
│  │                  │  │  ┌──────────────────────────┐   ││
│  │  Track stock     │  │  │ ● ● ● ○ ○ ○              │   ││
│  │  levels in       │  │  └──────────────────────────┘   ││
│  │  real-time       │  │       [Show PIN]                ││
│  │                  │  │                                  ││
│  │  ○ ● ○ ○        │  │  ┌───┬───┬───┐                 ││
│  │                  │  │  │ 1 │ 2 │ 3 │                 ││
│  │  © 2025 MidLogic│  │  ├───┼───┼───┤                 ││
│  │                  │  │  │ 4 │ 5 │ 6 │                 ││
│  └──────────────────┘  │  ├───┼───┼───┤                 ││
│                        │  │ 7 │ 8 │ 9 │                 ││
│                        │  ├───┼───┼───┤                 ││
│                        │  │ ← │ 0 │ ✓ │                 ││
│                        │  └───┴───┴───┘                 ││
│                        │                                  ││
│                        └──────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Support

For technical support or to report issues:
1. Check the backend logs in the terminal
2. Review the `LOGIN_IMPLEMENTATION.md` file
3. Contact your system administrator
4. Check the API documentation at http://localhost:8001/docs

## Version Information

- **Backend Port:** 8001
- **Frontend Port:** 5173
- **PIN Length:** 6 digits (exactly)
- **Default PIN:** 123456
- **Max Attempts:** 5
- **Session Timeout:** Not implemented (future enhancement)

