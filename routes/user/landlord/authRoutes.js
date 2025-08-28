const express = require("express");
const router = express.Router();
const authController = require("../../../controller/user/landlord/authController");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/register",
  upload.fields([
    { name: "proofOfAddress", maxCount: 1 }, // changed to single file
    { name: "houseDocuments", maxCount: 1 },
  ]),
  authController.createLandlord
);

router.post("/login", authController.loginLandlord);

module.exports = router;
