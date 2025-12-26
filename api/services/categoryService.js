const db = require("../config/database");

/**
 * Service class for handling category operations
 */
class CategoryService {
  /**
   * Get all categories
   * @returns {Array} - Array of categories
   */
  async getAllCategories() {
    return await db("categories").select("*").orderBy("name");
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name
   * @returns {Object} - Created category
   */
  async createCategory(categoryData) {
    const { name } = categoryData;

    try {
      const [newCategory] = await db("categories")
        .insert({ name: name.trim() })
        .returning("*");
      
      return newCategory;
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Deze categorie bestaat al.");
      }
      throw error;
    }
  }
}

module.exports = new CategoryService();