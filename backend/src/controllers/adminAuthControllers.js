// src/controllers/adminControllers.js
const AdminService = require('../services/adminAuthServices');

class AdminController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AdminService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const user = await AdminService.changeUserStatus(userId, status);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = AdminController;
