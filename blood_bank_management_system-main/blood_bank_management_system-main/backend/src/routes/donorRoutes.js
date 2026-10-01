const express = require("express");

const {
    getDonors,
    getDonor,
    registerDonor,
    editDonor,
    removeDonor
} = require("../controllers/donorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Get all donors
router.get(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getDonors
);


// Get donor by ID
router.get(
    "/:donorId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getDonor
);


// Create donor
router.post(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    registerDonor
);

// Update donor
router.put(
    "/:donorId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    editDonor
);

// Delete donor
router.delete(
    "/:donorId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    removeDonor
);

module.exports = router;