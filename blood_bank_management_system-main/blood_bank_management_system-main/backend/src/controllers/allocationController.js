const {
    getAllAllocations,
    getAllocationById,
    getAllocationsByRequestId,
    getAllocationsByHospitalId,
    createAllocation,
    deleteAllocation
} = require("../services/allocationService");


const {
    getRequestById,
    updateRequestStatus
} = require(
    "../services/requestService"
);


const {
    getInventoryById,
    updateInventoryStatus
} = require(
    "../services/inventoryService"
);


// =====================================================
// GET ALL ALLOCATIONS
// BLOOD BANK
// =====================================================

const getAllocations =
    async (req, res) => {

        try {

            const allocations =
                await getAllAllocations();


            return res.status(200).json({

                success: true,

                data:
                    allocations
            });

        } catch (error) {

            console.error(
                "Get allocations error:"
            );

            console.error(
                error.response?.data ||
                error.message
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load allocations",

                error:
                    error.response?.data ||
                    error.message
            });
        }
    };


// =====================================================
// GET ALLOCATION DETAILS
// =====================================================

const getAllocationDetails =
    async (req, res) => {

        try {

            const {
                allocationId
            } = req.params;


            const allocation =
                await getAllocationById(
                    allocationId
                );


            if (!allocation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Allocation not found"
                });
            }


            return res.status(200).json({

                success: true,

                data:
                    allocation
            });

        } catch (error) {

            console.error(
                "Get allocation details error:"
            );

            console.error(
                error.response?.data ||
                error.message
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load allocation details",

                error:
                    error.response?.data ||
                    error.message
            });
        }
    };


// =====================================================
// GET ALLOCATIONS FOR LOGGED-IN HOSPITAL
// =====================================================

const getMyAllocations =
    async (req, res) => {

        try {

            const hospitalId =
                req.user?.hospitalId;


            if (!hospitalId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Hospital ID not found in user session"
                });
            }


            const allocations =
                await getAllocationsByHospitalId(
                    hospitalId
                );


            return res.status(200).json({

                success: true,

                data:
                    allocations
            });

        } catch (error) {

            console.error(
                "Get my allocations error:"
            );

            console.error(
                error.response?.data ||
                error.message
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load your allocations",

                error:
                    error.response?.data ||
                    error.message
            });
        }
    };


// =====================================================
// CREATE BLOOD ALLOCATION
// =====================================================

