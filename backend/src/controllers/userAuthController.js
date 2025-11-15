const userAuthService = require('../services/userAuthService');

// Register user
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin (full_name, email, password)',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    }

    const user = await userAuthService.registerUser({
      full_name,
      email,
      phone,
      password,
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Đăng ký thất bại',
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token xác thực không được cung cấp',
      });
    }

    const result = await userAuthService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: 'Email đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.',
      data: result,
    });
  } catch (error) {
    console.error('Verify email error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Xác thực email thất bại',
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mật khẩu',
      });
    }

    const result = await userAuthService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Đăng nhập thất bại',
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email',
      });
    }

    const result = await userAuthService.resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Gửi lại email xác thực thất bại',
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  resendVerification,
};
