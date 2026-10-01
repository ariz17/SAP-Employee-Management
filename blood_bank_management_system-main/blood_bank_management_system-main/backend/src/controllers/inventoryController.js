const {
    getAllInventory,
    getInventoryById,
    createInventory,
    updateInventory
} = require("../services/inventoryService");

const {
    updateLastDonationDate
} = require("../services/donorService");

// ==========================================
// GET ALL INVENTORY
// ==========================================

const getInventory = async (req, res) => {
    try {
        const inventory = await getAllInventory();

        return res.status(200).json({
            success: true,
            data: inventory
        });

    } catch (error) {
        console.error(
            "Get inventory error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load inventory",
            error: error.response?.data || error.message
        });
    }
};


// ==========================================
// GET INVENTORY BY BLOOD UNIT ID
// ==========================================

const getInventoryDetails = async (req, res) => {
    try {
        const { bloodUnitId } = req.params;

        const inventory = await getInventoryById(bloodUnitId);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Blood unit not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: inventory
        });

    } catch (error) {
        console.error(
            "Get inventory details error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load blood unit details",
            error: error.response?.data || error.message
        });
    }
};


// ==========================================
// CREATE BLOOD UNIT
// ==========================================

const registerInventory = async (req, res) => {
    try {
        const {
            donorId,
            bloodGroup,
            collectionDate,
            expiryDate
        } = req.body;

        // Required fields
        if (
            !donorId ||
            !bloodGroup ||
            !collectionDate ||
            !expiryDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Donor ID, blood group, collection date and expiry date are required"
            });
        }

        // Date validation
        if (expiryDate < collectionDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Expiry date cannot be before collection date"
            });
        }

        const inventory = await createInventory({
            donorId,
            bloodGroup,
            collectionDate,
            expiryDate
        });

        await updateLastDonationDate(
    donorId,
    collectionDate
);

        return res.status(201).json({
            success: true,
            message:
                "Blood unit added to inventory successfully",
            data: {
                bloodUnitId: inventory.BloodUnitId,
                donorId: inventory.DonorId,
                bloodGroup: inventory.BloodGroup,
                collectionDate: inventory.CollectionDate,
                expiryDate: inventory.ExpiryDate,
                status: inventory.Status
            }
        });

    } catch (error) {
        console.error(
            "Create inventory error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to add blood unit",
            error: error.response?.data || error.message
        });
    }
};


// ==========================================
// UPDATE BLOOD UNIT
// ==========================================

const editInventory = async (req, res) => {
    try {
        const { bloodUnitId } = req.params;

        const {
            donorId,
            bloodGroup,
            collectionDate,
            expiryDate,
            status
        } = req.body;

        // Required fields
        if (
            !donorId ||
            !bloodGroup ||
            !collectionDate ||
            !expiryDate ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "All inventory fields are required"
            });
        }

        // Date validation
        if (expiryDate < collectionDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Expiry date cannot be before collection date"
            });
        }

        // Validate status
        const validStatuses = [
            "AVAILABLE",
            "ALLOCATED"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid inventory status"
            });
        }

        // Check whether blood unit exists
        const existingInventory =
            await getInventoryById(bloodUnitId);

        if (!existingInventory) {
            return res.status(404).json({
                success: false,
                message: "Blood unit not found"
            });
        }

        const inventory = await updateInventory(
            bloodUnitId,
            {
                donorId,
                bloodGroup,
                collectionDate,
                expiryDate,
                status
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "Blood unit updated successfully",
            data: inventory
        });

    } catch (error) {
        console.error(
            "Update inventory error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update blood unit",
            error: error.response?.data || error.message
        });
    }
};


module.exports = {
    getInventory,
    getInventoryDetails,
    registerInventory,
    editInventory
};