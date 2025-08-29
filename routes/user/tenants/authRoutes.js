const express = require("express");
const upload = require("../../../services/multer");
const {
  registerTenant,
  loginTenant,
  getUserDetails,
  getById,
} = require("../../../controller/user/tenant/authController");

const router = express.Router();

// Registration route
router.post(
  "/register",
  upload.fields([
    { name: "rentalAgreement", maxCount: 1 },
    { name: "photoIdentityProof", maxCount: 1 },
  ]),
  registerTenant
);

router.get("/profile/:token", getUserDetails);

//Login Route
router.post("/login", loginTenant);
router.get("/userinput/:id", getById);

module.exports = router;
