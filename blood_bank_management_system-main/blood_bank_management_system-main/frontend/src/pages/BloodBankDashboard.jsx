import { useEffect, useState } from "react";
import api from "../services/api";

function BloodBankDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/blood-bank/dashboard");

            setDashboard(response.data.data);
        } catch (error) {
            console.error("Dashboard loading error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-section">
                <div className="empty-state">
                    <h3>Loading dashboard...</h3>
                    <p>Fetching the latest blood bank data.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-section">
                <div className="empty-state">
                    <div className="empty-state-icon">!</div>

                    <h3>Unable to load dashboard</h3>

                    <p>{error}</p>

                    <button
                        className="login-button"
                        onClick={loadDashboard}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>

            {/* Page Heading */}

            <div className="dashboard-page-heading">
                <div>
                    <h2>Dashboard Overview</h2>

                    <p>
                        Monitor your blood bank operations
                        and activities.
                    </p>
                </div>
            </div>


            {/* Main Dashboard Cards */}

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <span>Total Donors</span>

                    <strong>
                        {dashboard.totalDonors}
                    </strong>

                    <small>
                        Registered donors
                    </small>
                </div>


                <div className="dashboard-card">
                    <span>Blood Units</span>

                    <strong>
                        {dashboard.availableUnits}
                    </strong>

                    <small>
                        Available units
                    </small>
                </div>


                <div className="dashboard-card">
                    <span>Pending Requests</span>

                    <strong>
                        {dashboard.pendingRequests}
                    </strong>

                    <small>
                        Awaiting processing
                    </small>
                </div>


                <div className="dashboard-card">
                    <span>Hospitals</span>

                    <strong>
                        {dashboard.totalHospitals}
                    </strong>

                    <small>
                        Registered hospitals
                    </small>
                </div>

            </div>


            {/* Request Statistics */}

            <div className="dashboard-section">

                <div className="section-header">
                    <div>
                        <h3>Request Statistics</h3>

                        <p>
                            Current blood request status
                        </p>
                    </div>
                </div>


                <div className="dashboard-cards">

                    <div className="dashboard-card">
                        <span>Pending</span>

                        <strong>
                            {dashboard.pendingRequests}
                        </strong>

                        <small>
                            Awaiting processing
                        </small>
                    </div>


                    <div className="dashboard-card">
                        <span>Approved</span>

                        <strong>
                            {dashboard.approvedRequests}
                        </strong>

                        <small>
                            Approved requests
                        </small>
                    </div>


                    <div className="dashboard-card">
                        <span>Allocated</span>

                        <strong>
                            {dashboard.allocatedRequests}
                        </strong>

                        <small>
                            Successfully allocated
                        </small>
                    </div>

                </div>

            </div>

{/* Inventory Status */}
<div className="dashboard-section">
    <div className="section-header">
        <div>
            <h3>Inventory Status</h3>
            <p>Current status of all blood units</p>
        </div>
    </div>

    <div className="inventory-status-grid">

        <div className="inventory-status-card">
            <div className="inventory-status-icon available-icon">
                ✓
            </div>

            <div className="inventory-status-info">
                <span>Available</span>
                <strong>
                    {dashboard.inventoryStatusSummary?.available || 0}
                </strong>
                <small>Blood units</small>
            </div>
        </div>


        <div className="inventory-status-card">
            <div className="inventory-status-icon allocated-icon">
                →
            </div>

            <div className="inventory-status-info">
                <span>Allocated</span>
                <strong>
                    {dashboard.inventoryStatusSummary?.allocated || 0}
                </strong>
                <small>Blood units</small>
            </div>
        </div>


        <div className="inventory-status-card">
            <div className="inventory-status-icon expired-icon">
                !
            </div>

            <div className="inventory-status-info">
                <span>Expired</span>
                <strong>
                    {dashboard.inventoryStatusSummary?.expired || 0}
                </strong>
                <small>Blood units</small>
            </div>
        </div>

    </div>
</div>

            {/* Recent Activity */}

            <div className="dashboard-section">

                <div className="section-header">
                    <div>
                        <h3>Recent Activity</h3>

                        <p>
                            Latest blood bank activities
                        </p>
                    </div>
                </div>


                <div className="activity-list">

                    {/* Recent Requests */}

                    {dashboard.recentRequests &&
                        dashboard.recentRequests.map((request) => (

                            <div
                                className="activity-card"
                                key={"request-" + request.RequestId}
                            >

                                <div className="activity-icon request-icon">
                                    +
                                </div>


                                <div className="activity-content">

                                    <div className="activity-title-row">

                                        <div>
                                            <h4>
                                                Blood Request
                                            </h4>

                                            <span className="activity-id">
                                                {request.RequestId}
                                            </span>
                                        </div>


                                        <span
                                            className={
                                                "status-badge status-" +
                                                request.Status.toLowerCase()
                                            }
                                        >
                                            {request.Status}
                                        </span>

                                    </div>


                                    <div className="activity-details">

                                        <div>
                                            <span>
                                                Blood Group
                                            </span>

                                            <strong>
                                                {request.BloodGroup}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Quantity
                                            </span>

                                            <strong>
                                                {request.Quantity} units
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Request Date
                                            </span>

                                            <strong>
                                                {request.RequestDate}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}


                    {/* Recent Allocations */}

                    {dashboard.recentAllocations &&
                        dashboard.recentAllocations.map((allocation) => (

                            <div
                                className="activity-card"
                                key={"allocation-" + allocation.AllocationId}
                            >

                                <div className="activity-icon allocation-icon">
                                    ✓
                                </div>


                                <div className="activity-content">

                                    <div className="activity-title-row">

                                        <div>
                                            <h4>
                                                Blood Allocation
                                            </h4>

                                            <span className="activity-id">
                                                {allocation.AllocationId}
                                            </span>
                                        </div>


                                        <span className="status-badge status-allocated">
                                            ALLOCATED
                                        </span>

                                    </div>


                                    <div className="activity-details">

                                        <div>
                                            <span>
                                                Request ID
                                            </span>

                                            <strong>
                                                {allocation.RequestId}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Blood Unit
                                            </span>

                                            <strong>
                                                {allocation.BloodUnitId}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Allocation Date
                                            </span>

                                            <strong>
                                                {allocation.AllocationDate}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}


                    {/* Empty State */}

                    {dashboard.recentRequests?.length === 0 &&
                        dashboard.recentAllocations?.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-state-icon">
                                    +
                                </div>

                                <h3>
                                    No recent activity
                                </h3>

                                <p>
                                    Recent requests, allocations and
                                    inventory activities will appear here.
                                </p>

                            </div>

                        )}

                </div>

            </div>

        </div>
    );
}

export default BloodBankDashboard;