const axios = require('axios');
const chalk = require('chalk');

// Test Configuration
const SERVERS = {
    ROOT_SERVER: 'http://localhost:4000',
    BACKEND_SERVER: 'http://localhost:6000',
    EXPECTED_PORT_9000: 'http://localhost:9000'
};

const TEST_USER = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    phone: '1234567890',
    password: 'Test123!@#'
};

const TEST_PROVIDER = {
    name: 'Test Provider',
    email: `provider${Date.now()}@example.com`,
    phone: '0987654321',
    service_type: 'plumbing',
    experience: '5',
    password: 'Provider123!@#'
};

let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
};

// Utility Functions
function logHeader(title) {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold.cyan(`  ${title}`));
    console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
    console.log(chalk.green('✓ ') + message);
    testResults.passed++;
    testResults.details.push({ status: 'PASS', message });
}

function logError(message, error) {
    console.log(chalk.red('✗ ') + message);
    if (error) {
        console.log(chalk.gray('  Error: ' + error.message));
    }
    testResults.failed++;
    testResults.details.push({ status: 'FAIL', message, error: error?.message });
}

function logWarning(message) {
    console.log(chalk.yellow('⚠ ') + message);
    testResults.warnings++;
    testResults.details.push({ status: 'WARN', message });
}

function logInfo(message) {
    console.log(chalk.blue('ℹ ') + message);
}

// Test Functions
async function testServerConnection(name, url) {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        logSuccess(`${name} is running at ${url} (Status: ${response.status})`);
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            logError(`${name} is NOT running at ${url}`, error);
        } else {
            logError(`${name} connection error at ${url}`, error);
        }
        return false;
    }
}

