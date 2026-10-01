import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // User is not logged in
    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    // Check whether the user's role is allowed
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        // Send user to their own dashboard
        if (user.role === "BLOOD_BANK") {
            return (
                <Navigate
                    to="/blood-bank/dashboard"
                    replace
                />
            );
        }

        if (user.role === "HOSPITAL") {
            return (
                <Navigate
                    to="/hospital/dashboard"
                    replace
                />
            );
        }

        // Unknown role
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    // User is authenticated and authorized
    return children;
}

export default ProtectedRoute;