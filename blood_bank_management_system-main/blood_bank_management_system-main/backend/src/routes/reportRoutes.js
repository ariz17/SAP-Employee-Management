const express =
    require("express");


const {

    getInventoryReport,

    getDonorReport,

    getRequestReport,

    getAllocationReport

} = require(
    "../controllers/reportController"
);


const authMiddleware =
    require("../middleware/authMiddleware");


const roleMiddleware =
    require("../middleware/roleMiddleware");


const router =
    express.Router();


// ============================================================
// INVENTORY REPORT
// ============================================================

router.get(

    "/inventory",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    getInventoryReport

);


// ============================================================
// DONOR REPORT
// ============================================================

router.get(

    "/donors",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    getDonorReport

);


// ============================================================
// HOSPITAL REQUEST REPORT
// ============================================================

router.get(

    "/requests",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    getRequestReport

);


// ============================================================
// BLOOD ALLOCATION REPORT
// ============================================================

router.get(

    "/allocations",

    authMiddleware,

    roleMiddleware("BLOOD_BANK"),

    getAllocationReport

);


module.exports =
    router;