const allocateBlood =
    async (req, res) => {

        try {

            console.log(
                "\n========================================"
            );

            console.log(
                "STARTING BLOOD ALLOCATION"
            );

            console.log(
                "Request body:",
                req.body
            );

            console.log(
                "========================================\n"
            );


            // =========================================
            // GET DATA FROM FRONTEND
            // =========================================

            const {
                requestId,
                bloodUnitIds
            } = req.body;


            // =========================================
            // VALIDATE REQUEST ID
            // =========================================

            if (!requestId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Request ID is required"
                });
            }


            // =========================================
            // VALIDATE BLOOD UNIT IDS
            // =========================================

            if (

                !bloodUnitIds ||

                !Array.isArray(
                    bloodUnitIds
                ) ||

                bloodUnitIds.length === 0

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "At least one Blood Unit ID is required"
                });
            }


            // =========================================
            // CHECK DUPLICATES
            // =========================================

            const uniqueBloodUnitIds =
                [
                    ...new Set(
                        bloodUnitIds
                    )
                ];


            if (

                uniqueBloodUnitIds.length !==
                bloodUnitIds.length

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Duplicate Blood Unit IDs are not allowed"
                });
            }


            // =========================================
            // GET REQUEST
            // =========================================

            console.log(
                "Getting request:",
                requestId
            );


            const request =
                await getRequestById(
                    requestId
                );


            console.log(
                "Request received:",
                request
            );


            if (!request) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Blood request not found"
                });
            }


            // =========================================
            // REQUEST MUST BE APPROVED
            // =========================================

            if (

                request.Status !==
                "APPROVED"

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Blood cannot be allocated because request status is ${request.Status}`
                });
            }


            // =========================================
            // REQUESTED QUANTITY
            // =========================================

            const requestedQuantity =
                Number(
                    request.Quantity
                );


            if (

                requestedQuantity <= 0

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid requested quantity"
                });
            }


            // =========================================
            // SELECTED QUANTITY MUST MATCH
            // =========================================

            if (

                bloodUnitIds.length !==
                requestedQuantity

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Please select exactly ${requestedQuantity} blood unit(s)`
                });
            }


            // =========================================
            // CHECK EXISTING ALLOCATIONS
            // =========================================

            console.log(
                "Checking existing allocations..."
            );


            const existingAllocations =
                await getAllocationsByRequestId(
                    requestId
                );


            console.log(
                "Existing allocations:",
                existingAllocations.length
            );


            if (

                existingAllocations.length > 0

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This request already has allocated blood units"
                });
            }


            // =========================================
            // VALIDATE ALL BLOOD UNITS FIRST
            // =========================================

            const validatedBloodUnits =
                [];


            for (

                const bloodUnitId

                of bloodUnitIds

            ) {

                console.log(
                    "Validating blood unit:",
                    bloodUnitId
                );


                const bloodUnit =
                    await getInventoryById(
                        bloodUnitId
                    );


                // =====================================
                // BLOOD UNIT EXISTS
                // =====================================

                if (!bloodUnit) {

                    return res.status(404).json({

                        success: false,

                        message:
                            `Blood unit ${bloodUnitId} not found`
                    });
                }


                // =====================================
                // BLOOD UNIT MUST BE AVAILABLE
                // =====================================

                if (

                    bloodUnit.Status !==
                    "AVAILABLE"

                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `Blood unit ${bloodUnitId} is not available. Current status is ${bloodUnit.Status}`
                    });
                }


                // =====================================
                // BLOOD GROUP MUST MATCH
                // =====================================

                if (

                    bloodUnit.BloodGroup !==
                    request.BloodGroup

                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `Blood group mismatch for unit ${bloodUnitId}. Request requires ${request.BloodGroup}, but unit has ${bloodUnit.BloodGroup}`
                    });
                }


                validatedBloodUnits.push(
                    bloodUnit
                );


                console.log(
                    "Blood unit validated:",
                    bloodUnitId
                );
            }


            // =========================================
            // ALL VALIDATIONS PASSED
            // =========================================

            console.log(
                "\nAll blood units validated successfully."
            );


            const createdAllocations =
                [];


            // =========================================
            // CREATE ALLOCATION FOR EACH UNIT
            // =========================================

            for (

                const bloodUnit

                of validatedBloodUnits

            ) {

                console.log(
                    "\n----------------------------------------"
                );

                console.log(
                    "PROCESSING UNIT:",
                    bloodUnit.BloodUnitId
                );

                console.log(
                    "----------------------------------------"
                );


                // =====================================
                // CREATE ALLOCATION
                // =====================================

                console.log(
                    "Creating allocation..."
                );


                const allocation =
                    await createAllocation({

                        requestId:
                            requestId,

                        bloodUnitId:
                            bloodUnit.BloodUnitId
                    });


                console.log(
                    "Allocation created successfully:",
                    allocation
                );


                createdAllocations.push(
                    allocation
                );


                // =====================================
                // UPDATE ONLY INVENTORY STATUS
                // =====================================

                console.log(
                    "Updating inventory status..."
                );


                await updateInventoryStatus(

                    bloodUnit.BloodUnitId,

                    "ALLOCATED"

                );


                console.log(
                    "Inventory status updated successfully:",
                    bloodUnit.BloodUnitId
                );
            }


            // =========================================
            // UPDATE REQUEST STATUS
            // =========================================

            console.log(
                "\nUpdating request status to ALLOCATED..."
            );


            await updateRequestStatus(

                requestId,

                "ALLOCATED"

            );


            console.log(
                "Request status updated successfully."
            );


            // =========================================
            // SUCCESS
            // =========================================

            console.log(
                "\n========================================"
            );

            console.log(
                "BLOOD ALLOCATION COMPLETED SUCCESSFULLY"
            );

            console.log(
                "========================================\n"
            );


            return res.status(201).json({

                success: true,

                message:
                    `${createdAllocations.length} blood unit(s) allocated successfully`,

                data:
                    createdAllocations
            });

        } catch (error) {

            console.error(
                "\n========================================"
            );

            console.error(
                "ALLOCATE BLOOD ERROR"
            );

            console.error(
                "Message:"
            );

            console.error(
                error.message
            );


            console.error(
                "\nSAP / API Response:"
            );

            console.error(
                error.response?.data
            );


            console.error(
                "\nStatus:"
            );

            console.error(
                error.response?.status
            );


            console.error(
                "\nStack:"
            );

            console.error(
                error.stack
            );


            console.error(
                "========================================\n"
            );


            return res.status(

                error.response?.status ||
                500

            ).json({

                success: false,

                message:

                    error.response?.data
                        ?.error
                        ?.message
                        ?.value ||

                    error.response?.data
                        ?.message ||

                    error.message ||

                    "Failed to allocate blood",

                error:
                    error.response?.data ||
                    error.message
            });
        }
    };


