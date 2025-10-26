const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  userType: {
    type: String,
    enum: ['customer', 'professional'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  refreshTokens: [{
    token: String,
    expires: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Password Reset Token Schema
const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function(rememberMe = false) {
  const accessToken = jwt.sign(
    { 
      userId: this._id,
      email: this.email 
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    { expiresIn: rememberMe ? '7d' : '1d' }
  );

  if (rememberMe) {
    const refreshToken = jwt.sign(
      { userId: this._id },
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
      { expiresIn: '30d' }
    );

    // Store refresh token
    this.refreshTokens.push({
      token: refreshToken,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Keep only last 5 refresh tokens
    if (this.refreshTokens.length > 5) {
      this.refreshTokens = this.refreshTokens.slice(-5);
    }

    this.save();

    return { accessToken, refreshToken };
  }

  return { accessToken };
};

// Models
const User = mongoose.model('User', userSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

// Email configuration (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here');
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid.' 
    });
  }
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, userType = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType
    });

    await user.save();

    // Generate token
    const { accessToken } = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          userType: user.userType
        },
        token: accessToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in registration',
      error: error.message
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const tokens = user.generateAuthToken(rememberMe);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          userType: user.userType
        },
        ...tokens
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message
    });
  }
});

// Refresh Token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists and is not expired
    const tokenExists = user.refreshTokens.some(tokenObj => 
      tokenObj.token === refreshToken && tokenObj.expires > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid'
      });
    }

    // Generate new access token
    const { accessToken } = user.generateAuthToken(true);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token
    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    });

    // Send email (in production, use your actual domain)
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&id=${user._id}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - FixItNow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3c72;">Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" 
             style="background: #1e3c72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>FixItNow Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset email'
    });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, userId, password } = req.body;

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({
      userId,
      token: hashedToken,
      expires: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update user password
    const user = await User.findById(userId);
    user.password = password;
    await user.save();

    // Delete used reset token
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// Get Current User
app.get('/api/auth/me', auth, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// Logout
app.post('/api/auth/logout', auth, async (req, res) => {
  try {
    // Remove all refresh tokens
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshTokens: [] }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'FixItNow API is running!',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
        'forgot-password': 'POST /api/auth/forgot-password',
        'reset-password': 'POST /api/auth/reset-password'
      }
    }
  });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});