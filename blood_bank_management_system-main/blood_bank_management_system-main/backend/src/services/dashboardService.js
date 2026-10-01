const sapClient = require("./sapService");

// Get all donors
const getTotalDonors = async () => {
    const response = await sapClient.get("ZDONOR_ENTITYSet");

    const donors = response.data.d.results;

    return donors.length;
};


// Get all hospitals
const getTotalHospitals = async () => {
    const response = await sapClient.get("ZHOSPITAL_ENTITYSet");

    const hospitals = response.data.d.results;

    return hospitals.length;
};


// Get available blood inventory
const getAvailableInventory = async () => {
    const response = await sapClient.get("ZBLOOD_INVENTORY_ENTITYSet", {
        params: {
            $filter: "Status eq 'AVAILABLE'"
        }
    });

    return response.data.d.results;
};

const getInventoryStatusSummary = async () => {
    const response = await sapClient.get(
        "ZBLOOD_INVENTORY_ENTITYSet"
    );

    const inventory = response.data.d.results;

    const summary = {
        available: 0,
        allocated: 0,
        expired: 0
    };

    inventory.forEach((unit) => {

        if (unit.Status === "AVAILABLE") {
            summary.available++;
        }

        if (unit.Status === "ALLOCATED") {
            summary.allocated++;
        }

        if (unit.ExpiryDate) {

            let expiryDate = unit.ExpiryDate;

            // Handle SAP OData date format:
            // /Date(1788393600000)/

            if (expiryDate.includes("/Date(")) {

                const timestamp = parseInt(
                    expiryDate.replace("/Date(", "").replace(")/", ""),
                    10
                );

                expiryDate = new Date(timestamp);
            } else {

                expiryDate = new Date(expiryDate);
            }

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            if (expiryDate < today) {
                summary.expired++;
            }
        }
    });

    return summary;
};


// Get all blood requests
const getAllRequests = async () => {
    const response = await sapClient.get("ZBLOOD_REQUEST_ENTITYSet");

    return response.data.d.results;
};


// Get recent requests
const getRecentRequests = async () => {
    const response = await sapClient.get("ZBLOOD_REQUEST_ENTITYSet", {
        params: {
            $orderby: "RequestDate desc",
            $top: 5
        }
    });

    return response.data.d.results;
};


// Get recent allocations
const getRecentAllocations = async () => {
    const response = await sapClient.get("ZBLOOD_ALLOCATION_ENTITYSet", {
        params: {
            $orderby: "AllocationDate desc",
            $top: 5
        }
    });

    return response.data.d.results;
};


// Get complete dashboard data
const getDashboardData = async () => {

    const [
    totalDonors,
    totalHospitals,
    availableInventory,
    allRequests,
    recentRequests,
    recentAllocations,
    inventoryStatusSummary
] = await Promise.all([
        getTotalDonors(),
        getTotalHospitals(),
        getAvailableInventory(),
        getAllRequests(),
        getRecentRequests(),
        getRecentAllocations(),
        getInventoryStatusSummary()
    ]);


    // Count requests according to status
    const pendingRequests = allRequests.filter(
        request => request.Status === "PENDING"
    ).length;

    const approvedRequests = allRequests.filter(
        request => request.Status === "APPROVED"
    ).length;

    const allocatedRequests = allRequests.filter(
        request => request.Status === "ALLOCATED"
    ).length;


    // Count available blood units according to blood group
    const bloodGroupInventory = {};

    availableInventory.forEach(unit => {

        const bloodGroup = unit.BloodGroup;

        if (!bloodGroupInventory[bloodGroup]) {
            bloodGroupInventory[bloodGroup] = 0;
        }

        bloodGroupInventory[bloodGroup]++;
    });


    return {
        totalDonors,
        totalHospitals,
        availableUnits: availableInventory.length,
        pendingRequests,
        approvedRequests,
        allocatedRequests,
        bloodGroupInventory,
        recentRequests,
        recentAllocations,
        inventoryStatusSummary
    };
};


module.exports = {
    getTotalDonors,
    getTotalHospitals,
    getAvailableInventory,
    getAllRequests,
    getRecentRequests,
    getRecentAllocations,
    getInventoryStatusSummary,
    getDashboardData
};