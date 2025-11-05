// Admin Authentication Controller
// Handles admin login only
// Admin accounts should be created manually in database
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
}

module.exports = AdminController;
