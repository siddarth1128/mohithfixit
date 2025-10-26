# FixItNow - Testing & Connection Verification Guide

## 🎯 Why This Guide Exists

You're having login issues? This comprehensive testing suite will help you:
- ✅ Verify all backend servers are running
- ✅ Test frontend-backend connections
- ✅ Identify configuration problems
- ✅ Get step-by-step fixes for common issues

## 🚀 Quick Start - Fix Login Issues NOW

### 1. Start Both Servers

**Windows Users:**
```bash
# Double-click this file:
start-servers.bat

# OR run manually in Command Prompt:
cd fixitnow_2
start-servers.bat
```

**Mac/Linux Users:**
```bash
chmod +x start-servers.sh
./start-servers.sh
```

**Manual Start (All Platforms):**
```bash
# Terminal/CMD Window 1:
cd backend
npm install
npm start

# Terminal/CMD Window 2 (NEW WINDOW):
npm install
npm start
```

### 2. Run the Connection Test

Open this file in your web browser:
```
fixitnow_2/tests/test-connections.html
```

**The test will automatically:**
- ✅ Check if servers are running
- ✅ Test all API endpoints
- ✅ Verify user registration/login
- ✅ Test provider services
- ✅ Show you exactly what's broken
- ✅ Give you specific fix instructions

### 3. Follow the Recommendations

The test page will show you:
- 🟢 **Green (✓)**: Working correctly
- 🔴 **Red (✗)**: Needs fixing
- 🟡 **Yellow (⚠)**: Warning/Optional

## 📊 What Gets Tested

### Server Connectivity Tests
- **Port 4000** - Root Server (Provider services, bookings)
- **Port 6000** - Backend Server (User authentication, requires MongoDB)
- **Port 9000** - Expected by some frontend files (not configured)

### User Authentication Tests (Port 6000)
- User registration endpoint
- User login endpoint
- JWT token generation
- Error handling for wrong passwords
- MongoDB connection

### Provider Services Tests (Port 4000)
- Provider registration
- Provider login
- Get providers by service type
- Booking creation
- Sample data availability

### Frontend-Backend Mapping
- Verifies which HTML files connect to which ports
- Identifies port mismatches
- Shows which files won't work

## 🐛 Common Problems & Solutions

### Problem 1: "Cannot Login" - No Servers Running

**Symptoms:**
- Login button does nothing
- Browser console shows "Failed to fetch"
- Test shows both servers offline

**Solution:**
```bash
# Start BOTH servers:
# Terminal 1:
cd backend
npm start

# Terminal 2:
npm start
```

**Wait 10 seconds**, then try again!

---

### Problem 2: User Login Not Working (Port 6000 Issue)

**Symptoms:**
- Provider login might work
- User login fails
- Test shows "Backend Server OFFLINE"

**Solution:**
```bash
cd backend
npm install
npm start
```

**Also Check MongoDB:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

### Problem 3: Provider Login Not Working (Port 4000 Issue)

**Symptoms:**
- User login might work
- Cannot book services
- Test shows "Root Server OFFLINE"

**Solution:**
```bash
npm install
npm start
```

---

### Problem 4: "Port 9000 Connection Refused"

**Symptoms:**
- Browser console error about localhost:9000
- Some pages don't load providers

**Why This Happens:**
Some HTML files expect port 9000, but no server is running there.

**Solution A - Use Correct Files:**
Use these files (they point to port 4000):
- ✅ `public/book_service.html`
- ✅ `user_login.html`
- ✅ `user_register.html`

Avoid these files (they expect port 9000):
- ❌ `book_service.html` (root folder)
- ❌ `service/provider_login.html`
- ❌ `service/provider_register.html`

**Solution B - Fix the Files:**
In the files expecting port 9000, change:
```javascript
http://localhost:9000
```
to:
```javascript
http://localhost:4000
```

---

### Problem 5: MongoDB Not Running (Port 6000 needs it)

**Symptoms:**
- Backend server crashes on start
- "MongoNetworkError" in terminal
- User login/register fails

**Solution:**

**Install MongoDB (First Time):**

*Windows:*
1. Download: https://www.mongodb.com/try/download/community
2. Install with default options
3. MongoDB should start automatically

*Mac:*
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

*Linux:*
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Start MongoDB (If Installed):**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

## 📝 Running the Test Suite

### Option 1: HTML Test Page (Recommended)

**Best for:** Visual feedback, easy to understand

1. Open in browser: `fixitnow_2/tests/test-connections.html`
2. Tests run automatically
3. Review color-coded results
4. Follow the recommendations

**Features:**
- 🎨 Beautiful visual interface
- 📊 Real-time progress bar
- 🔍 Detailed error messages
- 💡 Automatic recommendations
- 🖥️ Server status dashboard

### Option 2: Node.js Test Script

**Best for:** Command-line users, CI/CD pipelines

```bash
# Install dependencies (first time only)
npm install axios chalk

# Run tests
node tests/test-connections.js
```

**Features:**
- 🖥️ Terminal-based output
- 📊 Comprehensive test results
- 📝 Detailed logging
- 🎯 Exit codes for automation

