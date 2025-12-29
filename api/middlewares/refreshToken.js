const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

/**
 * Middleware to refresh JWT token if needed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const refreshTokenIfNeeded = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    // Validate JWT structure
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid token format for refresh - not a valid JWT structure");
      return next();
    }

    // Decode token without verification to check payload
    const decoded = jwt.decode(token);
    
    if (!decoded || typeof decoded !== "object" || !decoded.exp || !decoded.userId) {
      console.warn("Invalid token payload for refresh - missing required fields");
      return next();
    }

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = decoded.exp - now;
    
    // Only refresh valid tokens expiring within 15 minutes
    if (timeUntilExpiration < 900 && timeUntilExpiration > 0) {
      try {
        const newToken = jwt.sign(
          { userId: decoded.userId, username: decoded.username || "user" }, 
          JWT_SECRET, 
          { expiresIn: "1h" }
        );
        
        res.setHeader("X-New-Token", newToken);
        res.setHeader("X-Token-Refresh", "true");
        console.log("Token automatically refreshed for user:", decoded.userId);
      } catch (signError) {
        console.error("Failed to sign new token:", signError.message);
      }
    } else if (timeUntilExpiration <= 0) {
      console.log("Token already expired, skipping refresh attempt");
    }
    
    next();
  } catch (error) {
    console.error("Token refresh error:", error.message);
    next();
  }
};

module.exports = { refreshTokenIfNeeded };