const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticateToken, refreshTokenIfNeeded } = require("../middlewares");

// All routes are protected
router.get("/", categoryController.getAllCategories);
router.post("/", authenticateToken, refreshTokenIfNeeded, categoryController.createCategory);

module.exports = router;