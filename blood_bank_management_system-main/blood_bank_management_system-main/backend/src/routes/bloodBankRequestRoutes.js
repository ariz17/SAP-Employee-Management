const express = require("express");

const {
    getAllBloodRequests,
    getBloodRequest,
    updateBloodRequestStatus
} = require("../controllers/requestController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all blood requests
router.get(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getAllBloodRequests
);

// Get one blood request
router.get(
    "/:requestId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getBloodRequest
);

// Approve or reject request
router.put(
    "/:requestId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    updateBloodRequestStatus
);

module.exports = router;