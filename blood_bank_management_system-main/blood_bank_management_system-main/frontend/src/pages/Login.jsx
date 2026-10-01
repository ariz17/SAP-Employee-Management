import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");

        if (!username.trim() || !password) {
            setError("Please enter your username and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "https://blood-bank-management-system-fz0i.onrender.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid username or password.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.role === "BLOOD_BANK") {
                navigate("/blood-bank/dashboard");
            } else if (data.user.role === "HOSPITAL") {
                navigate("/hospital/dashboard");
            } else {
                setError("Invalid user role.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* Left Section */}
                <div className="login-brand">

                    <div className="brand-icon">
                        +
                    </div>

                    <h1>
                        Blood Bank
                        <br />
                        Management System
                    </h1>

                    <p>
                        Connecting blood donors, blood banks,
                        and hospitals through one secure platform.
                    </p>

                    <div className="brand-features">
                        <div>
                            <span>✓</span>
                            Secure blood inventory management
                        </div>

                        <div>
                            <span>✓</span>
                            Hospital blood request tracking
                        </div>

                        <div>
                            <span>✓</span>
                            Real-time allocation management
                        </div>
                    </div>

                </div>


                {/* Right Section */}
                <div className="login-form-section">

                    <div className="login-heading">
                        <h2>Welcome Back</h2>

                        <p>
                            Sign in to access your account
                        </p>
                    </div>


                    <form onSubmit={handleLogin}>

                        {/* Username */}
                        <div className="input-group">

                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    👤
                                </span>

                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(event.target.value)
                                    }
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div className="input-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* Error */}
                        {error && (
                            <div className="login-error">
                                <span>!</span>
                                {error}
                            </div>
                        )}


                        {/* Login Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <span className="arrow">
                                        →
                                    </span>
                                </>
                            )}
                        </button>

                    </form>


                    <div className="login-footer">
                        <p>
                            Blood Bank Management System
                        </p>

                        <span>
                            Secure Healthcare Management
                        </span>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;
