const express = require("express");

const {
    getMyRequests,
    getMyRequest,
    createBloodRequest
} = require("../controllers/requestController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Get requests of logged-in hospital
router.get(
    "/",
    authMiddleware,
    roleMiddleware("HOSPITAL"),
    getMyRequests
);

// Get one request of logged-in hospital
router.get(
    "/:requestId",
    authMiddleware,
    roleMiddleware("HOSPITAL"),
    getMyRequest
);

// Create blood request
router.post(
    "/",
    authMiddleware,
    roleMiddleware("HOSPITAL"),
    createBloodRequest
);

module.exports = router;