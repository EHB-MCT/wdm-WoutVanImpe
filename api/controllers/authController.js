const authService = require("../services/authService");

/**
 * Controller class for handling authentication requests
 */
class AuthController {
  /**
   * Handle user registration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "Vul alle velden in." });
      }

      const result = await authService.registerUser({ username, email, password });

      res.status(201).json({
        message: "Registratie succesvol",
        ...result
      });
    } catch (error) {
      console.error("Registratie fout:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Handle user login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async login(req, res, next) {
    try {
      const { email, password, stayLoggedIn } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Vul email en wachtwoord in." });
      }

      const result = await authService.loginUser({ email, password, stayLoggedIn });

      res.json({
        message: "Inloggen succesvol",
        ...result
      });
    } catch (error) {
      console.error("Login fout:", error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Handle get user profile request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user.userId);
      res.json(user);
    } catch (error) {
      console.error("Profiel ophalen fout:", error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Handle update user profile request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateProfile(req, res, next) {
    try {
      const { username, email } = req.body;

      if (!username && !email) {
        return res.status(400).json({ error: "Vul minimaal één veld in om bij te werken." });
      }

      const updatedUser = await authService.updateUserProfile(req.user.userId, { username, email });
      res.json(updatedUser);
    } catch (error) {
      console.error("Profiel bijwerken fout:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Handle password update request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Huidig en nieuw wachtwoord zijn verplicht." });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Wachtwoord moet minimaal 8 tekens zijn." });
      }

      const result = await authService.updateUserPassword(req.user.userId, { currentPassword, newPassword });
      res.json(result);
    } catch (error) {
      console.error("Wachtwoord wijzigen fout:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();