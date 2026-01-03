/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error("Global error handler:", err);
  
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Default to 500 server error
  let statusCode = 500;
  let message = "Er ging iets mis.";

  // Handle known error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Toegang geweigerd";
  } else if (err.message) {
    // Custom service errors
    if (err.message.includes("niet gevonden") || err.message.includes("bestaat al")) {
      statusCode = 400;
    } else if (err.message.includes("Toegang") || err.message.includes("ongeldig")) {
      statusCode = 401;
    }
    message = err.message;
  }

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;