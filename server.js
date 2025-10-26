const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let providers = [];
let bookings = [];

// Helper function to generate unique IDs
const generateId = () => Date.now().toString();

// Register provider endpoint
app.post('/provider/register', async (req, res) => {
    try {
        const { name, phone, email, service_type, experience, password } = req.body;
        
        console.log('Registration attempt:', { name, email, service_type });

        // Validation
        if (!name || !phone || !email || !service_type || !experience || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check if provider already exists
        if (providers.find(p => p.email === email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Provider with this email already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Calculate dynamic pricing based on experience
        const basePrice = 70;
        const experienceBonus = parseInt(experience) * 5;
        const hourlyRate = basePrice + experienceBonus;

        // Create new provider
        const newProvider = {
            id: generateId(),
            name,
            phone,
            email,
            service_type,
            experience: parseInt(experience),
            password: hashedPassword,
            rating: 4.5, // Default rating
            reviews: Math.floor(Math.random() * 100) + 1, // Random reviews for demo
            price: `$${hourlyRate}/hr`,
            description: `Professional ${service_type} services with ${experience} years of experience. Licensed and insured professional.`,
            features: ["Licensed", "Insured", "24/7 Available", "Free Estimate"],
            initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
            is_available: true,
            date_registered: new Date().toISOString()
        };

        providers.push(newProvider);
        
        console.log('Provider registered successfully:', newProvider.name);
        console.log('Total providers:', providers.length);

        res.status(201).json({ 
            success: true, 
            message: 'Provider registered successfully', 
            provider: {
                id: newProvider.id,
                name: newProvider.name,
                email: newProvider.email,
                service_type: newProvider.service_type
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Login provider endpoint
app.post('/provider/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', email);

        // Find provider
        const provider = providers.find(p => p.email === email);
        
        if (!provider) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, provider.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        console.log('Login successful:', provider.name);

        res.json({ 
            success: true,
            message: 'Login successful', 
            provider: {
                id: provider.id,
                name: provider.name,
                email: provider.email,
                service_type: provider.service_type,
                phone: provider.phone,
                experience: provider.experience
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
// User login endpoint (for regular users, not providers)
app.post('/user/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        console.log('User login attempt:', email);

        // For now, accept any email/password combination for demo
        // In production, this should validate against a user database
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Mock user data (replace with database lookup in production)
        const mockUser = {
            id: generateId(),
            email: email,
            firstName: email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + email.split('@')[0].split('.')[0].slice(1),
            lastName: 'User',
            role: 'user'
        };

        // Mock token generation
        const token = 'mock-jwt-token-' + generateId();

        console.log('User login successful:', email);

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: mockUser
        });

    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
app.get('/providers/:serviceType', (req, res) => {
    try {
        const { serviceType } = req.params;
        
        console.log('Fetching providers for service:', serviceType);
        
        const filteredProviders = providers.filter(p => 
            p.service_type === serviceType && p.is_available
        );

        console.log(`Found ${filteredProviders.length} providers for ${serviceType}`);

        // Format providers for the booking service frontend
        const formattedProviders = filteredProviders.map(provider => ({
            id: provider.id,
            name: provider.name,
            initials: provider.initials,
            rating: provider.rating,
            reviews: provider.reviews,
            experience: `${provider.experience} years experience`,
            price: provider.price,
            description: provider.description,
            features: provider.features
        }));

        res.json({
            success: true,
            providers: formattedProviders
        });

    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching providers' 
        });
    }
});

// Get all providers (for testing)
app.get('/providers', (req, res) => {
    res.json({
        success: true,
        providers: providers
    });
});

// Create booking
app.post('/bookings', (req, res) => {
    try {
        const { 
            serviceType, 
            serviceCategory, 
            providerId, 
            customerName, 
            customerEmail, 
            customerPhone, 
            address, 
            problemDescription, 
            preferredDate, 
            preferredTime,
            totalCost 
        } = req.body;

        // Find provider
        const provider = providers.find(p => p.id === providerId);
        
        if (!provider) {
            return res.status(404).json({ 
                success: false, 
                message: 'Provider not found' 
            });
        }

        const newBooking = {
            id: generateId(),
            serviceType,
            serviceCategory,
            providerId,
            providerName: provider.name,
            customerName,
            customerEmail,
            customerPhone,
            address,
            problemDescription,
            preferredDate,
            preferredTime,
            totalCost,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        bookings.push(newBooking);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: newBooking
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating booking' 
        });
    }
});

// Get all bookings (for testing)
app.get('/bookings', (req, res) => {
    res.json({
        success: true,
        bookings: bookings
    });
});

// Add some sample providers for testing
function addSampleProviders() {
    const sampleProviders = [
        {
            id: generateId(),
            name: "Mike Plumbing Pros",
            phone: "555-0101",
            email: "mike@plumbing.com",
            service_type: "plumbing",
            experience: 10,
            password: "$2a$10$examplehashedpassword",
            rating: 4.8,
            reviews: 124,
            price: "$120/hr",
            description: "Specialized in residential plumbing with quick response times and quality service guaranteed.",
            features: ["24/7 Available", "Licensed", "Free Estimate"],
            initials: "MP",
            is_available: true,
            date_registered: new Date().toISOString()
        },
        {
            id: generateId(),
            name: "Electric Pro",
            phone: "555-0102",
            email: "contact@electricpro.com",
            service_type: "electrical",
            experience: 8,
            password: "$2a$10$examplehashedpassword",
            rating: 4.7,
            reviews: 89,
            price: "$110/hr",
            description: "Licensed electricians providing safe and reliable electrical services for homes and businesses.",
            features: ["Licensed", "Insured", "24/7 Emergency"],
            initials: "EP",
            is_available: true,
            date_registered: new Date().toISOString()
        }
    ];

    providers.push(...sampleProviders);
    console.log('Added sample providers for testing');
}

// Initialize sample data
addSampleProviders();

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📝 Provider registration available at /provider/register');
    console.log('🔑 Provider login available at /provider/login');
    console.log('👤 User login available at /user/login');
    console.log('👥 Providers API available at /providers/:serviceType');
    console.log('📅 Bookings API available at /bookings');
    console.log('💡 Sample providers added for testing');
});


