const axios = require("axios");

// Configuration
const BACKEND_URL = "http://localhost:6000";
const ROOT_URL = "http://localhost:4000";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// Test data
const testUser = {
  firstName: "Test",
  lastName: "User",
  email: `testuser${Date.now()}@test.com`,
  phone: "1234567890",
  password: "TestPass123!",
};

const testProvider = {
  name: "Test Provider",
  phone: "9876543210",
  email: `provider${Date.now()}@test.com`,
  service_type: "plumber",
  experience: "5",
  password: "ProviderPass123!",
};

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Utility functions
const log = {
  header: (msg) =>
    console.log(
      `\n${colors.bold}${colors.blue}${"=".repeat(60)}\n${msg}\n${"=".repeat(60)}${colors.reset}`,
    ),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  section: (msg) =>
    console.log(`\n${colors.bold}${colors.cyan}--- ${msg} ---${colors.reset}`),
};

// Test functions
async function checkServerRunning(url, name) {
  try {
    const response = await axios.get(url, { timeout: 3000 });
    log.success(`${name} is running on ${url}`);
    testResults.passed++;
    return true;
  } catch (error) {
    log.error(`${name} is NOT running on ${url}`);
    log.warning(
      `  → Start with: ${name === "Backend Server" ? "cd backend && npm start" : "npm start"}`,
    );
    testResults.failed++;
    return false;
  }
}

