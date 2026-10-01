const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // 1. Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token is required"
            });
        }

        // 2. Check Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }

        // 3. Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token is missing"
            });
        }

        // 4. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 5. Store decoded user information
        // so controllers can access it through req.user
        req.user = decoded;

        // 6. Continue to the requested API
        next();

    } catch (error) {

        // JWT has expired
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired"
            });
        }

        // JWT is invalid
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        // Any other authentication error
        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

module.exports = authMiddleware;