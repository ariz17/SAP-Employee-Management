const {
    getAllDonors,
    getDonorById,
    createDonor,
    updateDonor,
    deleteDonor
} = require("../services/donorService");


// GET all donors
const getDonors = async (req, res) => {

    try {

        const donors = await getAllDonors();

        return res.status(200).json({
            success: true,
            data: donors
        });

    } catch (error) {

        console.error(
            "Get donors error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load donors",
            error: error.response?.data || error.message
        });
    }
};


// GET donor by ID
const getDonor = async (req, res) => {

    try {

        const { donorId } = req.params;

        const donor = await getDonorById(donorId);

        if (!donor) {

            return res.status(404).json({
                success: false,
                message: "Donor not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: donor
        });

    } catch (error) {

        console.error(
            "Get donor error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load donor",
            error: error.response?.data || error.message
        });
    }
};


// POST create donor
const registerDonor = async (req, res) => {

    try {

        const {
            donorId,
            donorName,
            gender,
            age,
            bloodGroup,
            mobileNo,
            address,
            lastDonationDate
        } = req.body;


        // Required-field validation
        if (
            !donorName ||
            !gender ||
            !age ||
            !bloodGroup ||
            !mobileNo
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "name, gender, age, blood group and mobile number are required"
            });
        }


        const donor = await createDonor({
            donorId,
            donorName,
            gender,
            age,
            bloodGroup,
            mobileNo,
            address,
            lastDonationDate
        });


        return res.status(201).json({
            success: true,
            message: "Donor registered successfully",
            data: donor
        });

    } catch (error) {

        console.error(
            "Create donor error:",
            error.response?.data || error.message
        );


        if (error.message === "Donor ID already exists") {

            return res.status(409).json({
                success: false,
                message: "Donor ID already exists"
            });
        }


        return res.status(500).json({
            success: false,
            message: "Failed to register donor",
            error: error.response?.data || error.message
        });
    }
};

// UPDATE donor
const editDonor = async (req, res) => {

    try {

        const { donorId } = req.params;

        const {
            donorName,
            gender,
            age,
            bloodGroup,
            mobileNo,
            address,
            lastDonationDate
        } = req.body;


        // Check whether donor exists
        const existingDonor = await getDonorById(donorId);

        if (!existingDonor) {

            return res.status(404).json({
                success: false,
                message: "Donor not found"
            });
        }


        // Update donor in SAP
        const donor = await updateDonor(donorId, {
            donorName,
            gender,
            age,
            bloodGroup,
            mobileNo,
            address,
            lastDonationDate
        });


        return res.status(200).json({
            success: true,
            message: "Donor updated successfully",
            data: donor
        });

    } catch (error) {

        console.error(
            "Update donor error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update donor",
            error: error.response?.data || error.message
        });
    }
};

// DELETE donor
const removeDonor = async (req, res) => {

    try {

        const { donorId } = req.params;

        // Check whether donor exists
        const existingDonor = await getDonorById(donorId);

        if (!existingDonor) {

            return res.status(404).json({
                success: false,
                message: "Donor not found"
            });
        }

        // Delete donor from SAP
        await deleteDonor(donorId);

        return res.status(200).json({
            success: true,
            message: "Donor deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete donor error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete donor",
            error: error.response?.data || error.message
        });
    }
};

module.exports = {
    getDonors,
    getDonor,
    registerDonor,
    editDonor,
    removeDonor
};