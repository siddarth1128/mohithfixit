const axios = require('axios');

// Configuration
const SERVERS = {
    ROOT_SERVER: 'http://localhost:4000',
    BACKEND_SERVER: 'http://localhost:6000',
    PORT_9000: 'http://localhost:9000'
};

const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    serverStatus: {}
};

// Utility functions
function log(message) {
    console.log(message);
}

function logSuccess(message) {
    console.log('✓ ' + message);
    results.passed++;
}

function logError(message, error) {
    console.log('✗ ' + message);
    if (error) {
        console.log('  Error: ' + (error.message || error));
    }
    results.failed++;
}

function logWarning(message) {
    console.log('⚠ ' + message);
    results.warnings++;
}

function logHeader(title) {
    console.log('\n' + '='.repeat(60));
    console.log('  ' + title);
    console.log('='.repeat(60) + '\n');
}

// Test functions
async function testServerConnection(name, url, port) {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        logSuccess(`${name} is ONLINE (${url}) - Status: ${response.status}`);
        results.serverStatus[port] = true;
        return true;
    } catch (error) {
        logError(`${name} is OFFLINE (${url})`, error);
        results.serverStatus[port] = false;
        return false;
    }
}

async function testUserRegistration(baseUrl) {
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '1234567890',
        password: 'Test123!@#'
    };

    try {
        const response = await axios.post(`${baseUrl}/api/auth/register`, testUser, { timeout: 5000 });

        if (response.data.success) {
            logSuccess(`User registration successful at ${baseUrl}`);
            return { success: true, user: testUser };
        } else {
            logError(`User registration failed: ${response.data.message}`);
            return { success: false };
        }
    } catch (error) {
        if (error.response) {
            logError(`User registration failed (${error.response.status}): ${error.response.data?.message || error.message}`);
        } else {
            logError(`User registration network error`, error);
        }
        return { success: false };
    }
}

async function testUserLogin(baseUrl, email, password, shouldSucceed = true) {
    try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
            email: email,
            password: password
        }, { timeout: 5000 });

        if (response.data.success && shouldSucceed) {
            logSuccess(`User login successful at ${baseUrl}`);
            log(`  Token: ${response.data.data.accessToken?.substring(0, 30)}...`);
            return { success: true, data: response.data };
        } else if (!response.data.success && !shouldSucceed) {
            logSuccess(`Login correctly rejected invalid credentials`);
            return { success: true };
        } else {
            logError(`User login unexpected result`);
            return { success: false };
        }
    } catch (error) {
        if (!shouldSucceed && error.response?.status === 400) {
            logSuccess(`Login correctly rejected invalid credentials`);
            return { success: true };
        }
        if (error.response) {
            logError(`User login failed (${error.response.status}): ${error.response.data?.message || error.message}`);
        } else {
            logError(`User login network error`, error);
        }
        return { success: false };
    }
}

async function testProviderRegistration(baseUrl) {
    const testProvider = {
        name: 'Test Provider',
        email: `provider${Date.now()}@example.com`,
        phone: '0987654321',
        service_type: 'plumbing',
        experience: '5',
        password: 'Provider123!@#'
    };

    try {
        const response = await axios.post(`${baseUrl}/provider/register`, testProvider, { timeout: 5000 });

        if (response.data.success) {
            logSuccess(`Provider registration successful at ${baseUrl}`);
            return { success: true, provider: testProvider };
        } else {
            logError(`Provider registration failed: ${response.data.message}`);
            return { success: false };
        }
    } catch (error) {
        if (error.response) {
            logError(`Provider registration failed (${error.response.status}): ${error.response.data?.message || error.message}`);
        } else {
            logError(`Provider registration network error`, error);
        }
        return { success: false };
    }
}

async function testProviderLogin(baseUrl, email, password) {
    try {
        const response = await axios.post(`${baseUrl}/provider/login`, {
            email: email,
            password: password
        }, { timeout: 5000 });

        if (response.data.success) {
            logSuccess(`Provider login successful at ${baseUrl}`);
            log(`  Provider: ${response.data.provider.name}`);
            return { success: true, data: response.data };
        } else {
            logError(`Provider login failed: ${response.data.message}`);
            return { success: false };
        }
    } catch (error) {
        if (error.response) {
            logError(`Provider login failed (${error.response.status}): ${error.response.data?.message || error.message}`);
        } else {
            logError(`Provider login network error`, error);
        }
        return { success: false };
    }
}

async function testGetProviders(baseUrl, serviceType = 'plumbing') {
    try {
        const response = await axios.get(`${baseUrl}/providers/${serviceType}`, { timeout: 5000 });

        if (response.data.success !== undefined) {
            const count = response.data.providers?.length || 0;
            logSuccess(`Get providers successful at ${baseUrl} (Found ${count} providers)`);
            return { success: true };
        } else {
            logError(`Get providers failed: unexpected response format`);
            return { success: false };
        }
    } catch (error) {
        logError(`Get providers failed`, error);
        return { success: false };
    }
}

async function testBooking(baseUrl) {
    const bookingData = {
        serviceType: 'plumbing',
        serviceCategory: 'Plumbing',
        providerId: 'test123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '1234567890',
        address: '123 Test St',
        problemDescription: 'Test problem',
        preferredDate: '2024-01-15',
        preferredTime: '10:00 AM',
        totalCost: 100
    };

    try {
        const response = await axios.post(`${baseUrl}/bookings`, bookingData, { timeout: 5000 });

        if (response.data.success) {
            logSuccess(`Booking endpoint working at ${baseUrl}`);
            log(`  Booking ID: ${response.data.booking?.id || 'N/A'}`);
            return { success: true };
        } else {
            logError(`Booking failed: ${response.data.message}`);
            return { success: false };
        }
    } catch (error) {
        logError(`Booking test failed`, error);
        return { success: false };
    }
}

