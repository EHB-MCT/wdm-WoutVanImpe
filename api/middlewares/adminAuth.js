/**
 * Admin authentication middleware to verify admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  // Check if user exists and has admin role
  if (!req.user) {
    return res.status(401).json({ error: "Authenticatie vereist" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Toegang geweigerd. Admin-rechten vereist." });
  }

  next();
};

module.exports = { requireAdmin };