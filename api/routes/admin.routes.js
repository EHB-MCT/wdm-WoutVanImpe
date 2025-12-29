const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const { requireAdmin } = require("../middlewares/adminAuth");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/users
 * Get list of all users with their risk assessments
 */
router.get("/users", adminController.getUsers);

/**
 * GET /api/admin/users/:id/profile
 * Get detailed profile analysis for a specific user
 */
router.get("/users/:id/profile", adminController.getUserProfile);

/**
 * GET /api/admin/stats
 * Get global system statistics
 */
router.get("/stats", adminController.getGlobalStats);

module.exports = router;