// Main test execution
async function runAllTests() {
    console.clear();
    logHeader('FixItNow Backend Connection Test Suite');
    log('Starting comprehensive connection tests...\n');

    // Test 1: Server Connectivity
    logHeader('TEST 1: Server Connectivity');
    const rootUp = await testServerConnection('Root Server (Port 4000)', SERVERS.ROOT_SERVER, 4000);
    const backendUp = await testServerConnection('Backend Server (Port 6000)', SERVERS.BACKEND_SERVER, 6000);
    const port9000Up = await testServerConnection('Port 9000 Server', SERVERS.PORT_9000, 9000);

    // Test 2: User Authentication (Port 6000)
    if (backendUp) {
        logHeader('TEST 2: User Authentication (Port 6000)');
        const userReg = await testUserRegistration(SERVERS.BACKEND_SERVER);

        if (userReg.success) {
            await testUserLogin(SERVERS.BACKEND_SERVER, userReg.user.email, userReg.user.password, true);
            await testUserLogin(SERVERS.BACKEND_SERVER, userReg.user.email, 'WrongPassword123', false);
        }
    } else {
        logHeader('TEST 2: User Authentication (Port 6000)');
        logWarning('Skipped - Backend server not running');
    }

    // Test 3: Provider Services (Port 4000)
    if (rootUp) {
        logHeader('TEST 3: Provider Services (Port 4000)');
        const providerReg = await testProviderRegistration(SERVERS.ROOT_SERVER);

        if (providerReg.success) {
            await testProviderLogin(SERVERS.ROOT_SERVER, providerReg.provider.email, providerReg.provider.password);
        }

        await testGetProviders(SERVERS.ROOT_SERVER, 'plumbing');
    } else {
        logHeader('TEST 3: Provider Services (Port 4000)');
        logWarning('Skipped - Root server not running');
    }

    // Test 4: Booking System
    if (rootUp) {
        logHeader('TEST 4: Booking System (Port 4000)');
        await testBooking(SERVERS.ROOT_SERVER);
    } else {
        logHeader('TEST 4: Booking System');
        logWarning('Skipped - Root server not running');
    }

    // Test 5: Frontend-Backend Mapping
    logHeader('TEST 5: Frontend-Backend Mapping Analysis');
    const mappings = [
        { file: 'user_login.html', expects: 'Port 6000', available: backendUp },
        { file: 'user_register.html', expects: 'Port 6000', available: backendUp },
        { file: 'public/book_service.html', expects: 'Port 4000', available: rootUp },
        { file: 'book_service.html', expects: 'Port 4000 (FIXED)', available: rootUp },
        { file: 'service/provider_login.html', expects: 'Port 9000', available: port9000Up },
        { file: 'service/provider_register.html', expects: 'Port 9000', available: port9000Up },
        { file: 'service/provider_dashboard.html', expects: 'Port 9000', available: port9000Up }
    ];

    mappings.forEach(mapping => {
        if (mapping.available) {
            logSuccess(`${mapping.file} → ${mapping.expects} ✓`);
        } else {
            logError(`${mapping.file} → ${mapping.expects} ✗ (Server not running)`);
        }
    });

    // Final Summary
    logHeader('Test Summary');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Warnings: ${results.warnings}`);

    // Recommendations
    logHeader('Recommendations');

    if (!backendUp) {
        console.log('1. Start Backend Server (Port 6000):');
        console.log('   cd backend && npm start');
    }

    if (!rootUp) {
        console.log('2. Start Root Server (Port 4000):');
        console.log('   npm start');
    }

    if (!port9000Up) {
        console.log('3. Port 9000 Issue:');
        console.log('   Several frontend files expect port 9000');
        console.log('   → Update those files to use port 4000');
    }

    // Login Diagnosis
    logHeader('Login Issue Diagnosis');

    if (!backendUp && !rootUp) {
        console.log('🚨 CRITICAL: No servers running!');
        console.log('You cannot login because both servers are down.');
        console.log('\nFix:');
        console.log('  Terminal 1: cd backend && npm start');
        console.log('  Terminal 2: npm start');
    } else if (!backendUp) {
        console.log('⚠ Backend server (Port 6000) not running');
        console.log('User login/register will NOT work.');
        console.log('\nFix: cd backend && npm start');
        console.log('Note: Make sure MongoDB is running');
    } else if (!rootUp) {
        console.log('⚠ Root server (Port 4000) not running');
        console.log('Provider login and booking will NOT work.');
        console.log('\nFix: npm start');
    } else {
        console.log('✅ Both servers are running!');
        console.log('\nIf login still fails:');
        console.log('1. Check which login page you\'re using');
        console.log('2. Check browser console (F12) for errors');
        console.log('3. Make sure MongoDB is running (for user login)');
        console.log('4. Try creating a new account first');
    }

    log('\n' + '='.repeat(60));
    log('Test complete! Check results above.');
    log('='.repeat(60) + '\n');

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error('\n❌ Test suite crashed:', error.message);
    console.error(error);
    process.exit(1);
});
