const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const { requireAdmin } = require("../middlewares/adminAuth");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// All routes are protected
router.get("/users", adminController.getUsers);
router.get("/users/:id/profile", adminController.getUserProfile);
router.get("/stats", adminController.getGlobalStats);

module.exports = router;
