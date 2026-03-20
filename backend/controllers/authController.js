const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// ── Helper: generate JWT token ─────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
// ── REGISTER ───────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and password'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  try {
    // 2. Check if email already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 3. Hash the password (10 = salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user to database
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // 5. Generate JWT token
    const token = generateToken(result.insertId, 'customer');

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id:    result.insertId,
        name,
        email,
        role: 'customer'
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── LOGIN ──────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  try {
    // 2. Find user by email
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = rows[0];

    // 3. Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET CURRENT USER ───────────────────────────────────
// GET /api/auth/me  (protected — needs token)
const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      user: rows[0]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };