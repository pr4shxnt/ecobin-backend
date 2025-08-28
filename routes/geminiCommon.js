const { gemini } = require("../controller/gemini1.5FlashController");
const router = require("express").Router();

router.post("/", gemini);

module.exports = router;