async function testUserRegistration(baseUrl) {
    try {
        const response = await axios.post(`${baseUrl}/api/auth/register`, TEST_USER, {
            timeout: 5000
        });

        if (response.data.success) {
            logSuccess(`User registration successful at ${baseUrl}`);
            return response.data;
        } else {
            logError(`User registration failed: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        if (error.response) {
            logError(`User registration failed (${error.response.status}): ${error.response.data?.message || error.message}`, error);
        } else {
            logError(`User registration network error`, error);
        }
        return null;
    }
}

async function testUserLogin(baseUrl, email, password) {
    try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
            email: email,
            password: password
        }, { timeout: 5000 });

        if (response.data.success) {
            logSuccess(`User login successful at ${baseUrl}`);
            logInfo(`  Token received: ${response.data.data.accessToken?.substring(0, 20)}...`);
            return response.data;
        } else {
            logError(`User login failed: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        if (error.response) {
            logError(`User login failed (${error.response.status}): ${error.response.data?.message || error.message}`, error);
        } else {
            logError(`User login network error`, error);
        }
        return null;
    }
}

async function testProviderRegistration(baseUrl) {
    try {
        const response = await axios.post(`${baseUrl}/provider/register`, TEST_PROVIDER, {
            timeout: 5000
        });

        if (response.data.success) {
            logSuccess(`Provider registration successful at ${baseUrl}`);
            return response.data;
        } else {
            logError(`Provider registration failed: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        if (error.response) {
            logError(`Provider registration failed (${error.response.status}): ${error.response.data?.message || error.message}`, error);
        } else {
            logError(`Provider registration network error`, error);
        }
        return null;
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
            return response.data;
        } else {
            logError(`Provider login failed: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        if (error.response) {
            logError(`Provider login failed (${error.response.status}): ${error.response.data?.message || error.message}`, error);
        } else {
            logError(`Provider login network error`, error);
        }
        return null;
    }
}

async function testGetProviders(baseUrl, serviceType = 'plumbing') {
    try {
        const response = await axios.get(`${baseUrl}/providers/${serviceType}`, {
            timeout: 5000
        });

        if (response.data.success !== undefined) {
            const count = response.data.providers?.length || 0;
            logSuccess(`Get providers successful at ${baseUrl} (Found ${count} providers)`);
            return response.data;
        } else {
            logError(`Get providers failed: unexpected response format`);
            return null;
        }
    } catch (error) {
        if (error.response?.status === 404) {
            logError(`Providers endpoint not found at ${baseUrl}`, error);
        } else {
            logError(`Get providers failed`, error);
        }
        return null;
    }
}

async function testBookingEndpoint(baseUrl) {
    try {
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

        const response = await axios.post(`${baseUrl}/bookings`, bookingData, {
            timeout: 5000
        });

        if (response.data.success) {
            logSuccess(`Booking endpoint working at ${baseUrl}`);
            return response.data;
        } else {
            logError(`Booking failed: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        if (error.response?.status === 404) {
            logError(`Bookings endpoint not found at ${baseUrl}`, error);
        } else {
            logError(`Booking test failed`, error);
        }
        return null;
    }
}

async function testNotificationEndpoint(baseUrl) {
    try {
        const notificationData = {
            providerId: 'test123',
            message: 'Test notification'
        };

        const response = await axios.post(`${baseUrl}/notifications`, notificationData, {
            timeout: 5000
        });

        logSuccess(`Notification endpoint working at ${baseUrl}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            logWarning(`Notifications endpoint not found at ${baseUrl} (This is expected - endpoint not implemented)`);
        } else {
            logError(`Notification test failed`, error);
        }
        return null;
    }
}

// Main Test Suite
async function runTests() {
    console.clear();
    logHeader('🧪 FixItNow Backend Connection Test Suite');

    // Test 1: Server Connectivity
    logHeader('TEST 1: Server Connectivity');
    const rootServerUp = await testServerConnection('Root Server (Port 4000)', SERVERS.ROOT_SERVER);
    const backendServerUp = await testServerConnection('Backend Server (Port 6000)', SERVERS.BACKEND_SERVER);
    const port9000Up = await testServerConnection('Port 9000 Server', SERVERS.EXPECTED_PORT_9000);

    // Test 2: Backend Server (Port 6000) - User Authentication
    if (backendServerUp) {
        logHeader('TEST 2: Backend Server (Port 6000) - User Authentication');

        const registrationResult = await testUserRegistration(SERVERS.BACKEND_SERVER);

        if (registrationResult) {
            await testUserLogin(SERVERS.BACKEND_SERVER, TEST_USER.email, TEST_USER.password);
        }

        // Test with wrong password
        logInfo('Testing login with incorrect password...');
        await testUserLogin(SERVERS.BACKEND_SERVER, TEST_USER.email, 'WrongPassword123');
    }

    // Test 3: Root Server (Port 4000) - Provider Services
    if (rootServerUp) {
        logHeader('TEST 3: Root Server (Port 4000) - Provider Services');

        const providerReg = await testProviderRegistration(SERVERS.ROOT_SERVER);

        if (providerReg) {
            await testProviderLogin(SERVERS.ROOT_SERVER, TEST_PROVIDER.email, TEST_PROVIDER.password);
        }

        await testGetProviders(SERVERS.ROOT_SERVER, 'plumbing');
        await testBookingEndpoint(SERVERS.ROOT_SERVER);
    }

    // Test 4: Port 9000 Endpoints (Expected to fail)
    if (port9000Up) {
        logHeader('TEST 4: Port 9000 Endpoints');
        await testProviderRegistration(SERVERS.EXPECTED_PORT_9000);
        await testGetProviders(SERVERS.EXPECTED_PORT_9000);
        await testNotificationEndpoint(SERVERS.EXPECTED_PORT_9000);
    } else {
        logHeader('TEST 4: Port 9000 Endpoints');
        logWarning('Port 9000 server not running - Several frontend pages expect this port');
    }

    // Test 5: Frontend-Backend Mapping Analysis
    logHeader('TEST 5: Frontend-Backend Mapping Analysis');

    const frontendMappings = [
        { file: 'user_login.html', expects: 'Port 6000', available: backendServerUp },
        { file: 'user_register.html', expects: 'Port 6000', available: backendServerUp },
        { file: 'public/book_service.html', expects: 'Port 4000', available: rootServerUp },
        { file: 'book_service.html', expects: 'Port 9000', available: port9000Up },
        { file: 'service/provider_login.html', expects: 'Port 9000', available: port9000Up },
        { file: 'service/provider_register.html', expects: 'Port 9000', available: port9000Up },
        { file: 'service/provider_dashboard.html', expects: 'Port 9000', available: port9000Up }
    ];

    frontendMappings.forEach(mapping => {
        if (mapping.available) {
            logSuccess(`${mapping.file} → ${mapping.expects} ✓`);
        } else {
            logError(`${mapping.file} → ${mapping.expects} ✗ (Server not running)`);
        }
    });

    // Final Summary
    logHeader('📊 Test Summary');
    console.log(chalk.bold(`Total Tests: ${testResults.passed + testResults.failed}`));
    console.log(chalk.green.bold(`Passed: ${testResults.passed}`));
    console.log(chalk.red.bold(`Failed: ${testResults.failed}`));
    console.log(chalk.yellow.bold(`Warnings: ${testResults.warnings}`));

    // Recommendations
    logHeader('💡 Recommendations');

    if (!backendServerUp) {
        console.log(chalk.yellow('1. Start Backend Server (Port 6000):'));
        console.log(chalk.gray('   cd backend && npm start'));
    }

    if (!rootServerUp) {
        console.log(chalk.yellow('2. Start Root Server (Port 4000):'));
        console.log(chalk.gray('   npm start'));
    }

    if (!port9000Up) {
        console.log(chalk.yellow('3. Port 9000 Issue:'));
        console.log(chalk.gray('   Several frontend files expect port 9000, but no server is configured.'));
        console.log(chalk.gray('   → Update frontend files to use port 4000 or 6000'));
        console.log(chalk.gray('   → OR configure a server on port 9000'));
    }

    // Login Issue Diagnosis
    logHeader('🔍 Login Issue Diagnosis');

    if (!backendServerUp && !rootServerUp) {
        console.log(chalk.red.bold('CRITICAL: No servers are running!'));
        console.log(chalk.yellow('You cannot login because both backend servers are down.'));
        console.log(chalk.white('\nTo fix:'));
        console.log(chalk.gray('1. Open Terminal 1: cd backend && npm start'));
        console.log(chalk.gray('2. Open Terminal 2: npm start'));
    } else if (!backendServerUp) {
        console.log(chalk.yellow('Backend server (Port 6000) is not running.'));
        console.log(chalk.white('User login/register will NOT work.'));
        console.log(chalk.gray('Start with: cd backend && npm start'));
    } else if (!rootServerUp) {
        console.log(chalk.yellow('Root server (Port 4000) is not running.'));
        console.log(chalk.white('Provider login/register and booking services will NOT work.'));
        console.log(chalk.gray('Start with: npm start'));
    } else {
        console.log(chalk.green('Both servers are running!'));
        console.log(chalk.white('\nIf you still cannot login, check:'));
        console.log(chalk.gray('1. Which login page are you using?'));
        console.log(chalk.gray('   - user_login.html → needs Port 6000'));
        console.log(chalk.gray('   - service/provider_login.html → expects Port 9000 (NOT running)'));
        console.log(chalk.gray('2. Check browser console for errors (F12)'));
        console.log(chalk.gray('3. Make sure MongoDB is running (for Port 6000)'));
    }

    // Export results
    logHeader('📄 Detailed Results');
    console.log(JSON.stringify(testResults, null, 2));
}

// Run the tests
runTests().catch(error => {
    console.error(chalk.red.bold('\n❌ Test suite crashed:'), error);
    process.exit(1);
});
