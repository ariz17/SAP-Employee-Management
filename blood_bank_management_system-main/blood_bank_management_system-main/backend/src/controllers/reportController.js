const {
    getAllInventory
} = require(
    "../services/inventoryService"
);


const {
    getAllDonors
} = require(
    "../services/donorService"
);


const {
    getAllRequests
} = require(
    "../services/requestService"
);


const {
    getAllAllocations
} = require(
    "../services/allocationService"
);


const {
    getAllHospitals
} = require(
    "../services/hospitalService"
);


// ============================================================
// CLEAN SAP ODATA OBJECT
// ============================================================

const cleanSapData =
    (item) => {

        if (
            !item ||
            typeof item !== "object"
        ) {

            return item;

        }


        const cleanItem =
            {};


        Object.keys(item).forEach(

            (key) => {

                const value =
                    item[key];


                // Remove SAP metadata

                if (
                    key === "__metadata" ||
                    key.startsWith("__")
                ) {

                    return;

                }


                // Remove navigation entities

                if (
                    key.endsWith("_ENTITY")
                ) {

                    return;

                }


                // Remove object values

                if (
                    value !== null &&
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {

                    return;

                }


                cleanItem[key] =
                    value;

            }

        );


        return cleanItem;

    };


// ============================================================
// INVENTORY REPORT
// ============================================================

const getInventoryReport =
    async (req, res) => {

        try {

            const inventory =
                await getAllInventory();


            const reportData =

                Array.isArray(inventory)

                    ? inventory.map(
                        cleanSapData
                    )

                    : [];


            return res.status(200).json({

                success: true,

                data:
                    reportData

            });

        } catch (error) {

            console.error(

                "Inventory report error:",

                error.response?.data ||
                error.message

            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate inventory report"

            });

        }

    };


// ============================================================
// DONOR REPORT
// ============================================================

const getDonorReport =
    async (req, res) => {

        try {

            const donors =
                await getAllDonors();


            const reportData =

                Array.isArray(donors)

                    ? donors.map(
                        cleanSapData
                    )

                    : [];


            return res.status(200).json({

                success: true,

                data:
                    reportData

            });

        } catch (error) {

            console.error(

                "Donor report error:",

                error.response?.data ||
                error.message

            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate donor report"

            });

        }

    };


// ============================================================
// HOSPITAL REQUEST REPORT
// ============================================================

const getRequestReport =
    async (req, res) => {

        try {

            const requests =
                await getAllRequests();


            const hospitals =
                await getAllHospitals();


            const requestArray =

                Array.isArray(requests)

                    ? requests

                    : [];


            const hospitalArray =

                Array.isArray(hospitals)

                    ? hospitals

                    : [];


            const requestReport =

                requestArray.map(

                    (request) => {

                        const cleanRequest =
                            cleanSapData(
                                request
                            );


                        const hospital =

                            hospitalArray.find(

                                (hospitalItem) =>

                                    String(
                                        hospitalItem.HospitalId
                                    ) ===

                                    String(
                                        request.HospitalId
                                    )

                            );


                        return {

                            ...cleanRequest,

                            HospitalName:

                                hospital

                                    ? hospital.HospitalName

                                    : "-"

                        };

                    }

                );


            return res.status(200).json({

                success: true,

                data:
                    requestReport

            });

        } catch (error) {

            console.error(

                "Hospital request report error:",

                error.response?.data ||
                error.message

            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate hospital request report"

            });

        }

    };


// ============================================================
// BLOOD ALLOCATION REPORT
// ============================================================

const getAllocationReport =
    async (req, res) => {

        try {

            const allocations =
                await getAllAllocations();


            const hospitals =
                await getAllHospitals();


            const inventory =
                await getAllInventory();


            const allocationArray =

                Array.isArray(allocations)

                    ? allocations

                    : [];


            const hospitalArray =

                Array.isArray(hospitals)

                    ? hospitals

                    : [];


            const inventoryArray =

                Array.isArray(inventory)

                    ? inventory

                    : [];


            const allocationReport =

                allocationArray.map(

                    (allocation) => {

                        const cleanAllocation =
                            cleanSapData(
                                allocation
                            );


                        // Find Hospital

                        const hospital =

                            hospitalArray.find(

                                (hospitalItem) =>

                                    String(
                                        hospitalItem.HospitalId
                                    ) ===

                                    String(
                                        allocation.HospitalId
                                    )

                            );


                        // Find Blood Unit

                        const bloodUnit =

                            inventoryArray.find(

                                (inventoryItem) =>

                                    String(
                                        inventoryItem.BloodUnitId
                                    ) ===

                                    String(
                                        allocation.BloodUnitId
                                    )

                            );


                        return {

                            ...cleanAllocation,


                            HospitalName:

                                hospital

                                    ? hospital.HospitalName

                                    : "-",


                            BloodGroup:

                                bloodUnit

                                    ? bloodUnit.BloodGroup

                                    : "-"

                        };

                    }

                );


            return res.status(200).json({

                success: true,

                data:
                    allocationReport

            });

        } catch (error) {

            console.error(

                "Allocation report error:",

                error.response?.data ||
                error.message

            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate allocation report"

            });

        }

    };


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    getInventoryReport,

    getDonorReport,

    getRequestReport,

    getAllocationReport

};