const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserByUsername } = require("../services/userService");

const login = async (req, res) => {
    try {
        // 1. Get username and password from request
        const { username, password } = req.body;

        // 2. Validate input
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        // 3. Find user in SAP
        const user = await getUserByUsername(username);

        // 4. Check if user exists
        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        // 5. Check whether account is active
        if (user.Status !== "ACTIVE") {
            return res.status(403).json({
                message: "User account is inactive"
            });
        }

        // 6. Compare entered password with bcrypt hash from SAP
        const passwordMatch = await bcrypt.compare(
            password,
            user.PasswordHash
        );

        // 7. Check password
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        // 8. Create JWT payload
        const tokenPayload = {
            userId: user.UserId,
            username: user.Username,
            role: user.Role,
            hospitalId: user.HospitalId || null
        };

        // 9. Generate JWT
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 10. Send successful login response
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                userId: user.UserId,
                username: user.Username,
                role: user.Role,
                hospitalId: user.HospitalId || null,
                email: user.Email
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Login failed",
            error: error.response?.data || error.message
        });
    }
};

module.exports = {
    login
};