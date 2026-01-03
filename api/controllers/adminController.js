const dangerousDataService = require("../services/dangerousDataService");

/**
 * Controller for admin operations to manage users and statistics.
 */
class AdminController {
  /**
   * Retrieves a list of all users with their associated risk scores and statistics.
   * @param {Object} req - The express request object.
   * @param {Object} res - The express response object.
   * @returns {Promise<void>} Sends a JSON response with the list of users and their risk data.
   */
  async getUsers(req, res) {
    try {
      const db = require("../config/database");
      const users = await db("users")
        .select("id", "username", "email", "role", "created_at")
        .orderBy("created_at", "desc");

      // Add risk scores to each user
      const usersWithRisk = await Promise.all(
        users.map(async (user) => {
          try {
            const stats = await dangerousDataService.calculateUserStats(user.id);
            return {
              ...user,
              risk_score: stats.risk.overall_risk_score,
              risk_level: stats.risk.overall_risk_score <= 3 ? 'laag' :
                stats.risk.overall_risk_score <= 7 ? 'gemiddeld' : 'hoog',
              total_receipts: stats.financial.transaction_count,
              unique_cards: stats.financial.unique_cards_count,
              intervention_needed: stats.risk.intervention_needed
            };
          } catch (error) {
            return {
              ...user,
              risk_score: 0,
              risk_level: 'geen_data',
              total_receipts: 0,
              unique_cards: 0,
              intervention_needed: false
            };
          }
        })
      );

      res.json({
        success: true,
        data: usersWithRisk,
        total: usersWithRisk.length
      });
    } catch (error) {
      console.error("Error in getUsers:", error);
      res.status(500).json({
        success: false,
        error: "Fout bij het ophalen van gebruikers"
      });
    }
  }

  /**
   * Retrieves the detailed profile and statistics for a specific user.
   * @param {Object} req - The express request object containing the user ID in params.
   * @param {Object} res - The express response object.
   * @returns {Promise<void>} Sends a JSON response with the user's detailed profile data.
   */
  async getUserProfile(req, res) {
    try {
      const { id } = req.params;
      const userId = Number.parseInt(id);

      if (Number.isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: "Ongeldig gebruikers ID"
        });
      }

      const profile = await dangerousDataService.calculateUserStats(userId);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      if (error.message.includes("niet gevonden")) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      res.status(500).json({
        success: false,
        error: "Fout bij het ophalen van gebruikersprofiel"
      });
    }
  }

  /**
   * Retrieves global statistics regarding risks and financials.
   * @param {Object} req - The express request object.
   * @param {Object} res - The express response object.
   * @returns {Promise<void>} Sends a JSON response with the global statistics.
   */
  async getGlobalStats(req, res) {
    try {
      const stats = await dangerousDataService.getGlobalStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error in getGlobalStats:", error);
      res.status(500).json({
        success: false,
        error: "Fout bij het ophalen van globale statistieken"
      });
    }
  }
}

module.exports = new AdminController();