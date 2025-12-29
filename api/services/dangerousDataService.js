const db = require("../config/database");

/**
 * Service class for handling dangerous data extraction and user statistics
 */
class DangerousDataService {
  /**
   * Calculate comprehensive user statistics for admin dashboard
   * @param {number} userId - User ID
   * @returns {Object} - User statistics and risk assessments
   */
  async calculateUserStats(userId) {
    try {
      // Get user基本信息
      const user = await db("users")
        .where("id", userId)
        .select("id", "username", "email", "role", "created_at")
        .first();

      if (!user) {
        throw new Error("Gebruiker niet gevonden");
      }

      // Get user's receipts with metadata
      const receipts = await db("receipts")
        .leftJoin("dangerous_receipt_metadata", "receipts.id", "dangerous_receipt_metadata.receipt_id")
        .where("receipts.user_id", userId)
        .select(
          "receipts.*",
          "dangerous_receipt_metadata.payment_method",
          "dangerous_receipt_metadata.card_network",
          "dangerous_receipt_metadata.card_fingerprint",
          "dangerous_receipt_metadata.bank_name",
          "dangerous_receipt_metadata.wealth_rating",
          "dangerous_receipt_metadata.health_score",
          "dangerous_receipt_metadata.sin_score",
          "dangerous_receipt_metadata.urgency_score",
          "dangerous_receipt_metadata.store_location",
          "dangerous_receipt_metadata.geographic_pattern",
          "dangerous_receipt_metadata.time_category",
          "dangerous_receipt_metadata.ai_flag"
        );

      // Calculate statistics
      const stats = {
        user: user,
        financial: this.calculateFinancialStats(receipts),
        behavior: this.calculateBehaviorStats(receipts),
        location: this.calculateLocationStats(receipts),
        risk: this.calculateRiskStats(receipts)
      };

      return stats;
    } catch (error) {
      throw new Error(`Fout bij het berekenen van gebruikersstatistieken: ${error.message}`);
    }
  }

  /**
   * Calculate financial statistics
   */
  calculateFinancialStats(receipts) {
    const cards = new Set();
    const banks = new Set();
    const totalSpent = receipts.reduce((sum, r) => sum + parseFloat(r.total_amount), 0);
    const avgTransaction = receipts.length > 0 ? totalSpent / receipts.length : 0;

    receipts.forEach(receipt => {
      if (receipt.card_fingerprint) {
        cards.add(receipt.card_fingerprint);
      }
      if (receipt.bank_name) {
        banks.add(receipt.bank_name);
      }
    });

    return {
      total_spent: totalSpent,
      transaction_count: receipts.length,
      average_transaction: avgTransaction,
      unique_cards_count: cards.size,
      unique_banks_count: banks.size,
      unique_cards: Array.from(cards),
      unique_banks: Array.from(banks),
      payment_methods: this.getPaymentMethodDistribution(receipts)
    };
  }

  /**
   * Calculate behavioral statistics
   */
  calculateBehaviorStats(receipts) {
    const healthScores = receipts.filter(r => r.health_score !== null).map(r => r.health_score);
    const sinScores = receipts.filter(r => r.sin_score !== null).map(r => r.sin_score);
    const urgencyScores = receipts.filter(r => r.urgency_score !== null).map(r => r.urgency_score);

    return {
      average_health_score: healthScores.length > 0 ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length : 0,
      average_sin_score: sinScores.length > 0 ? sinScores.reduce((a, b) => a + b, 0) / sinScores.length : 0,
      average_urgency_score: urgencyScores.length > 0 ? urgencyScores.reduce((a, b) => a + b, 0) / urgencyScores.length : 0,
      ai_flags: this.getAIFlagDistribution(receipts)
    };
  }

  /**
   * Calculate location statistics
   */
  calculateLocationStats(receipts) {
    const locations = {};
    const timeCategories = {};

    receipts.forEach(receipt => {
      // Location distribution
      const location = receipt.store_location || 'Onbekend';
      locations[location] = (locations[location] || 0) + 1;

      // Time category distribution
      const timeCat = receipt.time_category || 'Onbekend';
      timeCategories[timeCat] = (timeCategories[timeCat] || 0) + 1;
    });

    return {
      location_distribution: locations,
      time_distribution: timeCategories,
      geographic_patterns: this.getGeographicPatternDistribution(receipts)
    };
  }

