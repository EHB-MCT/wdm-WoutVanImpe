const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/receiptController");
const { authenticateToken, refreshTokenIfNeeded } = require("../middlewares");

// All routes are protected
router.get("/", authenticateToken, refreshTokenIfNeeded, receiptController.getAllReceipts);
router.get("/:id", authenticateToken, refreshTokenIfNeeded, receiptController.getReceiptById);
router.post("/", authenticateToken, refreshTokenIfNeeded, receiptController.createReceipt);
router.put("/:id", authenticateToken, refreshTokenIfNeeded, receiptController.updateReceipt);
router.delete("/:id", authenticateToken, refreshTokenIfNeeded, receiptController.deleteReceipt);

module.exports = router;