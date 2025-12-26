const categoryService = require("../services/categoryService");

/**
 * Controller class for handling category requests
 */
class CategoryController {
  /**
   * Handle get all categories request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Categorien ophalen fout:", error);
      res.status(500).json({ error: "Er ging iets mis bij het ophalen van categorieën." });
    }
  }

  /**
   * Handle create category request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createCategory(req, res, next) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Categorie naam is verplicht." });
      }

      const newCategory = await categoryService.createCategory({ name });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Categorie aanmaken fout:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CategoryController();