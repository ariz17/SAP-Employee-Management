const express = require("express");

const router = express.Router();


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");


// =====================================================
// ALLOCATION CONTROLLER
// =====================================================

const {

    getAllocations,

    getAllocationDetails,

    getMyAllocations,

    allocateBlood,

    removeAllocation

} = require(
    "../controllers/allocationController"
);


// =====================================================
// GET LOGGED-IN HOSPITAL ALLOCATIONS
//
// IMPORTANT:
// This route must come before "/:allocationId"
// =====================================================

router.get(

    "/hospital/my-allocations",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    getMyAllocations

);


// =====================================================
// GET ALL ALLOCATIONS
// =====================================================

router.get(

    "/",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    getAllocations

);


// =====================================================
// CREATE BLOOD ALLOCATION
// =====================================================

router.post(

    "/",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    allocateBlood

);


// =====================================================
// GET ALLOCATION BY ID
//
// This must come after specific routes like
// "/hospital/my-allocations"
// =====================================================

router.get(

    "/:allocationId",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    getAllocationDetails

);


// =====================================================
// DELETE ALLOCATION
// =====================================================

router.delete(

    "/:allocationId",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    removeAllocation

);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;