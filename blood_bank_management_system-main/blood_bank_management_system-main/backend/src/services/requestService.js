const sapClient = require("./sapService");

const {
    sapPost
} = sapClient;


// =====================================================
// SAP REQUEST ENTITY SET
// =====================================================

const REQUEST_ENTITY_SET =
    "ZBLOOD_REQUEST_ENTITYSet";


// =====================================================
// GET ALL REQUESTS
// =====================================================

const getAllRequests =
    async () => {

        const response =
            await sapClient.get(
                REQUEST_ENTITY_SET
            );

        return response.data.d.results;
    };


// =====================================================
// GET REQUEST BY REQUEST ID
// =====================================================

const getRequestById =
    async (requestId) => {

        if (!requestId) {

            throw new Error(
                "Request ID is required"
            );
        }


        const response =
            await sapClient.get(

                REQUEST_ENTITY_SET,

                {
                    params: {

                        $filter:
                            `RequestId eq '${requestId}'`
                    }
                }
            );


        const requests =
            response.data.d.results;


        if (
            !requests ||
            requests.length === 0
        ) {

            return null;
        }


        return requests[0];
    };


// =====================================================
// GET REQUESTS BY HOSPITAL ID
// =====================================================

const getRequestsByHospitalId =
    async (hospitalId) => {

        if (!hospitalId) {

            throw new Error(
                "Hospital ID is required"
            );
        }


        const response =
            await sapClient.get(

                REQUEST_ENTITY_SET,

                {
                    params: {

                        $filter:
                            `HospitalId eq '${hospitalId}'`
                    }
                }
            );


        return response.data.d.results;
    };


// =====================================================
// GENERATE RANDOM REQUEST ID
//
// Example:
// R8K2PQ9XYZ
// =====================================================

const generateRequestId =
    async () => {

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


        while (true) {

            let requestId =
                "R";


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


                requestId +=
                    characters[randomIndex];
            }


            const existingRequest =
                await getRequestById(
                    requestId
                );


            if (
                !existingRequest
            ) {

                return requestId;
            }
        }
    };


// =====================================================
// CREATE BLOOD REQUEST
// =====================================================

const createRequest =
    async (requestData) => {

        const {

            hospitalId,

            bloodGroup,

            quantity

        } = requestData;


        // =============================================
        // VALIDATIONS
        // =============================================

        if (!hospitalId) {

            throw new Error(
                "Hospital ID is required"
            );
        }


        if (!bloodGroup) {

            throw new Error(
                "Blood Group is required"
            );
        }


        if (

            !quantity ||

            Number(quantity) <= 0

        ) {

            throw new Error(
                "Quantity must be greater than zero"
            );
        }


        // =============================================
        // GENERATE REQUEST ID
        // =============================================

        const requestId =
            await generateRequestId();


        // =============================================
        // SAP PAYLOAD
        //
        // RequestDate and Status are generated
        // by SAP backend.
        // =============================================

        const payload = {

            RequestId:
                requestId,

            HospitalId:
                hospitalId,

            BloodGroup:
                bloodGroup,

            Quantity:
                Number(quantity)
        };


        console.log(
            "Creating blood request:",
            payload
        );


        // =============================================
        // POST TO SAP
        // =============================================

        const response =
            await sapPost(

                REQUEST_ENTITY_SET,

                payload

            );


        return response.data.d;
    };


// =====================================================
// GET CSRF TOKEN
// =====================================================

const getCsrfToken =
    async () => {

        const response =
            await sapClient.get(

                "",

                {
                    headers: {

                        "X-CSRF-Token":
                            "Fetch"
                    }
                }

            );


        return response.headers[
            "x-csrf-token"
        ];
    };


// =====================================================
// UPDATE REQUEST STATUS
//
// Examples:
//
// APPROVED  -> ALLOCATED
// ALLOCATED -> APPROVED
// =====================================================

const updateRequestStatus =
    async (

        requestId,

        status

    ) => {

        if (!requestId) {

            throw new Error(
                "Request ID is required"
            );
        }


        if (!status) {

            throw new Error(
                "Request status is required"
            );
        }


        // =============================================
        // GET CSRF TOKEN
        // =============================================

        const csrfToken =
            await getCsrfToken();


        // =============================================
        // PAYLOAD
        // =============================================

        const payload = {

            Status:
                status
        };


        console.log(
            `Updating request ${requestId} status to ${status}`
        );


        // =============================================
        // UPDATE SAP
        // =============================================

        const response =
            await sapClient.put(

                `${REQUEST_ENTITY_SET}(RequestId='${requestId}')`,

                payload,

                {
                    headers: {

                        "X-CSRF-Token":
                            csrfToken,

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"
                    }
                }

            );


        return response.data.d;
    };


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getAllRequests,

    getRequestById,

    getRequestsByHospitalId,

    generateRequestId,

    createRequest,

    updateRequestStatus
};