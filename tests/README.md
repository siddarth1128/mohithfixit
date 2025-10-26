# FixItNow Connection Test Suite

## 🎯 Purpose

This test suite helps diagnose connection issues between the frontend and backend servers in the FixItNow application. It's especially useful when you encounter login problems or other connectivity issues.

## 📋 What Gets Tested

### 1. **Server Connectivity**
- Root Server (Port 4000) - Provider services and bookings
- Backend Server (Port 6000) - User authentication
- Port 9000 Server - Expected by some frontend files

### 2. **User Authentication (Port 6000)**
- User registration endpoint
- User login endpoint
- Error handling for invalid credentials
- Token generation

### 3. **Provider Services (Port 4000)**
- Provider registration
- Provider login
- Get providers by service type
- Sample data availability

### 4. **Booking & Notifications**
- Booking creation endpoint
- Notifications endpoint (if implemented)

### 5. **Frontend-Backend Mapping**
- Verifies which frontend files connect to which backend ports
- Identifies misconfigurations

## 🚀 Quick Start

### Option 1: HTML Test Page (Recommended)

1. **Open the test page in your browser:**
   ```
   Open: fixitnow_2/tests/test-connections.html
   ```

2. **The tests will run automatically!**
   - Wait for all tests to complete
   - Review the results
   - Follow the recommendations

### Option 2: Node.js Test Script

1. **Install dependencies:**
   ```bash
   cd fixitnow_2
   npm install axios chalk
   ```

2. **Run the test script:**
   ```bash
   node tests/test-connections.js
   ```

## 📊 Understanding Results

### ✓ Green (Success)
- The endpoint is working correctly
- Server is running and responding

### ✗ Red (Error)
- The endpoint is not working
- Server might be down
- Connection issue detected

### ⚠ Yellow (Warning)
- Feature is missing but expected
- Non-critical issue

## 🔧 Common Issues & Solutions

### Issue 1: "Backend Server is OFFLINE"

**Problem:** User login/register won't work

**Solution:**
```bash
# Open Terminal 1
cd backend
npm install
npm start
```

**Expected Output:**
```
Server is running on port 6000
```

**Note:** Make sure MongoDB is installed and running!

### Issue 2: "Root Server is OFFLINE"

**Problem:** Provider login and booking services won't work

**Solution:**
```bash
# Open Terminal 2 (keep Terminal 1 running)
cd fixitnow_2
npm install
npm start
```

**Expected Output:**
```
🚀 Server running on http://localhost:4000
```

### Issue 3: "Port 9000 Server is OFFLINE"

**Problem:** Some frontend files expect port 9000, but no server is running

**Solutions:**

**Option A: Update Frontend Files**
Change port 9000 references to port 4000:
- `book_service.html`
- `service/provider_login.html`
- `service/provider_register.html`
- `service/provider_dashboard.html`

**Option B: Change Root Server Port**
Edit `server.js`:
```javascript
const PORT = 9000; // Change from 4000 to 9000
```

### Issue 4: "No Servers Running"

**Problem:** Cannot login at all

**Solution:**
Start BOTH servers:

```bash
# Terminal 1
cd backend
npm start

# Terminal 2 (new terminal)
cd fixitnow_2
npm start
```

Wait for both servers to show "running" messages, then try again.

## 🐛 Debugging Login Issues

### Step 1: Identify Which Login Page You're Using

**User Login:** `user_login.html`
- Needs: Backend Server (Port 6000)
- Check: Is backend server running?
- Check: Is MongoDB running?

**Provider Login:** `service/provider_login.html`
- Needs: Root Server (Port 4000) OR Port 9000
- Check: Which port is it configured for?
- Check: Is that server running?

### Step 2: Check Browser Console

1. Press `F12` to open Developer Tools
2. Click on the "Console" tab
3. Look for error messages in red

**Common Errors:**

```
Failed to fetch
→ Server is not running

CORS error
→ Server needs CORS enabled (should be already)

404 Not Found
→ Wrong endpoint or port

401 Unauthorized
→ Wrong credentials or token expired
```

### Step 3: Verify Server is Running

Open your browser and visit:
- http://localhost:4000 (Root Server)
- http://localhost:6000 (Backend Server)

You should see a JSON response, not an error page.

### Step 4: Check Database Connection (Port 6000 only)

The backend server needs MongoDB:

**Windows:**
```bash
# Check if MongoDB is running
net start | findstr MongoDB
```

**Mac/Linux:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# or
sudo systemctl status mongod
```

If MongoDB is not running, start it:

**Windows:**
```bash
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

## 📝 Test Results Interpretation

### All Tests Pass ✅

Great! Your backend connections are working. If you still can't login:
1. Check that you're using the correct credentials
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try registering a new account
4. Check browser console (F12) for errors

### Some Tests Fail ❌

Follow the recommendations provided by the test suite. Usually:
1. Start the missing server(s)
2. Fix port mismatches
3. Install missing dependencies

### All Tests Fail 🚨

**Critical Issue!** Both servers are down:
1. Install dependencies: `npm install` in both directories
2. Start backend server: `cd backend && npm start`
3. Start root server: `npm start` (in root directory)
4. Run tests again

## 🎓 Advanced Troubleshooting

### Check Server Logs

When running the servers, watch the console output:

**Good:**
```
🚀 Server running on http://localhost:4000
✓ Provider registration available
✓ Sample providers added
```

**Bad:**
```
Error: Cannot find module 'express'
→ Run: npm install

Error: EADDRINUSE
→ Port already in use, kill the process or use different port
```

### Kill Processes on Port

If you get "Port already in use" error:

**Windows:**
```bash
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:4000 | xargs kill -9
```

### Reset Everything

If nothing works:

```bash
# Stop all servers (Ctrl+C in terminals)

# Delete node_modules
rm -rf node_modules
rm -rf backend/node_modules

# Reinstall dependencies
npm install
cd backend && npm install

# Restart servers
cd backend && npm start
# (new terminal)
npm start
```

## 📞 Still Having Issues?

If tests pass but login still doesn't work:

1. **Check which HTML file you're opening:**
   - `user_login.html` → Port 6000
   - `service/provider_login.html` → Port 9000 (probably not running)

2. **Try using the correct login page:**
   - For customers: `user_login.html`
   - For providers: Register first, then login

3. **Create a new test account:**
   - Go to registration page
   - Use a unique email
   - Remember the password

4. **Check MongoDB (for user login):**
   ```bash
   # Connect to MongoDB
   mongo
   # or
   mongosh
   
   # Check if database exists
   show dbs
   use fixitnow
   db.users.find()
   ```

## 📊 Expected Test Output

When everything is working correctly, you should see:

```
✓ Root Server is ONLINE
✓ Backend Server is ONLINE
✗ Port 9000 Server is OFFLINE (Expected)

✓ User Registration Working
✓ User Login Working
✓ Login Error Handling Working

✓ Provider Registration Working
✓ Provider Login Working
✓ Get Providers Working

✓ Booking Endpoint Working
⚠ Notifications Endpoint Not Found (Expected)

Results:
- Passed: 10-12 tests
- Failed: 1-2 tests (Port 9000, Notifications)
- Warnings: 1-2
```

## 🔄 Running Tests Regularly

Run these tests:
- After pulling new code
- Before deploying
- When experiencing connectivity issues
- After changing server configurations
- When setting up on a new machine

---

**Need Help?**
- Check the main README in the root directory
- Review server.js files for configuration
- Check package.json for dependencies
- Look at HTML files for API endpoint configurations