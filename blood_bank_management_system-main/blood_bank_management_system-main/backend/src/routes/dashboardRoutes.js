const express = require("express");

const {
    getDashboard
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Blood Bank Dashboard
router.get(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getDashboard
);


module.exports = router;