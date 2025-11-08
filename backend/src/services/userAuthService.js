const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../models');
const { sendVerificationEmail } = require('./emailService');

const { users, roles } = db;

// Generate random token for email verification
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
const generateJWT = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register new user
const registerUser = async (userData) => {
  const { full_name, email, phone, password } = userData;

  // Check if user already exists
  const existingUser = await users.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email đã được sử dụng');
  }

  // Get user role
  const userRole = await roles.findOne({ where: { name: 'user' } });
  if (!userRole) {
    throw new Error('Không tìm thấy role user trong hệ thống');
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Generate verification token
  const email_verification_token = generateVerificationToken();
  const email_verification_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const newUser = await users.create({
    full_name,
    email,
    phone,
    password_hash,
    role_id: userRole.id,
    email_verified: 0,
    email_verification_token,
    email_verification_expires_at,
    status: 1,
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, email_verification_token);
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
    // Don't fail registration if email fails
  }

  return {
    id: newUser.id,
    full_name: newUser.full_name,
    email: newUser.email,
    phone: newUser.phone,
  };
};

// Verify email
const verifyEmail = async (token) => {
  const user = await users.findOne({
    where: { email_verification_token: token },
  });

  if (!user) {
    throw new Error('Token xác thực không hợp lệ hoặc đã được sử dụng. Nếu bạn đã xác thực email, vui lòng đăng nhập.');
  }

  // Check if token expired
  if (new Date() > new Date(user.email_verification_expires_at)) {
    throw new Error('Token xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.');
  }

  // Update user
  await user.update({
    email_verified: 1,
    email_verification_token: null,
    email_verification_expires_at: null,
  });

  return {
    id: user.id,
    email: user.email,
    email_verified: true,
  };
};

// Login user
const loginUser = async (email, password) => {
  // Find user by email
  const user = await users.findOne({ where: { email } });

  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Check if email is verified
  if (!user.email_verified) {
    throw new Error('Vui lòng xác thực email trước khi đăng nhập');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Check if user is active
  if (user.status !== 1) {
    throw new Error('Tài khoản đã bị vô hiệu hóa');
  }

  // Generate JWT token
  const token = generateJWT(user.id, user.email);

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    },
  };
};

// Resend verification email
const resendVerificationEmail = async (email) => {
  const user = await users.findOne({ where: { email } });

  if (!user) {
    throw new Error('Không tìm thấy người dùng với email này');
  }

  if (user.email_verified) {
    throw new Error('Email đã được xác thực');
  }

  // Generate new token
  const email_verification_token = generateVerificationToken();
  const email_verification_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await user.update({
    email_verification_token,
    email_verification_expires_at,
  });

  // Send verification email
  await sendVerificationEmail(email, email_verification_token);

  return {
    message: 'Email xác thực đã được gửi lại',
  };
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  resendVerificationEmail,
};
