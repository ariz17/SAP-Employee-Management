const {
    getAllInventory
} = require("./inventoryService");

const {
    getAllDonors
} = require("./donorService");


// ============================================================
// GET INVENTORY REPORT
// ============================================================

const getInventoryReport = async () => {

    const inventory =
        await getAllInventory();

    return inventory;
};


// ============================================================
// GET DONOR REPORT
// ============================================================

const getDonorReport = async () => {

    const donors =
        await getAllDonors();

    return donors;
};


// ============================================================
// GET DONATION HISTORY REPORT
//
// A donation/blood collection is represented by a blood unit
// created for a donor.
//
// This report combines inventory information with donor data.
// ============================================================

const getDonationHistoryReport =
    async () => {

        const inventory =
            await getAllInventory();


        const donationHistory =
            inventory.map(
                (unit) => {

                    return {

                        BloodUnitId:
                            unit.BloodUnitId,

                        DonorId:
                            unit.DonorId,

                        DonorName:
                            unit.DonorName ||
                            "-",

                        DonorAge:
                            unit.DonorAge ||
                            "-",

                        BloodGroup:
                            unit.BloodGroup,

                        DonationDate:
                            unit.CollectionDate,

                        ExpiryDate:
                            unit.ExpiryDate,

                        Status:
                            unit.Status
                    };

                }
            );


        return donationHistory;

    };


// ============================================================
// GET AVAILABLE BLOOD UNITS REPORT
// ============================================================

const getAvailableBloodReport =
    async () => {

        const inventory =
            await getAllInventory();


        return inventory.filter(
            (unit) => {

                return (
                    unit.Status ===
                    "AVAILABLE"
                );

            }
        );

    };


// ============================================================
// GET EXPIRED BLOOD UNITS REPORT
//
// Expiry is calculated using ExpiryDate.
// We do not change the existing inventory status.
// ============================================================

const getExpiredBloodReport =
    async () => {

        const inventory =
            await getAllInventory();


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        return inventory.filter(
            (unit) => {

                if (
                    !unit.ExpiryDate
                ) {

                    return false;

                }


                // SAP OData dates can arrive in:
                // /Date(1234567890000)/
                // or a normal date string.

                let expiryDate;


                if (
                    typeof unit.ExpiryDate ===
                    "string" &&

                    unit.ExpiryDate.includes(
                        "/Date("
                    )
                ) {

                    const timestamp =
                        Number(

                            unit.ExpiryDate
                                .replace(
                                    "/Date(",
                                    ""
                                )
                                .replace(
                                    ")/",
                                    ""
                                )

                        );


                    expiryDate =
                        new Date(
                            timestamp
                        );

                } else {

                    expiryDate =
                        new Date(
                            unit.ExpiryDate
                        );

                }


                expiryDate.setHours(
                    0,
                    0,
                    0,
                    0
                );


                return (
                    expiryDate <
                    today
                );

            }
        );

    };


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    getInventoryReport,

    getDonorReport,

    getDonationHistoryReport,

    getAvailableBloodReport,

    getExpiredBloodReport

};