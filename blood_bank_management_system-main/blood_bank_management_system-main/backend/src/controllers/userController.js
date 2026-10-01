const { createUser } = require("../services/userService");

const registerUser = async (req, res) => {
    try {

        const {
            username,
            password,
            role,
            hospitalId,
            email,
            status
        } = req.body;


        // Basic validation
        if (
            !username ||
            !password ||
            !role ||
            !email
        ) {
            return res.status(400).json({
                success: false,
                message: "Username, password, role and email are required"
            });
        }


        // Validate role
        if (
            role !== "HOSPITAL" &&
            role !== "BLOOD_BANK"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }


        // Hospital user must have a hospital
        if (
            role === "HOSPITAL" &&
            !hospitalId
        ) {
            return res.status(400).json({
                success: false,
                message: "Hospital is required for a Hospital user"
            });
        }


        // Blood Bank user must not belong to a hospital
        if (
            role === "BLOOD_BANK" &&
            hospitalId
        ) {
            return res.status(400).json({
                success: false,
                message: "Blood Bank user cannot be assigned to a hospital"
            });
        }


        // Create user
        const user = await createUser({
            username,
            password,
            role,
            hospitalId,
            email,
            status
        });


        // Return safe user information
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                userId: user.UserId,
                username: user.Username,
                role: user.Role,
                hospitalId: user.HospitalId,
                email: user.Email,
                status: user.Status
            }
        });

    } catch (error) {

        console.error(
            "Register user error:",
            error.response?.data || error.message
        );


        // Username already exists
        if (
            error.message === "Username already exists"
        ) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }


        return res.status(500).json({
            success: false,
            message: "Failed to register user",
            error:
                error.response?.data ||
                error.message
        });
    }
};


module.exports = {
    registerUser
};