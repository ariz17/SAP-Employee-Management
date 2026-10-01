const express = require("express");

const { registerUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    registerUser
);

module.exports = router;