  /**
   * Calculate risk assessments
   */
  calculateRiskStats(receipts) {
    const uniqueCards = new Set();
    let highSinScoreCount = 0;
    let highUrgencyCount = 0;
    let nightOwlPurchases = 0;

    receipts.forEach(receipt => {
      if (receipt.card_fingerprint) {
        uniqueCards.add(receipt.card_fingerprint);
      }
      if (receipt.sin_score && receipt.sin_score > 70) {
        highSinScoreCount++;
      }
      if (receipt.urgency_score && receipt.urgency_score > 7) {
        highUrgencyCount++;
      }
      if (receipt.time_category === 'Night_Owl') {
        nightOwlPurchases++;
      }
    });

    const riskScore = this.calculateOverallRiskScore(uniqueCards.size, highSinScoreCount, nightOwlPurchases);

    return {
      overall_risk_score: riskScore,
      risk_factors: {
        multiple_cards: uniqueCards.size > 3 ? 'Hoog' : uniqueCards.size > 1 ? 'Gemiddeld' : 'Laag',
        high_sin_activity: highSinScoreCount > receipts.length * 0.3 ? 'Hoog' : 'Laag',
        night_activity: nightOwlPurchases > receipts.length * 0.2 ? 'Hoog' : 'Laag'
      },
      intervention_needed: riskScore > 7,
      warnings: this.generateWarnings(uniqueCards.size, highSinScoreCount, nightOwlPurchases)
    };
  }

  /**
   * Calculate overall risk score (1-10)
   */
  calculateOverallRiskScore(cardCount, highSinCount, nightOwlCount) {
    let score = 1;
    
    // Multiple cards risk
    if (cardCount > 3) score += 3;
    else if (cardCount > 1) score += 1;
    
    // High sin activity risk
    if (highSinCount > 2) score += 3;
    else if (highSinCount > 0) score += 1;
    
    // Night activity risk
    if (nightOwlCount > 1) score += 2;
    else if (nightOwlCount > 0) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Generate warnings based on risk factors
   */
  generateWarnings(cardCount, highSinCount, nightOwlCount) {
    const warnings = [];
    
    if (cardCount > 3) {
      warnings.push("Meerdere bankkaarten gedetecteerd - mogelijk risico op schulden");
    }
    if (highSinCount > 2) {
      warnings.push("Hoge sin_score - mogelijke verslavingsrisico's");
    }
    if (nightOwlCount > 1) {
      warnings.push("Nachtelijke aankopen - mogelijk indicatie van stress/impulsiviteit");
    }
    
    return warnings;
  }

  /**
   * Get payment method distribution
   */
  getPaymentMethodDistribution(receipts) {
    const methods = {};
    receipts.forEach(receipt => {
      const method = receipt.payment_method || 'Onbekend';
      methods[method] = (methods[method] || 0) + 1;
    });
    return methods;
  }

  /**
   * Get AI flag distribution
   */
  getAIFlagDistribution(receipts) {
    const flags = {};
    receipts.forEach(receipt => {
      if (receipt.ai_flag) {
        flags[receipt.ai_flag] = (flags[receipt.ai_flag] || 0) + 1;
      }
    });
    return flags;
  }

  /**
   * Get geographic pattern distribution
   */
  getGeographicPatternDistribution(receipts) {
    const patterns = {};
    receipts.forEach(receipt => {
      if (receipt.geographic_pattern) {
        patterns[receipt.geographic_pattern] = (patterns[receipt.geographic_pattern] || 0) + 1;
      }
    });
    return patterns;
  }

  /**
   * Get global statistics for admin dashboard
   */
  async getGlobalStats() {
    try {
      const totalUsers = await db("users").count("id as count").first();
      const totalReceipts = await db("receipts").count("id as count").first();
      const totalCards = await db("dangerous_receipt_metadata")
        .whereNotNull("card_fingerprint")
        .countDistinct("card_fingerprint as count")
        .first();

      // Get user risk distribution
      const users = await db("users").select("id");
      const riskDistribution = { laag: 0, gemiddeld: 0, hoog: 0 };

      for (const user of users) {
        try {
          const stats = await this.calculateUserStats(user.id);
          const riskScore = stats.risk.overall_risk_score;
          
          if (riskScore <= 3) riskDistribution.laag++;
          else if (riskScore <= 7) riskDistribution.gemiddeld++;
          else riskDistribution.hoog++;
        } catch (error) {
          // Skip users with no data
        }
      }

      return {
        total_users: parseInt(totalUsers.count),
        total_receipts: parseInt(totalReceipts.count),
        total_unique_cards: parseInt(totalCards.count),
        risk_distribution: riskDistribution,
        average_cards_per_user: totalUsers.count > 0 ? parseInt(totalCards.count) / parseInt(totalUsers.count) : 0
      };
    } catch (error) {
      throw new Error(`Fout bij het ophalen van globale statistieken: ${error.message}`);
    }
  }
}

module.exports = new DangerousDataService();