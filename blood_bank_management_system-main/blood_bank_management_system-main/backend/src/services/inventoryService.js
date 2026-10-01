const sapClient = require("./sapService");
const { sapPost } = sapClient;

const DONOR_ENTITY_SET =
    "ZDONOR_ENTITYSet";


// ==========================================
// INVENTORY ENTITY SET
// ==========================================

const INVENTORY_ENTITY_SET =
    "ZBLOOD_INVENTORY_ENTITYSet";


// ==========================================
// GET ALL INVENTORY
// ==========================================

// ==========================================
// GET ALL INVENTORY WITH DONOR DETAILS
// ==========================================

const getAllInventory = async () => {

    // --------------------------------------
    // Get inventory records
    // --------------------------------------

    const inventoryResponse =
        await sapClient.get(
            INVENTORY_ENTITY_SET
        );


    const inventory =
        inventoryResponse.data.d.results;


    // --------------------------------------
    // Get donor records
    // --------------------------------------

    const donorResponse =
        await sapClient.get(
            DONOR_ENTITY_SET
        );


    const donors =
        donorResponse.data.d.results;


    // --------------------------------------
    // Add donor name and age to inventory
    // --------------------------------------

    const inventoryWithDonorDetails =

        inventory.map(
            (item) => {


                const donor =
                    donors.find(

                        (donorItem) =>

                            donorItem.DonorId ===
                            item.DonorId

                    );


                return {

                    ...item,


                    // Donor details
                    DonorName:

                        donor
                            ? donor.DonorName
                            : "-",


                    DonorAge:

                        donor
                            ? donor.Age
                            : "-"

                };

            }
        );


    return inventoryWithDonorDetails;

};


// ==========================================
// GET INVENTORY BY BLOOD UNIT ID
// ==========================================

const getInventoryById = async (
    bloodUnitId
) => {

    if (!bloodUnitId) {
        return null;
    }

    const response =
        await sapClient.get(
            INVENTORY_ENTITY_SET,
            {
                params: {
                    $filter:
                        `BloodUnitId eq '${bloodUnitId}'`
                }
            }
        );

    const inventory =
        response.data.d.results;

    if (!inventory ||
        inventory.length === 0) {

        return null;
    }

    return inventory[0];
};


// ==========================================
// GENERATE RANDOM BLOOD UNIT ID
// ==========================================

const generateBloodUnitId = async () => {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    while (true) {

        let bloodUnitId = "B";

        for (let i = 0; i < 9; i++) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    characters.length
                );

            bloodUnitId +=
                characters[randomIndex];
        }


        const existingUnit =
            await getInventoryById(
                bloodUnitId
            );


        if (!existingUnit) {

            return bloodUnitId;

        }
    }
};


// ==========================================
// CREATE BLOOD UNIT
// ==========================================

const createInventory = async (
    inventoryData
) => {

    const {
        donorId,
        bloodGroup,
        collectionDate,
        expiryDate
    } = inventoryData;


    const bloodUnitId =
        await generateBloodUnitId();


    const payload = {

        BloodUnitId:
            bloodUnitId,

        DonorId:
            donorId,

        BloodGroup:
            bloodGroup,

        CollectionDate:
            `/Date(${new Date(
                collectionDate
            ).getTime()})/`,

        ExpiryDate:
            `/Date(${new Date(
                expiryDate
            ).getTime()})/`,

        Status:
            "AVAILABLE"
    };


    console.log(
        "Creating inventory:",
        payload
    );


    const response =
        await sapPost(
            INVENTORY_ENTITY_SET,
            payload
        );


    return response.data.d;
};


// ==========================================
// UPDATE COMPLETE BLOOD UNIT
// ==========================================

const updateInventory = async (
    bloodUnitId,
    inventoryData
) => {

    if (!bloodUnitId) {

        throw new Error(
            "Blood Unit ID is required"
        );
    }


    const csrfToken =
        await getCsrfToken();


    const payload = {

        DonorId:
            inventoryData.donorId,

        BloodGroup:
            inventoryData.bloodGroup,

        CollectionDate:
            `/Date(${new Date(
                inventoryData.collectionDate
            ).getTime()})/`,

        ExpiryDate:
            `/Date(${new Date(
                inventoryData.expiryDate
            ).getTime()})/`,

        Status:
            inventoryData.status
    };


    console.log(
        "Updating complete inventory:",
        payload
    );


    const response =
        await sapClient.put(
            `${INVENTORY_ENTITY_SET}('${bloodUnitId}')`,
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


// ==========================================
// GET CSRF TOKEN
// ==========================================

const getCsrfToken = async () => {

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


// ==========================================
// UPDATE ONLY INVENTORY STATUS
// USED DURING BLOOD ALLOCATION
// ==========================================

const updateInventoryStatus = async (
    bloodUnitId,
    status
) => {

    if (!bloodUnitId) {

        throw new Error(
            "Blood Unit ID is required"
        );
    }


    if (!status) {

        throw new Error(
            "Inventory status is required"
        );
    }


    console.log(
        "Updating inventory status"
    );

    console.log(
        "Blood Unit ID:",
        bloodUnitId
    );

    console.log(
        "New Status:",
        status
    );


    const csrfToken =
        await getCsrfToken();


    // Only send the field that needs updating.
    // Do NOT send CollectionDate or ExpiryDate.
    const payload = {

        Status:
            status
    };


    const response =
        await sapClient.patch(
            `${INVENTORY_ENTITY_SET}('${bloodUnitId}')`,
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


    console.log(
        "Inventory status updated successfully"
    );


    return response.data.d;
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {

    getAllInventory,

    getInventoryById,

    generateBloodUnitId,

    createInventory,

    updateInventory,

    updateInventoryStatus

};