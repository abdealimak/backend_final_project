/**
 * Auth Controller
 * 
 * Handles:
 * 1. Local registration (email + password + bcrypt)
 * 2. Local login (email + password → JWT)
 * 3. Firebase authentication (Firebase ID token → app JWT)
 * 
 * Authentication Flow:
 * - LOCAL: User sends email/password → backend verifies with bcrypt → issues JWT
 * - FIREBASE: Frontend logs in via Firebase → sends ID token to backend →
 *   backend verifies with Firebase Admin SDK → finds/creates user → issues JWT
 */
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const firebaseAdmin = require('../config/firebase');

/**
 * POST /api/auth/register
 * Register a new user with email and password (local auth)
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // SECURITY: Prevent users from registering as admin
    const safeRole = role === 'merchant' ? 'merchant' : 'customer';

    // Hash password with bcrypt (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: safeRole,
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password (local auth)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (include passwordHash for comparison)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user has a local password (might be Firebase-only)
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Firebase login. Please use Firebase to sign in.',
      });
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
    });
  }
};

/**
 * POST /api/auth/firebase
 * Authenticate using Firebase ID token
 * 
 * Flow:
 * 1. Frontend signs in with Firebase Auth (email/password, Google, etc.)
 * 2. Frontend gets Firebase ID token
 * 3. Frontend sends ID token here
 * 4. Backend verifies with Firebase Admin SDK
 * 5. Backend finds or creates the MongoDB user
 * 6. Backend returns application JWT
 */
const firebaseAuth = async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required',
      });
    }

    // Check if Firebase Admin SDK is configured
    const { firebaseInitialized } = require('../config/firebase');
    if (!firebaseInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not configured. Please use local login (POST /api/auth/login) or configure Firebase credentials in .env',
      });
    }

    // Verify Firebase ID token using Admin SDK
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Find existing user by Firebase UID or email
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email }],
    });

    if (!user) {
      // Create new user — first-time Firebase login
      const safeRole = role === 'merchant' ? 'merchant' : 'customer';

      user = await User.create({
        name: name || decodedToken.email?.split('@')[0] || 'User',
        email,
        firebaseUid: uid,
        role: safeRole,
      });
    } else {
      // Link Firebase UID if not already linked
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate application JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Firebase authentication successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Firebase authentication failed: ' + error.message,
    });
  }
};

module.exports = { register, login, firebaseAuth };
