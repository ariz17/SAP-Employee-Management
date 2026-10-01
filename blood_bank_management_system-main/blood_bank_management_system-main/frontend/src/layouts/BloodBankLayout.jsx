import { NavLink, Outlet, useNavigate } from "react-router-dom";

function BloodBankLayout() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const menuItems = [
        {
            label: "Dashboard",
            path: "/blood-bank/dashboard",
            icon: "⌂"
        },
        {
            label: "Donors",
            path: "/blood-bank/donors",
            icon: "♙"
        },
        {
            label: "Hospitals",
            path: "/blood-bank/hospitals",
            icon: "▣"
        },
        {
            label: "Inventory",
            path: "/blood-bank/inventory",
            icon: "▤"
        },
        {
            label: "Requests",
            path: "/blood-bank/requests",
            icon: "↗"
        },
        {
            label: "Allocations",
            path: "/blood-bank/allocations",
            icon: "✓"
        },
        {
            label: "Reports",
            path: "/blood-bank/reports",
            icon: "▥"
        },
        {
            label: "Analytics",
            path: "/blood-bank/analytics",
            icon: "◒"
        },
        {
            label: "Register User",
            path: "/blood-bank/register-user",
            icon: "+"
        }
    ];

    return (
        <div className="app-layout">

            {/* ================= SIDEBAR ================= */}

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <div className="sidebar-logo">
                        +
                    </div>

                    <div>
                        <h2>BloodCare</h2>
                        <span>Management System</span>
                    </div>

                </div>


                <div className="sidebar-section-title">
                    MAIN MENU
                </div>


                <nav className="sidebar-nav">

                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive
                                        ? "sidebar-link-active"
                                        : ""
                                }`
                            }
                        >

                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>

                        </NavLink>
                    ))}

                </nav>


                {/* Sidebar Bottom */}

                <div className="sidebar-bottom">

                    <div className="sidebar-help">
                        <div className="help-icon">
                            ?
                        </div>

                        <div>
                            <strong>Need Help?</strong>
                            <span>Contact administrator</span>
                        </div>
                    </div>

                </div>

            </aside>


            {/* ================= MAIN AREA ================= */}

            <div className="main-area">

                {/* Top Header */}

                <header className="top-header">

                    <div className="header-title">

                        <h1>
                            Blood Bank Management
                        </h1>

                        <p>
                            Manage blood operations efficiently
                        </p>

                    </div>


                    <div className="header-user">

                        <div className="notification">
                            <span>♢</span>
                            <div className="notification-dot"></div>
                        </div>


                        <div className="user-info">

                            <div className="user-avatar">
                                {user?.username
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                            </div>

                            <div className="user-details">

                                <strong>
                                    {user?.username || "User"}
                                </strong>

                                <span>
                                    Blood Bank Admin
                                </span>

                            </div>

                        </div>


                        <button
                            className="header-logout"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            ↪
                        </button>

                    </div>

                </header>


                {/* Page Content */}

                <main className="page-content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default BloodBankLayout;