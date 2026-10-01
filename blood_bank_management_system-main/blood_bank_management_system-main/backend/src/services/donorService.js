const sapClient = require("./sapService");
const { sapPost } = sapClient;


// ============================================================
// GET ALL DONORS
// ============================================================

const getAllDonors = async () => {

    const response = await sapClient.get(
        "ZDONOR_ENTITYSet"
    );

    return response.data.d.results;
};


// ============================================================
// GET DONOR BY ID
// ============================================================

const getDonorById = async (donorId) => {

    const response = await sapClient.get(
        "ZDONOR_ENTITYSet",
        {
            params: {
                $filter: `DonorId eq '${donorId}'`
            }
        }
    );

    const donors = response.data.d.results;

    if (donors.length === 0) {
        return null;
    }

    return donors[0];
};


// ============================================================
// GENERATE RANDOM DONOR ID
// ============================================================

const generateDonorId = async () => {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    while (true) {

        let donorId = "D";

        // Generate remaining 9 characters
        for (let i = 0; i < 9; i++) {

            const randomIndex =
                Math.floor(
                    Math.random() * characters.length
                );

            donorId += characters[randomIndex];
        }


        // Check whether generated ID already exists
        const existingDonor =
            await getDonorById(donorId);


        // ID is unique
        if (!existingDonor) {

            return donorId;
        }

        // If duplicate, loop and generate another ID
    }
};


// ============================================================
// CREATE DONOR
// ============================================================

const createDonor = async (donorData) => {

    const {
        donorName,
        gender,
        age,
        bloodGroup,
        mobileNo,
        address,
        lastDonationDate
    } = donorData;


    // --------------------------------------------------------
    // Generate Donor ID automatically
    // --------------------------------------------------------

    const donorId = await generateDonorId();


    // --------------------------------------------------------
    // Prepare SAP OData payload
    // --------------------------------------------------------

    const payload = {
        DonorId: donorId,
        DonorName: donorName,
        Gender: gender,
        Age: Number(age),
        BloodGroup: bloodGroup,
        MobileNo: mobileNo,
        Address: address
    };


    // --------------------------------------------------------
    // Add LastDonationDate only if user entered it
    //
    // We are intentionally not sending null because SAP DATS
    // previously caused conversion problems.
    // --------------------------------------------------------

    if (lastDonationDate) {

        payload.LastDonationDate =
            `/Date(${new Date(donorData.lastDonationDate).getTime()})/`;
    }


    // --------------------------------------------------------
    // Create donor in SAP
    // --------------------------------------------------------

    const response = await sapPost(
        "ZDONOR_ENTITYSet",
        payload
    );


    return response.data.d;
};


// ============================================================
// UPDATE DONOR
// ============================================================

const updateDonor = async (donorId, donorData) => {


    // --------------------------------------------------------
    // Get fresh CSRF token
    // --------------------------------------------------------

    const csrfResponse = await sapClient.get(
        "",
        {
            headers: {
                "X-CSRF-Token": "Fetch"
            }
        }
    );


    const csrfToken =
        csrfResponse.headers["x-csrf-token"];


    // --------------------------------------------------------
    // Prepare update payload
    //
    // IMPORTANT:
    // LastDonationDate is intentionally excluded.
    //
    // Earlier SAP error:
    // CX_SY_CONVERSION_NO_DATE_TIME
    //
    // So we first make all other donor fields work.
    // --------------------------------------------------------

    const payload = {

        DonorName: donorData.donorName,

        Gender: donorData.gender,

        Age: Number(donorData.age),

        BloodGroup: donorData.bloodGroup,

        MobileNo: donorData.mobileNo,

        Address: donorData.address
    };


    // --------------------------------------------------------
    // Update donor in SAP
    // --------------------------------------------------------

    const response = await sapClient.put(

        `ZDONOR_ENTITYSet(DonorId='${donorId}')`,

        payload,

        {
            headers: {

                "X-CSRF-Token": csrfToken,

                "Content-Type": "application/json",

                Accept: "application/json"
            }
        }
    );


    return response.data.d;
};


// ============================================================
// DELETE DONOR
// ============================================================

const deleteDonor = async (donorId) => {
    const csrfToken = await sapClient
        .get("", {
            headers: {
                "X-CSRF-Token": "Fetch"
            }
        })
        .then((response) => response.headers["x-csrf-token"]);

    const response = await sapClient.delete(
        `ZDONOR_ENTITYSet(DonorId='${donorId}')`,
        {
            headers: {
                "X-CSRF-Token": csrfToken,
                Accept: "application/json"
            }
        }
    );

    return response;
};

// ============================================================
// UPDATE LAST DONATION DATE ONLY
// ============================================================

const updateLastDonationDate =
    async (donorId, donationDate) => {

        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!donorId) {

            throw new Error(
                "Donor ID is required"
            );
        }


        if (!donationDate) {

            throw new Error(
                "Donation date is required"
            );
        }


        // ----------------------------------------------------
        // GET DONOR FIRST
        //
        // We get the complete donor because SAP PUT may require
        // the complete entity data.
        // ----------------------------------------------------

        const donor =
            await getDonorById(
                donorId
            );


        if (!donor) {

            throw new Error(
                `Donor ${donorId} not found`
            );
        }


        // ----------------------------------------------------
        // GET CSRF TOKEN
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // PREPARE DATE
        //
        // Same OData date format used while creating donor.
        // ----------------------------------------------------

        const formattedDonationDate =
            `/Date(${new Date(donationDate).getTime()})/`;


        // ----------------------------------------------------
        // COMPLETE PAYLOAD
        // ----------------------------------------------------

        const payload = {

            DonorName:
                donor.DonorName,

            Gender:
                donor.Gender,

            Age:
                Number(
                    donor.Age
                ),

            BloodGroup:
                donor.BloodGroup,

            MobileNo:
                donor.MobileNo,

            Address:
                donor.Address,

            LastDonationDate:
                formattedDonationDate
        };


        console.log(
            "Updating donor LastDonationDate:"
        );

        console.log(
            payload
        );


        // ----------------------------------------------------
        // UPDATE DONOR
        // ----------------------------------------------------

        const response =
            await sapClient.put(

                `ZDONOR_ENTITYSet(DonorId='${donorId}')`,

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

// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getAllDonors,

    getDonorById,

    generateDonorId,

    createDonor,

    updateDonor,

    updateLastDonationDate,

    deleteDonor
};