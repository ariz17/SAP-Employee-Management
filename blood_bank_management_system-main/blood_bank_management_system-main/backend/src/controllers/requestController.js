const {
    getAllRequests,
    getRequestById,
    getRequestsByHospitalId,
    createRequest,
    updateRequestStatus
} = require("../services/requestService");


// =====================================================
// GET ALL REQUESTS
// BLOOD BANK ONLY
// =====================================================

const getAllBloodRequests = async (req, res) => {

    try {

        const requests = await getAllRequests();

        return res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {

        console.error(
            "Get all requests error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load blood requests",
            error:
                error.response?.data ||
                error.message
        });
    }
};


// =====================================================
// GET ONE REQUEST
// BLOOD BANK ONLY
// =====================================================

const getBloodRequest = async (req, res) => {

    try {

        const { requestId } = req.params;

        const request =
            await getRequestById(requestId);

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Blood request not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: request
        });

    } catch (error) {

        console.error(
            "Get blood request error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load blood request",
            error:
                error.response?.data ||
                error.message
        });
    }
};


// =====================================================
// GET MY REQUESTS
// HOSPITAL ONLY
// =====================================================

const getMyRequests = async (req, res) => {

    try {

        /*
         * Hospital ID comes from JWT.
         * It is NOT received from frontend.
         */

        const hospitalId =
            req.user.hospitalId;

        if (!hospitalId) {

            return res.status(400).json({
                success: false,
                message:
                    "Hospital ID not found in user session"
            });
        }

        const requests =
            await getRequestsByHospitalId(
                hospitalId
            );

        return res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {

        console.error(
            "Get my requests error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load your requests",
            error:
                error.response?.data ||
                error.message
        });
    }
};


// =====================================================
// GET MY REQUEST BY ID
// HOSPITAL ONLY
// =====================================================

const getMyRequest = async (req, res) => {

    try {

        const { requestId } = req.params;

        const hospitalId =
            req.user.hospitalId;

        if (!hospitalId) {

            return res.status(400).json({
                success: false,
                message:
                    "Hospital ID not found in user session"
            });
        }

        const request =
            await getRequestById(requestId);

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Blood request not found"
            });
        }

        /*
         * SECURITY CHECK
         *
         * Hospital can only see
         * its own request.
         */

        if (request.HospitalId !== hospitalId) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to access this request"
            });
        }

        return res.status(200).json({
            success: true,
            data: request
        });

    } catch (error) {

        console.error(
            "Get my request error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load request details",
            error:
                error.response?.data ||
                error.message
        });
    }
};


// =====================================================
// CREATE BLOOD REQUEST
// HOSPITAL ONLY
// =====================================================

const createBloodRequest = async (req, res) => {

    try {

        const {
            bloodGroup,
            quantity
        } = req.body;

        /*
         * Hospital ID is NEVER taken from req.body.
         *
         * It comes from the logged-in user's JWT.
         */

        const hospitalId =
            req.user.hospitalId;

        if (!hospitalId) {

            return res.status(400).json({
                success: false,
                message:
                    "Hospital ID not found in user session"
            });
        }


        // Validate blood group

        const validBloodGroups = [
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ];

        if (!bloodGroup) {

            return res.status(400).json({
                success: false,
                message:
                    "Blood group is required"
            });
        }

        if (!validBloodGroups.includes(bloodGroup)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid blood group"
            });
        }


        // Validate quantity

        if (
            quantity === undefined ||
            quantity === null ||
            quantity === ""
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Quantity is required"
            });
        }

        const numericQuantity =
            Number(quantity);

        if (
            !Number.isInteger(numericQuantity) ||
            numericQuantity <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer"
            });
        }


        // Create request

        const request =
            await createRequest({
                hospitalId,
                bloodGroup,
                quantity: numericQuantity
            });


        return res.status(201).json({

            success: true,

            message:
                "Blood request created successfully",

            data: {
                requestId:
                    request.RequestId,

                hospitalId:
                    request.HospitalId,

                bloodGroup:
                    request.BloodGroup,

                quantity:
                    request.Quantity,

                requestDate:
                    request.RequestDate,

                status:
                    request.Status
            }
        });

    } catch (error) {

        console.error(
            "Create blood request error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create blood request",
            error:
                error.response?.data ||
                error.message
        });
    }
};


// =====================================================
// UPDATE REQUEST STATUS
// BLOOD BANK ONLY
// =====================================================

const updateBloodRequestStatus = async (req, res) => {

    try {

        const { requestId } = req.params;

        const { status } = req.body;


        // Validate status

        const validStatuses = [
            "APPROVED",
            "REJECTED"
        ];

        if (!status) {

            return res.status(400).json({
                success: false,
                message:
                    "Status is required"
            });
        }

        if (!validStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid status"
            });
        }


        // Check request exists

        const existingRequest =
            await getRequestById(requestId);

        if (!existingRequest) {

            return res.status(404).json({
                success: false,
                message:
                    "Blood request not found"
            });
        }


        /*
         * Only PENDING requests can be
         * approved or rejected here.
         *
         * ALLOCATED will be handled later
         * by the Allocation module.
         */

        if (existingRequest.Status !== "PENDING") {

            return res.status(400).json({
                success: false,
                message:
                    `Request cannot be ${status.toLowerCase()} because its current status is ${existingRequest.Status}`
            });
        }


        const updatedRequest =
            await updateRequestStatus(
                requestId,
                status
            );


        return res.status(200).json({

            success: true,

            message:
                `Blood request ${status.toLowerCase()} successfully`,

            data: updatedRequest
        });

    } catch (error) {

        console.error(
            "Update blood request status error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update request status",
            error:
                error.response?.data ||
                error.message
        });
    }
};


module.exports = {
    getAllBloodRequests,
    getBloodRequest,
    getMyRequests,
    getMyRequest,
    createBloodRequest,
    updateBloodRequestStatus
};