// =====================================================
// DELETE ALLOCATION
// =====================================================

const removeAllocation =
    async (req, res) => {

        try {

            const {
                allocationId
            } = req.params;


            // =========================================
            // VALIDATE ALLOCATION ID
            // =========================================

            if (!allocationId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Allocation ID is required"
                });
            }


            // =========================================
            // GET ALLOCATION
            // =========================================

            const allocation =
                await getAllocationById(
                    allocationId
                );


            if (!allocation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Allocation not found"
                });
            }


            console.log(
                "\n========================================"
            );

            console.log(
                "DELETING ALLOCATION"
            );

            console.log(
                "Allocation ID:",
                allocationId
            );

            console.log(
                "Blood Unit ID:",
                allocation.BloodUnitId
            );

            console.log(
                "Request ID:",
                allocation.RequestId
            );

            console.log(
                "========================================\n"
            );


            // =========================================
            // DELETE ALLOCATION FROM SAP
            // =========================================

            await deleteAllocation(
                allocationId
            );


            console.log(
                "Allocation deleted successfully"
            );


            // =========================================
            // MAKE BLOOD UNIT AVAILABLE AGAIN
            // =========================================

            console.log(
                "Changing blood unit status to AVAILABLE..."
            );


            await updateInventoryStatus(

                allocation.BloodUnitId,

                "AVAILABLE"

            );


            console.log(
                "Blood unit status changed back to AVAILABLE"
            );


            // =========================================
            // CHECK REMAINING ALLOCATIONS
            // =========================================

            const remainingAllocations =
                await getAllocationsByRequestId(
                    allocation.RequestId
                );


            console.log(
                "Remaining allocations:",
                remainingAllocations.length
            );


            // =========================================
            // IF NO ALLOCATIONS REMAIN,
            // CHANGE REQUEST BACK TO APPROVED
            // =========================================

            if (

                remainingAllocations.length === 0

            ) {

                await updateRequestStatus(

                    allocation.RequestId,

                    "APPROVED"

                );


                console.log(
                    "Request status changed back to APPROVED"
                );

            }


            // =========================================
            // SUCCESS
            // =========================================

            return res.status(200).json({

                success: true,

                message:
                    "Allocation deleted successfully"
            });

        } catch (error) {

            console.error(
                "\n========================================"
            );

            console.error(
                "DELETE ALLOCATION ERROR"
            );

            console.error(
                "Message:"
            );

            console.error(
                error.message
            );


            console.error(
                "\nSAP / API Response:"
            );

            console.error(
                error.response?.data
            );


            console.error(
                "\nStatus:"
            );

            console.error(
                error.response?.status
            );


            console.error(
                "========================================\n"
            );


            return res.status(

                error.response?.status ||
                500

            ).json({

                success: false,

                message:

                    error.response?.data
                        ?.error
                        ?.message
                        ?.value ||

                    error.response?.data
                        ?.message ||

                    error.message ||

                    "Failed to delete allocation"
            });
        }
    };    

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getAllocations,

    getAllocationDetails,

    getMyAllocations,

    allocateBlood,

    removeAllocation
};