const sapClient = require("./sapService");

const {
    sapPost
} = sapClient;


// =====================================================
// SAP ALLOCATION ENTITY SET
// =====================================================

const ALLOCATION_ENTITY_SET =
    "ZBLOOD_ALLOCATION_ENTITYSet";


// =====================================================
// GET ALL ALLOCATIONS
// =====================================================

const getAllAllocations =
    async () => {

        const response =
            await sapClient.get(
                ALLOCATION_ENTITY_SET
            );

        return response.data.d.results;
    };


// =====================================================
// GET ALLOCATION BY ID
// =====================================================

const getAllocationById =
    async (allocationId) => {

        if (!allocationId) {

            throw new Error(
                "Allocation ID is required"
            );
        }


        const response =
            await sapClient.get(

                ALLOCATION_ENTITY_SET,

                {
                    params: {

                        $filter:
                            `AllocationId eq '${allocationId}'`
                    }
                }
            );


        const allocations =
            response.data.d.results;


        if (
            !allocations ||
            allocations.length === 0
        ) {

            return null;
        }


        return allocations[0];
    };


// =====================================================
// GENERATE UNIQUE RANDOM ALLOCATION ID
// =====================================================

const generateAllocationId =
    async () => {

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


        while (true) {

            let allocationId =
                "A";


            for (
                let i = 0;
                i < 9;
                i++
            ) {

                const randomIndex =
                    Math.floor(
                        Math.random() *
                        characters.length
                    );


                allocationId +=
                    characters[randomIndex];
            }


            console.log(
                "Checking generated Allocation ID:",
                allocationId
            );


            const existingAllocation =
                await getAllocationById(
                    allocationId
                );


            if (
                !existingAllocation
            ) {

                return allocationId;
            }
        }
    };


// =====================================================
// CREATE ALLOCATION
// =====================================================

const createAllocation =
    async (data) => {

        const {

            requestId,

            bloodUnitId

        } = data;


        // =============================================
        // VALIDATE REQUEST ID
        // =============================================

        if (!requestId) {

            throw new Error(
                "Request ID is required"
            );
        }


        // =============================================
        // VALIDATE BLOOD UNIT ID
        // =============================================

        if (!bloodUnitId) {

            throw new Error(
                "Blood Unit ID is required"
            );
        }


        console.log(
            "\n====================================="
        );

        console.log(
            "CREATING ALLOCATION"
        );

        console.log(
            "Request ID:",
            requestId
        );

        console.log(
            "Blood Unit ID:",
            bloodUnitId
        );


        // =============================================
        // GENERATE ALLOCATION ID
        // =============================================

        const allocationId =
            await generateAllocationId();


        // =============================================
        // SAP PAYLOAD
        // =============================================

        const payload = {

            AllocationId:
                allocationId,

            RequestId:
                requestId,

            BloodUnitId:
                bloodUnitId
        };


        console.log(
            "SAP Allocation Payload:",
            payload
        );


        console.log(
            "====================================="
        );


        // =============================================
        // CREATE IN SAP
        // =============================================

        const response =
            await sapPost(

                ALLOCATION_ENTITY_SET,

                payload

            );


        console.log(
            "SAP Allocation Created Successfully"
        );


        return response.data.d;
    };


// =====================================================
// GET ALLOCATIONS BY REQUEST ID
// =====================================================

const getAllocationsByRequestId =
    async (requestId) => {

        if (!requestId) {

            throw new Error(
                "Request ID is required"
            );
        }


        const response =
            await sapClient.get(

                ALLOCATION_ENTITY_SET,

                {
                    params: {

                        $filter:
                            `RequestId eq '${requestId}'`
                    }
                }
            );


        return response.data.d.results;
    };


// =====================================================
// GET ALLOCATIONS BY HOSPITAL ID
// =====================================================

const getAllocationsByHospitalId =
    async (hospitalId) => {

        const allAllocations =
            await getAllAllocations();


        return allAllocations.filter(

            allocation =>

                allocation.HospitalId ===
                hospitalId
        );
    };


// =====================================================
// GET ALLOCATIONS BY BLOOD UNIT ID
// =====================================================

const getAllocationsByBloodUnitId =
    async (bloodUnitId) => {

        if (!bloodUnitId) {

            throw new Error(
                "Blood Unit ID is required"
            );
        }


        const response =
            await sapClient.get(

                ALLOCATION_ENTITY_SET,

                {
                    params: {

                        $filter:
                            `BloodUnitId eq '${bloodUnitId}'`
                    }
                }
            );


        return response.data.d.results;
    };


// =====================================================
// DELETE ALLOCATION
// =====================================================

const deleteAllocation =
    async (allocationId) => {

        // =============================================
        // VALIDATE ALLOCATION ID
        // =============================================

        if (!allocationId) {

            throw new Error(
                "Allocation ID is required"
            );
        }


        // =============================================
        // CHECK ALLOCATION EXISTS
        // =============================================

        const allocation =
            await getAllocationById(
                allocationId
            );


        if (!allocation) {

            throw new Error(
                "Allocation not found"
            );
        }


        console.log(
            "\n====================================="
        );

        console.log(
            "DELETING ALLOCATION"
        );

        console.log(
            "Allocation ID:",
            allocationId
        );

        console.log(
            "Request ID:",
            allocation.RequestId
        );

        console.log(
            "Blood Unit ID:",
            allocation.BloodUnitId
        );


        // =============================================
        // GET CSRF TOKEN
        // =============================================

        const csrfResponse =
            await sapClient.get(

                "",

                {
                    headers: {

                        "X-CSRF-Token":
                            "Fetch"
                    }
                }
            );


        const csrfToken =
            csrfResponse.headers[
                "x-csrf-token"
            ];


        if (!csrfToken) {

            throw new Error(
                "Failed to fetch SAP CSRF token"
            );
        }


        // =============================================
        // DELETE FROM SAP
        // =============================================

        await sapClient.delete(

            `${ALLOCATION_ENTITY_SET}('${allocationId}')`,

            {
                headers: {

                    "X-CSRF-Token":
                        csrfToken,

                    Accept:
                        "application/json"
                }
            }
        );


        console.log(
            "Allocation deleted successfully:",
            allocationId
        );

        console.log(
            "=====================================\n"
        );


        // =============================================
        // RETURN DELETED ALLOCATION
        //
        // Important because the controller needs:
        // RequestId and BloodUnitId
        // =============================================

        return allocation;
    };


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getAllAllocations,

    getAllocationById,

    generateAllocationId,

    createAllocation,

    getAllocationsByRequestId,

    getAllocationsByHospitalId,

    getAllocationsByBloodUnitId,

    deleteAllocation
};