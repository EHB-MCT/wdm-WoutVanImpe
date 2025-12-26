const db = require("../config/database");

/**
 * Service class for handling receipt operations
 */
class ReceiptService {
  /**
   * Get all receipts for a user with their items
   * @param {number} userId - User ID
   * @returns {Array} - Array of receipts with items
   */
  async getUserReceipts(userId) {
    const receipts = await db("receipts")
      .where("user_id", userId)
      .select("*")
      .orderBy("purchase_date", "desc")
      .orderBy("created_at", "desc");

    const receiptsWithItems = await Promise.all(
      receipts.map(async (receipt) => {
        const items = await db("receipt_items")
          .where("receipt_id", receipt.id)
          .join("categories", "receipt_items.category_id", "categories.id")
          .select(
            "receipt_items.*",
            "categories.name as category_name"
          );

        return {
          ...receipt,
          items: items.map(item => ({
            id: item.id,
            name: item.product_name,
            category: item.category_name || "Onbekend",
            quantity: item.quantity,
            price: item.price
          }))
        };
      })
    );

    return receiptsWithItems;
  }

  /**
   * Get a specific receipt by ID with items
   * @param {number} receiptId - Receipt ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object} - Receipt with items
   */
  async getReceiptById(receiptId, userId) {
    const receipt = await db("receipts")
      .where({ id: receiptId, user_id: userId })
      .first();

    if (!receipt) {
      throw new Error("Bon niet gevonden.");
    }

    const items = await db("receipt_items")
      .where("receipt_id", receipt.id)
      .join("categories", "receipt_items.category_id", "categories.id")
      .select(
        "receipt_items.*",
        "categories.name as category_name"
      );

    return {
      ...receipt,
      items: items.map(item => ({
        id: item.id,
        name: item.product_name,
        category: item.category_name || "Onbekend",
        quantity: item.quantity,
        price: item.price
      }))
    };
  }

  /**
   * Create a new receipt with items
   * @param {number} userId - User ID
   * @param {Object} receiptData - Receipt data
   * @returns {Object} - Created receipt with items
   */
  async createReceipt(userId, receiptData) {
    const { store_name, purchase_date, purchase_time, payment_method, total_amount, raw_ocr_text, items } = receiptData;

    return await db.transaction(async (trx) => {
      const [newReceipt] = await trx("receipts")
        .insert({
          user_id: userId,
          store_name: store_name.trim(),
          purchase_date,
          purchase_time,
          payment_method: payment_method || null,
          total_amount: Number.parseFloat(total_amount),
          raw_ocr_text: raw_ocr_text || null
        })
        .returning("*");

      const itemsToInsert = await this.prepareItemsForInsert(items, trx, newReceipt.id);

      await trx("receipt_items").insert(itemsToInsert);

      const createdItems = await trx("receipt_items")
        .where("receipt_id", newReceipt.id)
        .join("categories", "receipt_items.category_id", "categories.id")
        .select(
          "receipt_items.*",
          "categories.name as category_name"
        );

      return {
        ...newReceipt,
        items: createdItems.map(item => ({
          id: item.id,
          name: item.product_name,
          category: item.category_name || "Onbekend",
          quantity: item.quantity,
          price: item.price
        }))
      };
    });
  }

  /**
   * Update an existing receipt with items
   * @param {number} receiptId - Receipt ID
   * @param {number} userId - User ID (for authorization)
   * @param {Object} receiptData - Updated receipt data
   * @returns {Object} - Updated receipt with items
   */
  async updateReceipt(receiptId, userId, receiptData) {
    const { store_name, purchase_date, purchase_time, payment_method, total_amount, items } = receiptData;

    return await db.transaction(async (trx) => {
      const existingReceipt = await trx("receipts")
        .where({ id: receiptId, user_id: userId })
        .first();

      if (!existingReceipt) {
        throw new Error("Bon niet gevonden.");
      }

      // Delete existing items
      await trx("receipt_items").where("receipt_id", receiptId).del();

      // Update receipt
      await trx("receipts")
        .where("id", receiptId)
        .update({
          store_name: store_name.trim(),
          purchase_date,
          purchase_time,
          payment_method: payment_method || null,
          total_amount: Number.parseFloat(total_amount)
        });

      const itemsToInsert = await this.prepareItemsForInsert(items, trx, receiptId);

      await trx("receipt_items").insert(itemsToInsert);

      const updatedItems = await trx("receipt_items")
        .where("receipt_id", receiptId)
        .join("categories", "receipt_items.category_id", "categories.id")
        .select(
          "receipt_items.*",
          "categories.name as category_name"
        );

      const updatedReceipt = await trx("receipts").where("id", receiptId).first();

      return {
        ...updatedReceipt,
        items: updatedItems.map(item => ({
          id: item.id,
          name: item.product_name,
          category: item.category_name || "Onbekend",
          quantity: item.quantity,
          price: item.price
        }))
      };
    });
  }

  /**
   * Delete a receipt and its items
   * @param {number} receiptId - Receipt ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object} - Deletion result message
   */
  async deleteReceipt(receiptId, userId) {
    const deletedCount = await db("receipts")
      .where({ id: receiptId, user_id: userId })
      .del();

    if (deletedCount === 0) {
      throw new Error("Bon niet gevonden.");
    }

    return { message: "Bon succesvol verwijderd." };
  }

  /**
   * Prepare items array for database insertion
   * @param {Array} items - Items array from frontend
   * @param {Object} trx - Database transaction object
   * @param {number} receiptId - Receipt ID
   * @returns {Array} - Items prepared for insertion
   */
  async prepareItemsForInsert(items, trx, receiptId = null) {
    const itemsToInsert = [];

    for (const item of items) {
      let categoryId = null;

      if (item.category && item.category !== "Onbekend") {
        const category = await trx("categories")
          .where("name", item.category)
          .select("id")
          .first();
        
        categoryId = category ? category.id : null;
      }

      itemsToInsert.push({
        receipt_id: receiptId,
        category_id: categoryId,
        product_name: item.name.trim(),
        quantity: Number.parseFloat(item.quantity) || 1,
        price: Number.parseFloat(item.price)
      });
    }

    return itemsToInsert;
  }
}

module.exports = new ReceiptService();