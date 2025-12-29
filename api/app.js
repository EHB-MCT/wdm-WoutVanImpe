const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");
const errorHandler = require("./utils/errorHandler");

// Import routes
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/categories.routes");
const receiptRoutes = require("./routes/receipts.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});

module.exports = app;