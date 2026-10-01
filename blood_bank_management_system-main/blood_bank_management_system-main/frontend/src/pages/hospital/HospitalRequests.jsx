import React, { useEffect, useState } from "react";
import api from "../../services/api";

const HospitalRequests = () => {
    const [requests, setRequests] = useState([]);

    const [formData, setFormData] = useState({
        bloodGroup: "",
        quantity: ""
    });

    const [selectedRequest, setSelectedRequest] = useState(null);

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // LOAD MY REQUESTS
    // =====================================================

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/hospital/requests");

            setRequests(response.data.data || []);
        } catch (error) {
            console.error(
                "Load requests error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load blood requests"
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD REQUESTS WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {
        loadRequests();
    }, []);

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================================
    // CREATE REQUEST
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.bloodGroup) {
            setError("Please select a blood group");
            return;
        }

        if (!formData.quantity) {
            setError("Please enter quantity");
            return;
        }

        const quantity = Number(formData.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setError("Quantity must be a positive integer");
            return;
        }

        try {
            setFormLoading(true);

            const response = await api.post(
                "/hospital/requests",
                {
                    bloodGroup: formData.bloodGroup,
                    quantity: quantity
                }
            );

            setSuccess(
                response.data.message ||
                "Blood request created successfully"
            );

            setFormData({
                bloodGroup: "",
                quantity: ""
            });

            await loadRequests();

        } catch (error) {
            console.error(
                "Create request error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to create blood request"
            );
        } finally {
            setFormLoading(false);
        }
    };

    // =====================================================
    // VIEW REQUEST DETAILS
    // =====================================================

    const handleViewRequest = async (requestId) => {
        try {
            setError("");

            const response = await api.get(
                `/hospital/requests/${requestId}`
            );

            setSelectedRequest(response.data.data);

        } catch (error) {
            console.error(
                "Get request details error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load request details"
            );
        }
    };

    // =====================================================
    // CLOSE DETAILS MODAL
    // =====================================================

    const closeDetails = () => {
        setSelectedRequest(null);
    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "status-pending";

            case "APPROVED":
                return "status-approved";

            case "REJECTED":
                return "status-rejected";

            case "ALLOCATED":
                return "status-allocated";

            default:
                return "";
        }
    };

    return (
        <div className="hospital-requests-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <div>
                    <h1>Blood Requests</h1>

                    <p>
                        Create and track your hospital's blood requests
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-btn"
                    onClick={loadRequests}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* =================================================
                CREATE REQUEST
            ================================================= */}

            <div className="request-form-card">

                <h2>Create Blood Request</h2>

                <p className="form-description">
                    Enter the blood group and quantity required.
                    Your hospital information is automatically taken
                    from your login account.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        {/* BLOOD GROUP */}

                        <div className="form-group">

                            <label htmlFor="bloodGroup">
                                Blood Group
                            </label>

                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                disabled={formLoading}
                            >
                                <option value="">
                                    Select Blood Group
                                </option>

                                <option value="A+">
                                    A+
                                </option>

                                <option value="A-">
                                    A-
                                </option>

                                <option value="B+">
                                    B+
                                </option>

                                <option value="B-">
                                    B-
                                </option>

                                <option value="AB+">
                                    AB+
                                </option>

                                <option value="AB-">
                                    AB-
                                </option>

                                <option value="O+">
                                    O+
                                </option>

                                <option value="O-">
                                    O-
                                </option>

                            </select>

                        </div>


                        {/* QUANTITY */}

                        <div className="form-group">

                            <label htmlFor="quantity">
                                Quantity
                            </label>

                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                placeholder="Enter required units"
                                disabled={formLoading}
                            />

                        </div>

                    </div>


                    {/* INFORMATION */}

                    <div className="request-info-box">

                        <p>
                            <strong>Request ID:</strong>{" "}
                            Automatically generated
                        </p>

                        <p>
                            <strong>Hospital ID:</strong>{" "}
                            Automatically taken from your account
                        </p>

                        <p>
                            <strong>Request Date:</strong>{" "}
                            Automatically generated
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            PENDING
                        </p>

                    </div>


                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={formLoading}
                    >
                        {formLoading
                            ? "Submitting..."
                            : "Submit Blood Request"}
                    </button>

                </form>

            </div>


            {/* =================================================
                REQUEST LIST
            ================================================= */}

            <div className="requests-table-card">

                <div className="section-header">

                    <div>
                        <h2>My Blood Requests</h2>

                        <p>
                            Requests submitted by your hospital
                        </p>
                    </div>

                    <span className="request-count">
                        {requests.length} Request
                        {requests.length !== 1 ? "s" : ""}
                    </span>

                </div>


                {loading ? (

                    <div className="loading-message">
                        Loading requests...
                    </div>

                ) : requests.length === 0 ? (

                    <div className="empty-message">
                        No blood requests found.
                    </div>

                ) : (

                    <div className="table-container">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>Request ID</th>

                                    <th>Blood Group</th>

                                    <th>Quantity</th>

                                    <th>Request Date</th>

                                    <th>Status</th>

                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {requests.map((request) => (

                                    <tr key={request.RequestId}>

                                        <td>
                                            {request.RequestId}
                                        </td>

                                        <td>
                                            <span className="blood-group-badge">
                                                {request.BloodGroup}
                                            </span>
                                        </td>

                                        <td>
                                            {request.Quantity}
                                        </td>

                                        <td>
                                            {request.RequestDate || "-"}
                                        </td>

                                        <td>

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    request.Status
                                                )}`}
                                            >
                                                {request.Status}
                                            </span>

                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                className="view-btn"
                                                onClick={() =>
                                                    handleViewRequest(
                                                        request.RequestId
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                REQUEST DETAILS MODAL
            ================================================= */}

            {selectedRequest && (

                <div
                    className="modal-overlay"
                    onClick={closeDetails}
                >

                    <div
                        className="modal-content"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Request Details
                                </h2>

                                <p>
                                    {selectedRequest.RequestId}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeDetails}
                            >
                                ×
                            </button>

                        </div>


                        <div className="details-grid">

                            <div className="detail-item">

                                <span>
                                    Request ID
                                </span>

                                <strong>
                                    {selectedRequest.RequestId}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Hospital ID
                                </span>

                                <strong>
                                    {selectedRequest.HospitalId}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Blood Group
                                </span>

                                <strong>
                                    {selectedRequest.BloodGroup}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Quantity
                                </span>

                                <strong>
                                    {selectedRequest.Quantity}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Request Date
                                </span>

                                <strong>
                                    {selectedRequest.RequestDate || "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Status
                                </span>

                                <strong
                                    className={`status-badge ${getStatusClass(
                                        selectedRequest.Status
                                    )}`}
                                >
                                    {selectedRequest.Status}
                                </strong>

                            </div>

                        </div>


                        <div className="modal-footer">

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={closeDetails}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default HospitalRequests;