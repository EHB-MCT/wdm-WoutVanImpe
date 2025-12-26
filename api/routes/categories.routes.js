const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticateToken, refreshTokenIfNeeded } = require("../middlewares");

// Public route
router.get("/", categoryController.getAllCategories);

// Protected route
router.post("/", authenticateToken, refreshTokenIfNeeded, categoryController.createCategory);

module.exports = router;