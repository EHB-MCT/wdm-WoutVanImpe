const db = require("../config/database");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

/**
 * Service class for handling authentication operations
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password hash
   * @returns {Object} - Registration result with token and user data
   */
  async registerUser(userData) {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingUser = await db("users").where({ email }).orWhere({ username }).first();
    if (existingUser) {
      throw new Error("Gebruiker bestaat al.");
    }

    // Store SHA256 hash directly (password is already hashed from frontend)
    const [newUser] = await db("users")
      .insert({
        username,
        email,
        password_hash: password,
      })
      .returning(["id", "username", "email"]);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: "1h" });

    return { token, user: newUser };
  }

  /**
   * Authenticate user login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Email address
   * @param {string} credentials.password - Password hash
   * @param {boolean} credentials.stayLoggedIn - Whether to extend token duration
   * @returns {Object} - Login result with token and user data
   */
  async loginUser(credentials) {
    const { email, password, stayLoggedIn } = credentials;

    const user = await db("users").where({ email }).first();

    if (!user) {
      throw new Error("Ongeldige inloggegevens.");
    }

    const validPassword = password === user.password_hash;

    if (!validPassword) {
      throw new Error("Ongeldige inloggegevens.");
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: stayLoggedIn === true ? "120h" : "1h" });

    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }

  /**
   * Get user profile information
   * @param {number} userId - User ID
   * @returns {Object} - User profile data
   */
  async getUserProfile(userId) {
    const user = await db("users")
      .where("id", userId)
      .select("id", "username", "email", "created_at", "updated_at")
      .first();

    if (!user) {
      throw new Error("Gebruiker niet gevonden.");
    }

    return user;
  }

  /**
   * Update user profile information
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @param {string} updateData.username - New username (optional)
   * @param {string} updateData.email - New email (optional)
   * @returns {Object} - Updated user data
   */
  async updateUserProfile(userId, updateData) {
    const { username, email } = updateData;

    // Check username uniqueness if provided
    if (username) {
      const existingUser = await db("users")
        .where("username", username)
        .whereNot("id", userId)
        .first();

      if (existingUser) {
        throw new Error("Deze gebruikersnaam is al in gebruik.");
      }
    }

    // Check email uniqueness if provided
    if (email) {
      const existingEmail = await db("users")
        .where("email", email)
        .whereNot("id", userId)
        .first();

      if (existingEmail) {
        throw new Error("Dit emailadres is al in gebruik.");
      }
    }

    const updatedUser = await db("users")
      .where("id", userId)
      .update({
        ...(username && { username: username.trim() }),
        ...(email && { email: email.trim() }),
        updated_at: new Date()
      })
      .returning(["id", "username", "email", "created_at", "updated_at"])
      .first();

    return updatedUser;
  }

  /**
   * Update user password
   * @param {number} userId - User ID
   * @param {Object} passwordData - Password update data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Object} - Update result message
   */
  async updateUserPassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    const user = await db("users")
      .where("id", userId)
      .select("password_hash")
      .first();

    if (!user) {
      throw new Error("Gebruiker niet gevonden.");
    }

    const crypto = require("crypto-js");
    const hashedCurrentPassword = crypto.SHA256(currentPassword).toString();
    
    if (hashedCurrentPassword !== user.password_hash) {
      throw new Error("Huidig wachtwoord is onjuist.");
    }

    const hashedNewPassword = crypto.SHA256(newPassword).toString();

    await db("users")
      .where("id", userId)
      .update({
        password_hash: hashedNewPassword,
        updated_at: new Date()
      });

    return { message: "Wachtwoord succesvol gewijzigd." };
  }
}

module.exports = new AuthService();