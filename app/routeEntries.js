const geminiRoutes = require("../routes/geminiCommon");
const tenantAuthRoutes = require("../routes/user/tenants/authRoutes");
const landlordAuthRoutes = require("../routes/user/landlord/authRoutes");
const invoiceRoutes = require("../routes/invoiceRoutes");

const routes = (app) => {
  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use("/tenants", tenantAuthRoutes);

  app.use("/landlords", landlordAuthRoutes); // Add this line

  app.use("/classify", geminiRoutes);

  app.use("/invoice", invoiceRoutes);
};

module.exports = routes;
