import React, { useEffect, useState } from "react";
import api from "../../services/api";

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // LOAD ALL REQUESTS
    // =====================================================

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/blood-bank/requests"
            );

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
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadRequests();
    }, []);

    // =====================================================
    // VIEW REQUEST DETAILS
    // =====================================================

    const handleViewRequest = async (requestId) => {
        try {
            setError("");

            const response = await api.get(
                `/blood-bank/requests/${requestId}`
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
    // UPDATE REQUEST STATUS
    // =====================================================

    const handleStatusUpdate = async (requestId, status) => {
        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            const response = await api.put(
                `/blood-bank/requests/${requestId}`,
                {
                    status
                }
            );

            setSuccess(
                response.data.message ||
                `Request ${status.toLowerCase()} successfully`
            );

            setSelectedRequest(null);

            await loadRequests();

        } catch (error) {
            console.error(
                "Update request status error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to update request status"
            );

        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {
        if (!actionLoading) {
            setSelectedRequest(null);
        }
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
        <div className="blood-bank-requests-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <div>
                    <h1>Blood Requests</h1>

                    <p>
                        View and process blood requests from hospitals
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
                REQUEST TABLE
            ================================================= */}

            <div className="requests-table-card">

                <div className="section-header">

                    <div>
                        <h2>Hospital Requests</h2>

                        <p>
                            All blood requests submitted by hospitals
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
                                    <th>Hospital ID</th>
                                    <th>Blood Group</th>
                                    <th>Quantity</th>
                                    <th>Request Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {requests.map((request) => (

                                    <tr
                                        key={request.RequestId}
                                    >

                                        <td>
                                            {request.RequestId}
                                        </td>

                                        <td>
                                            {request.HospitalId}
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
                    onClick={closeModal}
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
                                onClick={closeModal}
                                disabled={actionLoading}
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


                        {/* =================================================
                            PROCESS REQUEST
                        ================================================= */}

                        {selectedRequest.Status === "PENDING" && (

                            <div className="request-actions">

                                <h3>
                                    Process Request
                                </h3>

                                <p>
                                    Choose whether to approve or reject
                                    this hospital request.
                                </p>

                                <div className="action-buttons">

                                    <button
                                        type="button"
                                        className="approve-btn"
                                        onClick={() =>
                                            handleStatusUpdate(
                                                selectedRequest.RequestId,
                                                "APPROVED"
                                            )
                                        }
                                        disabled={actionLoading}
                                    >
                                        {actionLoading
                                            ? "Processing..."
                                            : "Approve"}
                                    </button>


                                    <button
                                        type="button"
                                        className="reject-btn"
                                        onClick={() =>
                                            handleStatusUpdate(
                                                selectedRequest.RequestId,
                                                "REJECTED"
                                            )
                                        }
                                        disabled={actionLoading}
                                    >
                                        {actionLoading
                                            ? "Processing..."
                                            : "Reject"}
                                    </button>

                                </div>

                            </div>

                        )}


                        {selectedRequest.Status === "APPROVED" && (

                            <div className="request-status-info">
                                This request has been approved.
                                Blood allocation will be handled
                                by the Allocation module.
                            </div>

                        )}


                        {selectedRequest.Status === "REJECTED" && (

                            <div className="request-status-info">
                                This request has been rejected.
                            </div>

                        )}


                        {selectedRequest.Status === "ALLOCATED" && (

                            <div className="request-status-info">
                                Blood units have been allocated
                                to this request.
                            </div>

                        )}


                        <div className="modal-footer">

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={closeModal}
                                disabled={actionLoading}
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

export default Requests;