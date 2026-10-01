const {
    getAllHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital
} = require("../services/hospitalService");

// Get all hospitals
const getHospitals = async (req, res) => {
    try {
        const hospitals = await getAllHospitals();

        return res.status(200).json({
            success: true,
            data: hospitals
        });
    } catch (error) {
        console.error(
            "Get hospitals error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load hospitals",
            error: error.response?.data || error.message
        });
    }
};

// Get hospital by ID
const getHospital = async (req, res) => {
    try {
        const { hospitalId } = req.params;

        const hospital = await getHospitalById(hospitalId);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: hospital
        });
    } catch (error) {
        console.error(
            "Get hospital error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load hospital details",
            error: error.response?.data || error.message
        });
    }
};

// Create hospital
const registerHospital = async (req, res) => {
    try {
        const {
            hospitalName,
            address,
            contactNo
        } = req.body;

        if (!hospitalName || !address || !contactNo) {
            return res.status(400).json({
                success: false,
                message:
                    "Hospital name, address and contact number are required"
            });
        }

        const hospital = await createHospital({
            hospitalName,
            address,
            contactNo
        });

        return res.status(201).json({
            success: true,
            message: "Hospital registered successfully",
            data: {
                hospitalId: hospital.HospitalId,
                hospitalName: hospital.HospitalName,
                address: hospital.Address,
                contactNo: hospital.ContactNo
            }
        });
    } catch (error) {
        console.error(
            "Create hospital error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to register hospital",
            error: error.response?.data || error.message
        });
    }
};

// Update hospital
const editHospital = async (req, res) => {
    try {
        const { hospitalId } = req.params;

        const {
            hospitalName,
            address,
            contactNo
        } = req.body;

        if (!hospitalName || !address || !contactNo) {
            return res.status(400).json({
                success: false,
                message:
                    "Hospital name, address and contact number are required"
            });
        }

        const existingHospital = await getHospitalById(hospitalId);

        if (!existingHospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        const hospital = await updateHospital(hospitalId, {
            hospitalName,
            address,
            contactNo
        });

        return res.status(200).json({
            success: true,
            message: "Hospital updated successfully",
            data: hospital
        });
    } catch (error) {
        console.error(
            "Update hospital error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update hospital",
            error: error.response?.data || error.message
        });
    }
};

// Delete hospital
const removeHospital = async (req, res) => {
    try {
        const { hospitalId } = req.params;

        const existingHospital = await getHospitalById(hospitalId);

        if (!existingHospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        await deleteHospital(hospitalId);

        return res.status(200).json({
            success: true,
            message: "Hospital deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete hospital error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete hospital",
            error: error.response?.data || error.message
        });
    }
};

module.exports = {
    getHospitals,
    getHospital,
    registerHospital,
    editHospital,
    removeHospital
};