const express = require("express");

const {
    getHospitals,
    getHospital,
    registerHospital,
    editHospital,
    removeHospital
} = require("../controllers/hospitalController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all hospitals
router.get(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getHospitals
);

// Get hospital by ID
router.get(
    "/:hospitalId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getHospital
);

// Create hospital
router.post(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    registerHospital
);

// Update hospital
router.put(
    "/:hospitalId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    editHospital
);

// Delete hospital
router.delete(
    "/:hospitalId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    removeHospital
);

module.exports = router;