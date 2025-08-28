require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./services/connectDataBase");

// Routes
const geminiRoutes = require("./routes/geminiCommon");
const tenantAuthRoutes = require("./routes/user/tenants/authRoutes");
const landlordAuthRoutes = require("./routes/user/landlord/authRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Initialize DB
connectDB();

// Register routes
app.use("/tenants", tenantAuthRoutes);
app.use("/landlords", landlordAuthRoutes);
app.use("/classify", geminiRoutes);
app.use("/invoice", invoiceRoutes);

// Start local server only when executed directly (not when imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

module.exports = app;