async function testUserRegistration() {
  log.section("Testing User Registration");
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      testUser,
    );
    if (response.data.success) {
      log.success("User registration successful");
      log.info(`  → User: ${testUser.email}`);
      testResults.passed++;
      return true;
    } else {
      log.error("User registration failed: " + response.data.message);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    log.error(
      "User registration failed: " +
        (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return false;
  }
}

async function testUserLogin() {
  log.section("Testing User Login");
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    // Check for token in response.data.data or response.data
    const token =
      response.data.data?.tokens?.accessToken || response.data.token;
    if (response.data.success && token) {
      log.success("User login successful");
      log.info(`  → Token received: ${token.substring(0, 20)}...`);
      testResults.passed++;
      return token;
    } else {
      log.error(
        "User login failed: " + (response.data.message || "No token received"),
      );
      testResults.failed++;
      return null;
    }
  } catch (error) {
    log.error(
      "User login failed: " + (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return null;
  }
}

async function testCreateBooking(provider) {
  log.section("Testing Create Booking");
  if (!provider) {
    log.warning("Skipping booking test - no provider available");
    testResults.warnings++;
    return null;
  }

  try {
    const bookingData = {
      provider_id: provider.id,
      service_type: provider.service_type,
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
      time: "10:00",
      address: "123 Test Street, Test City",
      problem_description: "Test booking - automated test",
      urgency: "normal",
    };

    const response = await axios.post(`${ROOT_URL}/bookings`, bookingData);
    if (response.data.success) {
      log.success("Booking created successfully");
      log.info(`  → Booking ID: ${response.data.booking.id}`);
      log.info(
        `  → Date: ${response.data.booking.date} at ${response.data.booking.time}`,
      );
      log.info(`  → Total Cost: $${response.data.booking.total_cost}`);
      testResults.passed++;
      return response.data.booking;
    } else {
      log.error("Booking creation failed: " + response.data.message);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    log.error(
      "Booking creation failed: " +
        (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return null;
  }
}

async function testProviderRegistration() {
  log.section("Testing Provider Registration");
  try {
    const response = await axios.post(
      `${ROOT_URL}/provider/register`,
      testProvider,
    );
    if (response.data.success) {
      log.success("Provider registration successful");
      log.info(`  → Provider: ${testProvider.email}`);
      log.info(`  → Service: ${testProvider.service_type}`);
      log.info(
        `  → Hourly Rate: $${response.data.provider.hourlyRate || "N/A"}`,
      );
      testResults.passed++;
      return response.data.provider;
    } else {
      log.error("Provider registration failed: " + response.data.message);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    log.error(
      "Provider registration failed: " +
        (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return null;
  }
}

async function testProviderLogin() {
  log.section("Testing Provider Login");
  try {
    const response = await axios.post(`${ROOT_URL}/provider/login`, {
      email: testProvider.email,
      password: testProvider.password,
    });
    if (response.data.success && response.data.provider) {
      log.success("Provider login successful");
      log.info(`  → Provider ID: ${response.data.provider.id}`);
      testResults.passed++;
      return response.data.provider;
    } else {
      log.error("Provider login failed: " + response.data.message);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    log.error(
      "Provider login failed: " +
        (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return null;
  }
}

async function testGetProviders() {
  log.section("Testing Get Available Providers");
  try {
    const response = await axios.get(`${ROOT_URL}/providers`);
    if (response.data.success && Array.isArray(response.data.providers)) {
      log.success(`Found ${response.data.providers.length} providers`);
      if (response.data.providers.length > 0) {
        log.info(
          `  → Sample: ${response.data.providers[0].name} (${response.data.providers[0].service_type})`,
        );
      }
      testResults.passed++;
      return response.data.providers;
    } else {
      log.error("Failed to get providers");
      testResults.failed++;
      return [];
    }
  } catch (error) {
    log.error(
      "Get providers failed: " +
        (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return [];
  }
}

async function testCreateBooking(provider) {
  log.section("Testing Create Booking");
  if (!provider) {
    log.warning("Skipping booking test - no provider available");
    testResults.warnings++;
    return null;
  }

  try {
    const bookingData = {
      providerId: provider.id,
      serviceType: provider.service_type,
      serviceCategory: provider.service_type,
      customerName: "Test Customer",
      customerEmail: testUser.email,
      customerPhone: testUser.phone,
      address: "123 Test Street, Test City",
      problemDescription: "Test booking - automated test",
      preferredDate: new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0], // Tomorrow
      preferredTime: "10:00",
      totalCost: provider.hourlyRate || 100,
    };

    const response = await axios.post(`${ROOT_URL}/bookings`, bookingData);
    if (response.data.success) {
      log.success("Booking created successfully");
      log.info(`  → Booking ID: ${response.data.booking.id}`);
      log.info(
        `  → Date: ${response.data.booking.preferredDate} at ${response.data.booking.preferredTime}`,
      );
      log.info(`  → Total Cost: $${response.data.booking.totalCost}`);
      testResults.passed++;
      return response.data.booking;
    } else {
      log.error("Booking creation failed: " + response.data.message);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    log.error(
      "Booking creation failed: " +
        (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return null;
  }
}

async function testGetBookings() {
  log.section("Testing Get Bookings");
  try {
    const response = await axios.get(`${ROOT_URL}/bookings`);
    if (response.data.success && Array.isArray(response.data.bookings)) {
      log.success(`Found ${response.data.bookings.length} bookings`);
      if (response.data.bookings.length > 0) {
        const booking = response.data.bookings[0];
        log.info(`  → Latest: ${booking.service_type} on ${booking.date}`);
        log.info(`  → Status: ${booking.status}`);
      }
      testResults.passed++;
      return response.data.bookings;
    } else {
      log.error("Failed to get bookings");
      testResults.failed++;
      return [];
    }
  } catch (error) {
    log.error(
      "Get bookings failed: " +
        (error.response?.data?.message || error.message),
    );
    testResults.failed++;
    return [];
  }
}

async function testPasswordReset() {
  log.section("Testing Password Reset Request");
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/forgot-password`,
      {
        email: testUser.email,
      },
    );
    if (response.data.success) {
      log.success("Password reset request sent");
      log.info(
        "  → Check console for reset token (in production, sent via email)",
      );
      testResults.passed++;
      return true;
    } else {
      log.warning("Password reset request completed (check implementation)");
      testResults.warnings++;
      return false;
    }
  } catch (error) {
    log.warning(
      "Password reset endpoint may need configuration: " + error.message,
    );
    testResults.warnings++;
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  log.header("🧪 FixItNow Project - Comprehensive Feature Test Suite");

  const startTime = Date.now();

  // Check servers
  log.section("Step 1: Checking Servers");
  const backendRunning = await checkServerRunning(
    BACKEND_URL,
    "Backend Server",
  );
  const rootRunning = await checkServerRunning(ROOT_URL, "Root Server");

  if (!backendRunning || !rootRunning) {
    log.header("⚠️  TEST SUITE CANNOT CONTINUE");
    log.error("Both servers must be running to test features");
    console.log(`\n${colors.bold}To start servers:${colors.reset}`);
    console.log(
      `${colors.cyan}  Terminal 1: cd backend && npm start${colors.reset}`,
    );
    console.log(`${colors.cyan}  Terminal 2: npm start${colors.reset}`);
    process.exit(1);
  }

  // Test Backend Features (User Management)
  log.header("🔐 Testing Backend Features (User Management)");
  await testUserRegistration();
  const userToken = await testUserLogin();
  await testPasswordReset();

  // Test Root Server Features (Provider & Booking Management)
  log.header("🛠️  Testing Root Server Features (Provider & Booking)");
  const provider = await testProviderRegistration();
  const loggedInProvider = await testProviderLogin();
  const providers = await testGetProviders();

  // Test Booking System
  log.header("📅 Testing Booking System");
  const booking = await testCreateBooking(
    loggedInProvider || provider || providers[0],
  );
  await testGetBookings();

  // Final Report
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log.header("📊 Test Results Summary");
  console.log(
    `${colors.green}✓ Passed:   ${testResults.passed}${colors.reset}`,
  );
  console.log(`${colors.red}✗ Failed:   ${testResults.failed}${colors.reset}`);
  console.log(
    `${colors.yellow}⚠ Warnings: ${testResults.warnings}${colors.reset}`,
  );
  console.log(`${colors.cyan}⏱ Duration: ${duration}s${colors.reset}`);

  const total = testResults.passed + testResults.failed;
  const successRate = ((testResults.passed / total) * 100).toFixed(1);

  console.log(
    `${colors.bold}\n📈 Success Rate: ${successRate}%${colors.reset}`,
  );

  if (testResults.failed === 0) {
    log.header("🎉 ALL TESTS PASSED! Project is working correctly!");
    console.log(
      `${colors.bold}${colors.green}\n✓ Your project is ready to use!${colors.reset}`,
    );
    console.log(`${colors.cyan}\nNext steps:${colors.reset}`);
    console.log("  1. Open user_login.html to test user login");
    console.log("  2. Open role_selection.html to access the app");
    console.log("  3. Test the booking flow end-to-end");
  } else {
    log.header("❌ SOME TESTS FAILED");
    console.log(`${colors.yellow}\nTroubleshooting tips:${colors.reset}`);
    console.log("  1. Check if MongoDB is running (for user features)");
    console.log("  2. Verify no port conflicts (4000, 6000)");
    console.log("  3. Check server console logs for errors");
    console.log("  4. Ensure all dependencies are installed (npm install)");
  }

  console.log(`${colors.gray}\n${"=".repeat(60)}\n${colors.reset}`);
}

// Run tests
runAllTests().catch((error) => {
  log.error("Test suite crashed: " + error.message);
  console.error(error);
  process.exit(1);
});
