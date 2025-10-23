const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/db");
const User = require("../models/user");
const Role = require("../models/role");

User.initModel(sequelize);
Role.initModel(sequelize);

const authService = {
  register: async (data) => {
    const { full_name, email, password, role_id = 2 } = data;
    if (!full_name || !email || !password) {
      throw new Error("Missing required fields");
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) throw new Error("Email already registered");

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password_hash: hash,
      role_id,
    });

    return user;
  },

  login: async (data) => {
    const { email, password } = data;
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Invalid password");

    const token = jwt.sign(
      { id: user.id, role_id: user.role_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return token;
  },
};

module.exports = authService;
