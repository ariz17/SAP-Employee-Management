const express = require("express");

const {
    getInventory,
    getInventoryDetails,
    registerInventory,
    editInventory
} = require("../controllers/inventoryController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// GET ALL INVENTORY
// ==========================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getInventory
);


// ==========================================
// GET INVENTORY DETAILS
// ==========================================

router.get(
    "/:bloodUnitId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    getInventoryDetails
);


// ==========================================
// ADD BLOOD UNIT
// ==========================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    registerInventory
);


// ==========================================
// UPDATE BLOOD UNIT
// ==========================================

router.put(
    "/:bloodUnitId",
    authMiddleware,
    roleMiddleware("BLOOD_BANK"),
    editInventory
);


module.exports = router;