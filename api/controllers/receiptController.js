const receiptService = require("../services/receiptService");

/**
 * Controller class for handling receipt requests
 */
class ReceiptController {
  /**
   * Handle get all receipts request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllReceipts(req, res, next) {
    try {
      const receipts = await receiptService.getUserReceipts(req.user.userId);
      res.json(receipts);
    } catch (error) {
      console.error("Bonnen ophalen fout:", error);
      res.status(500).json({ error: "Er ging iets mis bij het ophalen van bonnen." });
    }
  }

  /**
   * Handle get receipt by ID request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getReceiptById(req, res, next) {
    try {
      const { id } = req.params;
      const receipt = await receiptService.getReceiptById(id, req.user.userId);
      res.json(receipt);
    } catch (error) {
      console.error("Bon ophalen fout:", error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Handle create receipt request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createReceipt(req, res, next) {
    try {
      const receiptData = req.body;
      
      if (!receiptData.store_name || !receiptData.purchase_date || !receiptData.purchase_time || 
          !receiptData.total_amount || !receiptData.items || !Array.isArray(receiptData.items)) {
        return res.status(400).json({ error: "Alle verplichte velden moeten ingevuld zijn." });
      }

      if (receiptData.items.length === 0) {
        return res.status(400).json({ error: "Een bon moet minstens één item hebben." });
      }

      const newReceipt = await receiptService.createReceipt(req.user.userId, receiptData);
      res.status(201).json(newReceipt);
    } catch (error) {
      console.error("Bon aanmaken fout:", error);
      res.status(500).json({ error: "Er ging iets mis bij het aanmaken van de bon." });
    }
  }

  /**
   * Handle update receipt request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateReceipt(req, res, next) {
    try {
      const { id } = req.params;
      const receiptData = req.body;
      
      if (!receiptData.store_name || !receiptData.purchase_date || !receiptData.purchase_time || 
          !receiptData.total_amount || !receiptData.items || !Array.isArray(receiptData.items)) {
        return res.status(400).json({ error: "Alle verplichte velden moeten ingevuld zijn." });
      }

      if (receiptData.items.length === 0) {
        return res.status(400).json({ error: "Een bon moet minstens één item hebben." });
      }

      const updatedReceipt = await receiptService.updateReceipt(id, req.user.userId, receiptData);
      res.json(updatedReceipt);
    } catch (error) {
      console.error("Bon bijwerken fout:", error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Handle delete receipt request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteReceipt(req, res, next) {
    try {
      const { id } = req.params;
      const result = await receiptService.deleteReceipt(id, req.user.userId);
      res.json(result);
    } catch (error) {
      console.error("Bon verwijderen fout:", error);
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new ReceiptController();