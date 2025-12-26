const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken, refreshTokenIfNeeded } = require("../middlewares");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/users/profile", authenticateToken, refreshTokenIfNeeded, authController.getProfile);
router.put("/users/profile", authenticateToken, refreshTokenIfNeeded, authController.updateProfile);
router.put("/users/password", authenticateToken, refreshTokenIfNeeded, authController.updatePassword);

module.exports = router;