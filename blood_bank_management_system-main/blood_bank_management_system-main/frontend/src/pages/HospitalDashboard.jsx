import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";


function HospitalDashboard() {

    // ==========================================
    // NAVIGATION
    // ==========================================

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [requests, setRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ALL
    // PENDING
    // APPROVED
    // ALLOCATED
    // REJECTED

    const [selectedFilter, setSelectedFilter] =
        useState("ALL");


    // ==========================================
    // LOAD HOSPITAL REQUESTS
    // ==========================================

    const loadRequests =
        async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await api.get(
                        "/hospital/requests"
                    );


                const requestData =
                    response.data.data || [];


                setRequests(
                    requestData
                );

            } catch (error) {

                console.error(
                    "Failed to load hospital requests:",
                    error.response?.data ||
                    error.message
                );


                setError(

                    error.response?.data?.message ||

                    "Failed to load hospital dashboard."

                );

            } finally {

                setLoading(false);

            }
        };


    // ==========================================
    // LOAD ON PAGE OPEN
    // ==========================================

    useEffect(() => {

        loadRequests();

    }, []);


    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh =
        async () => {

            await loadRequests();

        };


    // ==========================================
    // CREATE NEW REQUEST
    // ==========================================

    const handleCreateRequest =
        () => {

            navigate(
                "/hospital/requests"
            );

        };


    // ==========================================
    // STATISTICS
    // ==========================================

    const totalRequests =
        requests.length;


    const pendingRequests =
        requests.filter(

            (request) =>

                request.Status ===
                "PENDING"

        ).length;


    const approvedRequests =
        requests.filter(

            (request) =>

                request.Status ===
                "APPROVED"

        ).length;


    const allocatedRequests =
        requests.filter(

            (request) =>

                request.Status ===
                "ALLOCATED"

        ).length;


    const rejectedRequests =
        requests.filter(

            (request) =>

                request.Status ===
                "REJECTED"

        ).length;


    // ==========================================
    // FILTER REQUESTS
    // ==========================================

    const filteredRequests =

        selectedFilter === "ALL"

            ? requests

            : requests.filter(

                (request) =>

                    request.Status ===
                    selectedFilter

            );


    // ==========================================
    // GET TABLE TITLE
    // ==========================================

    const getTableTitle =
        () => {

            if (
                selectedFilter ===
                "ALL"
            ) {

                return (
                    "All Blood Requests"
                );

            }


            return (
                `${selectedFilter} Blood Requests`
            );

        };


    // ==========================================
    // GET TABLE DESCRIPTION
    // ==========================================

    const getTableDescription =
        () => {

            if (
                selectedFilter ===
                "ALL"
            ) {

                return (
                    "Showing all requests from your hospital."
                );

            }


            return (

                `Showing ${selectedFilter.toLowerCase()} requests from your hospital.`

            );

        };


    // ==========================================
    // GET STATUS CSS CLASS
    // ==========================================

    const getStatusClass =
        (status) => {

            switch (status) {

                case "PENDING":

                    return "pending-status";


                case "APPROVED":

                    return "approved-status";


                case "ALLOCATED":

                    return "allocated-status";


                case "REJECTED":

                    return "rejected-status";


                default:

                    return "";

            }

        };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="hospital-dashboard">

                <div className="dashboard-loading">

                    <div
                        className="loading-spinner"
                    ></div>

                    <p>
                        Loading dashboard...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="hospital-dashboard">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="dashboard-header">


                {/* TITLE */}

                <div>

                    <h1>
                        Hospital Dashboard
                    </h1>


                    <p>
                        View and track your blood requests.
                    </p>

                </div>


                {/* BUTTONS */}

                <div className="dashboard-header-actions">


                    {/* CREATE REQUEST */}

                    <button
                        className="create-request-btn"

                        onClick={
                            handleCreateRequest
                        }
                    >

                        + Create New Request

                    </button>


                    {/* REFRESH */}

                    <button
                        className="refresh-btn"

                        onClick={
                            handleRefresh
                        }
                    >

                        ↻ Refresh

                    </button>


                </div>


            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="form-alert error-alert">

                    {error}

                </div>

            )}


            {/* ======================================
                DASHBOARD CARDS
            ====================================== */}

            <div className="dashboard-stats">


                {/* ==================================
                    TOTAL REQUESTS
                ================================== */}

                <div

                    className={

                        `dashboard-stat-card ${

                            selectedFilter === "ALL"

                                ? "active-card"

                                : ""

                        }`

                    }

                    onClick={() =>

                        setSelectedFilter(
                            "ALL"
                        )

                    }

                >

                    <div className="stat-icon">

                        📋

                    </div>


                    <div>

                        <p>
                            Total Requests
                        </p>


                        <h2>

                            {
                                totalRequests
                            }

                        </h2>

                    </div>

                </div>


                {/* ==================================
                    PENDING
                ================================== */}

                <div

                    className={

                        `dashboard-stat-card pending-card ${

                            selectedFilter ===
                            "PENDING"

                                ? "active-card"

                                : ""

                        }`

                    }

                    onClick={() =>

                        setSelectedFilter(
                            "PENDING"
                        )

                    }

                >

                    <div className="stat-icon">

                        ⏳

                    </div>


                    <div>

                        <p>
                            Pending
                        </p>


                        <h2>

                            {
                                pendingRequests
                            }

                        </h2>

                    </div>

                </div>


                {/* ==================================
                    APPROVED
                ================================== */}

                <div

                    className={

                        `dashboard-stat-card approved-card ${

                            selectedFilter ===
                            "APPROVED"

                                ? "active-card"

                                : ""

                        }`

                    }

                    onClick={() =>

                        setSelectedFilter(
                            "APPROVED"
                        )

                    }

                >

                    <div className="stat-icon">

                        ✓

                    </div>


                    <div>

                        <p>
                            Approved
                        </p>


                        <h2>

                            {
                                approvedRequests
                            }

                        </h2>

                    </div>

                </div>


                {/* ==================================
                    ALLOCATED
                ================================== */}

                <div

                    className={

                        `dashboard-stat-card allocated-card ${

                            selectedFilter ===
                            "ALLOCATED"

                                ? "active-card"

                                : ""

                        }`

                    }

                    onClick={() =>

                        setSelectedFilter(
                            "ALLOCATED"
                        )

                    }

                >

                    <div className="stat-icon">

                        🩸

                    </div>


                    <div>

                        <p>
                            Allocated
                        </p>


                        <h2>

                            {
                                allocatedRequests
                            }

                        </h2>

                    </div>

                </div>


                {/* ==================================
                    REJECTED
                ================================== */}

                <div

                    className={

                        `dashboard-stat-card rejected-card ${

                            selectedFilter ===
                            "REJECTED"

                                ? "active-card"

                                : ""

                        }`

                    }

                    onClick={() =>

                        setSelectedFilter(
                            "REJECTED"
                        )

                    }

                >

                    <div className="stat-icon">

                        ✕

                    </div>


                    <div>

                        <p>
                            Rejected
                        </p>


                        <h2>

                            {
                                rejectedRequests
                            }

                        </h2>

                    </div>

                </div>


            </div>


            {/* ======================================
                REQUEST TABLE
            ====================================== */}

            <div className="dashboard-table-card">


                {/* ==================================
                    TABLE HEADER
                ================================== */}

                <div className="list-header">


                    <div>

                        <h2>

                            {
                                getTableTitle()
                            }

                        </h2>


                        <p>

                            {
                                getTableDescription()
                            }

                        </p>

                    </div>


                    {/* REQUEST COUNT */}

                    <div className="request-count">

                        {
                            filteredRequests.length
                        }

                        {" "}

                        Request

                        {
                            filteredRequests.length !== 1

                                ? "s"

                                : ""

                        }

                    </div>


                </div>


                {/* ==================================
                    EMPTY STATE
                ================================== */}

                {filteredRequests.length === 0 ? (

                    <div className="state-message">


                        <div className="state-icon">

                            📋

                        </div>


                        <h3>

                            No Requests Found

                        </h3>


                        <p>

                            No{" "}

                            {
                                selectedFilter === "ALL"

                                    ? ""

                                    : selectedFilter.toLowerCase()

                            }

                            {" "}

                            requests were found.

                        </p>


                    </div>

                ) : (


                    /* ==============================
                        TABLE
                    ============================== */

                    <div className="table-wrapper">


                        <table className="hospital-table">


                            <thead>

                                <tr>


                                    <th>
                                        #
                                    </th>


                                    <th>
                                        Request ID
                                    </th>


                                    <th>
                                        Blood Group
                                    </th>


                                    <th>
                                        Quantity
                                    </th>


                                    <th>
                                        Request Date
                                    </th>


                                    <th>
                                        Status
                                    </th>


                                </tr>

                            </thead>


                            <tbody>


                                {filteredRequests.map(

                                    (

                                        request,

                                        index

                                    ) => (

                                        <tr

                                            key={
                                                request.RequestId
                                            }

                                        >


                                            {/* NUMBER */}

                                            <td>

                                                {
                                                    index + 1
                                                }

                                            </td>


                                            {/* REQUEST ID */}

                                            <td>

                                                <span
                                                    className="hospital-id"
                                                >

                                                    {
                                                        request.RequestId
                                                    }

                                                </span>

                                            </td>


                                            {/* BLOOD GROUP */}

                                            <td>

                                                <strong>

                                                    {
                                                        request.BloodGroup
                                                    }

                                                </strong>

                                            </td>


                                            {/* QUANTITY */}

                                            <td>

                                                {
                                                    request.Quantity
                                                }

                                            </td>


                                            {/* REQUEST DATE */}

                                            <td>

                                                {

                                                    request.RequestDate

                                                        ? new Date(

                                                            request.RequestDate

                                                        ).toLocaleDateString()

                                                        : "-"

                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span

                                                    className={

                                                        `status-badge ${

                                                            getStatusClass(

                                                                request.Status

                                                            )

                                                        }`

                                                    }

                                                >

                                                    {
                                                        request.Status
                                                    }

                                                </span>

                                            </td>


                                        </tr>

                                    )

                                )}


                            </tbody>


                        </table>


                    </div>

                )}


            </div>


        </div>

    );

}


export default HospitalDashboard;