---

## 🎓 Understanding Your Architecture

### Server Overview

```
FixItNow Application
├── Backend Server (Port 6000)
│   ├── User Authentication (Login/Register)
│   ├── JWT Token Management
│   ├── Password Reset
│   └── Requires: MongoDB
│
└── Root Server (Port 4000)
    ├── Provider Registration/Login
    ├── Provider Services Management
    ├── Booking System
    └── Requires: In-memory storage (no database)
```

### Frontend-Backend Connections

```
USER LOGIN FLOW:
user_login.html → Port 6000 → MongoDB → JWT Token → Success

PROVIDER LOGIN FLOW:
service/provider_login.html → Port 9000 (BROKEN!) 
                            → Should be Port 4000

BOOKING FLOW:
book_service.html → Port 9000 (BROKEN!)
public/book_service.html → Port 4000 (WORKS!)
```

---

## ✅ Pre-Login Checklist

Before trying to login, verify:

- [ ] Node.js is installed (`node --version`)
- [ ] NPM is installed (`npm --version`)
- [ ] Dependencies installed in root (`npm install`)
- [ ] Dependencies installed in backend (`cd backend && npm install`)
- [ ] MongoDB is running (for user login)
- [ ] Backend server is running (Terminal 1 shows "Server running on port 6000")
- [ ] Root server is running (Terminal 2 shows "Server running on http://localhost:4000")
- [ ] No error messages in either terminal
- [ ] http://localhost:4000 shows JSON response
- [ ] http://localhost:6000 shows JSON response

---

## 🔧 Advanced Troubleshooting

### Check Server Logs

Good log output:
```
✓ Server running on port 4000
✓ Provider registration available
✓ Sample providers added
```

Bad log output:
```
✗ Error: Cannot find module 'express'
  → Fix: npm install

✗ Error: EADDRINUSE
  → Fix: Port already in use, kill process

✗ MongoNetworkError
  → Fix: Start MongoDB
```

### Kill Processes on Port

If you get "Port already in use":

**Windows:**
```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:4000 | xargs kill -9
```

### Reset Everything

Nuclear option if nothing works:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Delete node_modules
rm -rf node_modules backend/node_modules

# 3. Clean npm cache
npm cache clean --force

# 4. Reinstall
npm install
cd backend && npm install && cd ..

# 5. Restart servers
cd backend && npm start &
cd .. && npm start
```

---

## 📚 Test Files Reference

### Main Test Files
- `tests/test-connections.html` - Interactive visual test suite
- `tests/test-connections.js` - Node.js command-line test suite
- `tests/README.md` - Detailed testing documentation
- `tests/QUICK-FIX-LOGIN.md` - Fast troubleshooting guide

### Helper Scripts
- `start-servers.bat` - Windows server startup script
- `start-servers.sh` - Mac/Linux server startup script

---

## 📞 Getting Help

### Step 1: Run the Automated Tests
```
Open: tests/test-connections.html
```
Take a screenshot of the results.

### Step 2: Check Browser Console
Press `F12` → Console tab → Screenshot any red errors

### Step 3: Check Server Terminals
Screenshot both terminal windows showing the servers

### Step 4: Gather Information
- Which login page are you using?
- What error message do you see?
- Do tests pass or fail?
- Are both servers running?

---

## 🎯 Quick Reference Card

### Start Servers
```bash
Terminal 1: cd backend && npm start
Terminal 2: npm start
```

### Test Connection
```
Browser: open tests/test-connections.html
```

### Check if Working
```
http://localhost:4000  → Should show JSON
http://localhost:6000  → Should show JSON
```

### Login Pages
```
Users:     user_login.html → Port 6000
Providers: service/provider_login.html → Port 9000 (broken!)
```

### Common Ports
```
4000 → Root Server (Providers, Bookings)
6000 → Backend Server (Users, Auth)
9000 → Not Running (needs fixing)
```

---

## ✨ Success Indicators

You know everything is working when:

✅ Both servers show "running" in terminals  
✅ No red errors in terminal output  
✅ Test page shows mostly green checkmarks  
✅ Can register new account  
✅ Can login with that account  
✅ Can browse providers  
✅ Can create bookings  

---

## 🚀 Next Steps After Tests Pass

1. **Create Test Accounts**
   - Register as user
   - Register as provider
   - Test login with both

2. **Test Core Features**
   - Browse service providers
   - Create a booking
   - View booking confirmation

3. **Fix Port 9000 Issues**
   - Update HTML files to use port 4000
   - OR configure root server to use port 9000

4. **Deploy**
   - Update URLs from localhost to production
   - Set up environment variables
   - Configure production MongoDB

---

**Need More Help?**

📖 Read: `tests/QUICK-FIX-LOGIN.md` - Fast troubleshooting  
📖 Read: `tests/README.md` - Detailed test documentation  
🧪 Run: `tests/test-connections.html` - Visual test suite  
💻 Run: `node tests/test-connections.js` - CLI test suite

**Good luck! 🎉**