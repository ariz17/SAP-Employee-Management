import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import {
BarChart,
Bar,
PieChart,
Pie,
Cell,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
Legend,
ResponsiveContainer
} from "recharts";

function Analytics() {

// ==========================================
// DATA STATES
// ==========================================

const [inventory, setInventory] =
    useState([]);

const [donors, setDonors] =
    useState([]);

const [requests, setRequests] =
    useState([]);

const [allocations, setAllocations] =
    useState([]);


// ==========================================
// LOADING / ERROR
// ==========================================

const [loading, setLoading] =
    useState(true);

const [error, setError] =
    useState("");


// ==========================================
// CHART COLORS
// ==========================================

const chartColors = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#f59e0b",
    "#7c3aed",
    "#0891b2",
    "#db2777",
    "#64748b"
];


// ==========================================
// LOAD ANALYTICS DATA
// ==========================================

const loadAnalytics = async () => {

    try {

        setLoading(true);
        setError("");


        const [

            inventoryResponse,

            donorsResponse,

            requestsResponse,

            allocationsResponse

        ] = await Promise.allSettled([


            // INVENTORY

            api.get(
                "/blood-bank/inventory"
            ),


            // DONORS

            api.get(
                "/blood-bank/reports/donors"
            ),


            // HOSPITAL REQUESTS

            api.get(
                "/blood-bank/reports/requests"
            ),


            // ALLOCATIONS

            api.get(
                "/blood-bank/reports/allocations"
            )

        ]);


        // ==================================
        // INVENTORY
        // ==================================

        if (
            inventoryResponse.status ===
            "fulfilled"
        ) {

            const data =

                inventoryResponse.value
                    .data
                    ?.data || [];


            setInventory(

                Array.isArray(data)
                    ? data
                    : []

            );

        } else {

            console.error(

                "Inventory API error:",

                inventoryResponse.reason

            );

            setInventory([]);

        }


        // ==================================
        // DONORS
        // ==================================

        if (
            donorsResponse.status ===
            "fulfilled"
        ) {

            const data =

                donorsResponse.value
                    .data
                    ?.data || [];


            setDonors(

                Array.isArray(data)
                    ? data
                    : []

            );

        } else {

            console.error(

                "Donor API error:",

                donorsResponse.reason

            );

            setDonors([]);

        }


        // ==================================
        // REQUESTS
        // ==================================

        if (
            requestsResponse.status ===
            "fulfilled"
        ) {

            const data =

                requestsResponse.value
                    .data
                    ?.data || [];


            setRequests(

                Array.isArray(data)
                    ? data
                    : []

            );

        } else {

            console.error(

                "Request API error:",

                requestsResponse.reason

            );

            setRequests([]);

        }


        // ==================================
        // ALLOCATIONS
        // ==================================

        if (
            allocationsResponse.status ===
            "fulfilled"
        ) {

            const data =

                allocationsResponse.value
                    .data
                    ?.data || [];


            setAllocations(

                Array.isArray(data)
                    ? data
                    : []

            );

        } else {

            console.error(

                "Allocation API error:",

                allocationsResponse.reason

            );

            setAllocations([]);

        }


    } catch (error) {

        console.error(

            "Failed to load analytics:",

            error.response?.data ||
            error.message

        );


        setError(

            error.response?.data?.message ||

            "Failed to load analytics data."

        );

    } finally {

        setLoading(false);

    }

};


// ==========================================
// LOAD ON PAGE OPEN
// ==========================================

useEffect(() => {

    loadAnalytics();

}, []);


// ==========================================
// BLOOD GROUPS
// ==========================================

const bloodGroups = [

    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"

];


// ==========================================
// NORMALIZE STATUS
// ==========================================

const normalizeStatus =
    (value) => {

        return String(
            value || ""
        )
            .trim()
            .toUpperCase();

    };


// ==========================================
// INVENTORY STATISTICS
// ==========================================

const totalUnits =
    inventory.length;


const availableUnits =
    inventory.filter(

        (unit) =>

            normalizeStatus(
                unit.Status
            ) === "AVAILABLE"

    ).length;


const allocatedUnits =
    inventory.filter(

        (unit) =>

            normalizeStatus(
                unit.Status
            ) === "ALLOCATED"

    ).length;


const expiredUnits =
    inventory.filter(

        (unit) =>

            normalizeStatus(
                unit.Status
            ) === "EXPIRED"

    ).length;


// ==========================================
// DONOR STATISTICS
// ==========================================

const totalDonors =
    donors.length;


// ==========================================
// REQUEST STATISTICS
// ==========================================

const totalRequests =
    requests.length;


const pendingRequests =
    requests.filter(

        (request) =>

            normalizeStatus(
                request.Status
            ) === "PENDING"

    ).length;


const approvedRequests =
    requests.filter(

        (request) =>

            normalizeStatus(
                request.Status
            ) === "APPROVED"

    ).length;


const rejectedRequests =
    requests.filter(

        (request) =>

            normalizeStatus(
                request.Status
            ) === "REJECTED"

    ).length;


// ==========================================
// ALLOCATION STATISTICS
// ==========================================

const totalAllocations =
    allocations.length;


// ==========================================
// BLOOD GROUP COUNT
// ==========================================

const getBloodGroupCount =
    (bloodGroup) => {

        return inventory.filter(

            (unit) =>

                unit.BloodGroup ===
                bloodGroup

        ).length;

    };


// ==========================================
// AVAILABLE BLOOD GROUP COUNT
// ==========================================

const getAvailableBloodGroupCount =
    (bloodGroup) => {

        return inventory.filter(

            (unit) =>

                unit.BloodGroup ===
                bloodGroup &&

                normalizeStatus(
                    unit.Status
                ) === "AVAILABLE"

        ).length;

    };


// ==========================================
// BLOOD GROUP CHART DATA
// ==========================================

const bloodGroupChartData =
    useMemo(

        () =>

            bloodGroups.map(

                (group) => ({

                    bloodGroup:
                        group,

                    total:
                        getBloodGroupCount(
                            group
                        ),

                    available:
                        getAvailableBloodGroupCount(
                            group
                        )

                })

            ),

        [inventory]

    );


// ==========================================
// MOST AVAILABLE BLOOD GROUP
// ==========================================

const highestBloodGroup =
    useMemo(

        () => {

            if (
                inventory.length === 0
            ) {

                return "-";

            }


            let group =
                bloodGroups[0];

            let highest =
                getAvailableBloodGroupCount(
                    group
                );


            bloodGroups.forEach(

                (bloodGroup) => {

                    const count =

                        getAvailableBloodGroupCount(
                            bloodGroup
                        );


                    if (
                        count > highest
                    ) {

                        highest =
                            count;

                        group =
                            bloodGroup;

                    }

                }

            );


            return group;

        },

        [inventory]

    );


// ==========================================
// LEAST AVAILABLE BLOOD GROUP
// ==========================================

const lowestBloodGroup =
    useMemo(

        () => {

            if (
                inventory.length === 0
            ) {

                return "-";

            }


            let group =
                bloodGroups[0];

            let lowest =
                getAvailableBloodGroupCount(
                    group
                );


            bloodGroups.forEach(

                (bloodGroup) => {

                    const count =

                        getAvailableBloodGroupCount(
                            bloodGroup
                        );


                    if (
                        count < lowest
                    ) {

                        lowest =
                            count;

                        group =
                            bloodGroup;

                    }

                }

            );


            return group;

        },

        [inventory]

    );


// ==========================================
// LOW STOCK GROUPS
// ==========================================

const lowStockGroups =
    bloodGroups.filter(

        (group) =>

            getAvailableBloodGroupCount(
                group
            ) <= 2

    );


// ==========================================
// ZERO STOCK GROUPS
// ==========================================

const zeroStockGroups =
    bloodGroups.filter(

        (group) =>

            getAvailableBloodGroupCount(
                group
            ) === 0

    );


// ==========================================
// REQUEST STATUS CHART DATA
// ==========================================

const requestStatusChartData = [

    {

        name:
            "Pending",

        value:
            pendingRequests

    },

    {

        name:
            "Approved",

        value:
            approvedRequests

    },

    {

        name:
            "Rejected",

        value:
            rejectedRequests

    }

];


// ==========================================
// INVENTORY STATUS CHART DATA
// ==========================================

const inventoryStatusChartData = [

    {

        name:
            "Available",

        value:
            availableUnits

    },

    {

        name:
            "Allocated",

        value:
            allocatedUnits

    },

    {

        name:
            "Expired",

        value:
            expiredUnits

    }

];


// ==========================================
// DONOR BLOOD GROUP DATA
// ==========================================

const donorBloodGroupData =
    bloodGroups.map(

        (group) => ({

            bloodGroup:
                group,

            donors:

                donors.filter(

                    (donor) =>

                        donor.BloodGroup ===
                        group

                ).length

        })

    );


// ==========================================
// GENDER ANALYTICS
// ==========================================

const genderData =
    useMemo(

        () => {

            const genderMap =
                {};


            donors.forEach(

                (donor) => {

                    const gender =

                        donor.Gender ||
                        donor.GenderCode ||
                        "Unknown";


                    genderMap[gender] =

                        (
                            genderMap[
                                gender
                            ] || 0
                        ) + 1;

                }

            );


            return Object.keys(
                genderMap
            ).map(

                (gender) => ({

                    name:
                        gender,

                    value:
                        genderMap[
                            gender
                        ]

                })

            );

        },

        [donors]

    );


// ==========================================
// HOSPITAL REQUEST COUNT
// ==========================================

const hospitalRequestData =
    useMemo(

        () => {

            const hospitalMap =
                {};


            requests.forEach(

                (request) => {

                    const hospitalName =

                        request.HospitalName ||

                        request.HospitalId ||

                        "Unknown Hospital";


                    hospitalMap[
                        hospitalName
                    ] =

                        (
                            hospitalMap[
                                hospitalName
                            ] || 0
                        ) + 1;

                }

            );


            return Object.entries(
                hospitalMap
            )

                .map(

                    ([

                        hospital,

                        count

                    ]) => ({

                        hospital,

                        requests:
                            count

                    })

                )

                .sort(

                    (

                        a,

                        b

                    ) =>

                        b.requests -
                        a.requests

                )

                .slice(
                    0,
                    10
                );

        },

        [requests]

    );


// ==========================================
// HOSPITAL ALLOCATION COUNT
// ==========================================

const hospitalAllocationData =
    useMemo(

        () => {

            const hospitalMap =
                {};


            allocations.forEach(

                (allocation) => {

                    const hospitalName =

                        allocation.HospitalName ||

                        allocation.HospitalId ||

                        "Unknown Hospital";


                    hospitalMap[
                        hospitalName
                    ] =

                        (
                            hospitalMap[
                                hospitalName
                            ] || 0
                        ) + 1;

                }

            );


            return Object.entries(
                hospitalMap
            )

                .map(

                    ([

                        hospital,

                        count

                    ]) => ({

                        hospital,

                        allocations:
                            count

                    })

                )

                .sort(

                    (

                        a,

                        b

                    ) =>

                        b.allocations -
                        a.allocations

                )

                .slice(
                    0,
                    10
                );

        },

        [allocations]

    );


// ==========================================
// MOST ACTIVE HOSPITAL
// ==========================================

const mostActiveHospital =
    hospitalRequestData.length > 0
        ? hospitalRequestData[0]
            .hospital
        : "-";


// ==========================================
// TOP ALLOCATION HOSPITAL
// ==========================================

const topAllocationHospital =
    hospitalAllocationData.length > 0
        ? hospitalAllocationData[0]
            .hospital
        : "-";


// ==========================================
// RECENT REQUESTS
// ==========================================

const recentRequests =
    [...requests]

        .slice(
            0,
            5
        );


// ==========================================
// RECENT ALLOCATIONS
// ==========================================

const recentAllocations =
    [...allocations]

        .slice(
            0,
            5
        );


// ==========================================
// LOADING
// ==========================================

if (loading) {

    return (

        <div className="analytics-page">

            <div className="state-message">

                <div
                    className="loading-spinner"
                ></div>

                <p>
                    Loading analytics...
                </p>

            </div>

        </div>

    );

}


return (

    <div className="analytics-page">


        {/* ======================================
            HEADER
        ====================================== */}

        <div className="inventory-header">

            <div>

                <h1>
                    Analytics
                </h1>

                <p>
                    Monitor blood bank performance,
                    inventory, donors, requests,
                    and allocations.
                </p>

            </div>


            <button

                type="button"

                className="refresh-btn"

                onClick={
                    loadAnalytics
                }

            >

                ↻ Refresh

            </button>

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
            OVERVIEW
        ====================================== */}

        <div className="analytics-section">


            <div className="analytics-section-header">

                <h2>
                    Overview
                </h2>

                <p>
                    Overall blood bank statistics.
                </p>

            </div>


            <div className="dashboard-stats">


                <div className="dashboard-stat-card">

                    <div className="stat-icon">
                        🩸
                    </div>

                    <div>

                        <p>
                            Total Blood Units
                        </p>

                        <h2>
                            {totalUnits}
                        </h2>

                    </div>

                </div>


                <div className="dashboard-stat-card approved-card">

                    <div className="stat-icon">
                        ✓
                    </div>

                    <div>

                        <p>
                            Available Units
                        </p>

                        <h2>
                            {availableUnits}
                        </h2>

                    </div>

                </div>


                <div className="dashboard-stat-card allocated-card">

                    <div className="stat-icon">
                        📦
                    </div>

                    <div>

                        <p>
                            Allocated Units
                        </p>

                        <h2>
                            {allocatedUnits}
                        </h2>

                    </div>

                </div>


                <div className="dashboard-stat-card rejected-card">

                    <div className="stat-icon">
                        ⚠
                    </div>

                    <div>

                        <p>
                            Expired Units
                        </p>

                        <h2>
                            {expiredUnits}
                        </h2>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="stat-icon">
                        👤
                    </div>

                    <div>

                        <p>
                            Total Donors
                        </p>

                        <h2>
                            {totalDonors}
                        </h2>

                    </div>

                </div>


                <div className="dashboard-stat-card pending-card">

                    <div className="stat-icon">
                        📋
                    </div>

                    <div>

                        <p>
                            Total Requests
                        </p>

                        <h2>
                            {totalRequests}
                        </h2>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="stat-icon">
                        🏥
                    </div>

                    <div>

                        <p>
                            Total Allocations
                        </p>

                        <h2>
                            {totalAllocations}
                        </h2>

                    </div>

                </div>


            </div>

        </div>


        {/* ======================================
            BLOOD GROUP CHART
        ====================================== */}

        <div className="analytics-chart-grid">


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Blood Group Distribution
                        </h2>

                        <p>
                            Total and available
                            blood units by group.
                        </p>

                    </div>

                </div>


                <div className="analytics-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <BarChart
                            data={
                                bloodGroupChartData
                            }
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="bloodGroup"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar
                                dataKey="total"
                                name="Total Units"
                                fill="#2563eb"
                            />

                            <Bar
                                dataKey="available"
                                name="Available Units"
                                fill="#16a34a"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Inventory Status
                        </h2>

                        <p>
                            Current blood inventory
                            status distribution.
                        </p>

                    </div>

                </div>


                <div className="analytics-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <PieChart>

                            <Pie

                                data={
                                    inventoryStatusChartData
                                }

                                dataKey="value"

                                nameKey="name"

                                cx="50%"

                                cy="50%"

                                outerRadius={110}

                                label

                            >

                                {
                                    inventoryStatusChartData.map(

                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell

                                                key={index}

                                                fill={
                                                    chartColors[
                                                        index
                                                    ]
                                                }

                                            />

                                        )

                                    )
                                }

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>


        </div>


        {/* ======================================
            BLOOD GROUP CARDS
        ====================================== */}

        <div className="inventory-list-card">


            <div className="list-header">

                <div>

                    <h2>
                        Blood Group Availability
                    </h2>

                    <p>
                        Current available units for
                        every blood group.
                    </p>

                </div>


                <div className="request-count">

                    Highest:

                    {" "}

                    <strong>
                        {highestBloodGroup}
                    </strong>

                </div>

            </div>


            <div className="blood-group-grid">


                {
                    bloodGroups.map(

                        (group) => {

                            const count =

                                getAvailableBloodGroupCount(
                                    group
                                );


                            return (

                                <div

                                    key={group}

                                    className={
                                        `blood-group-card ${
                                            count === 0
                                                ? "zero-stock-card"
                                                : count <= 2
                                                    ? "low-stock-card"
                                                    : ""
                                        }`
                                    }

                                >

                                    <div className="blood-group-name">

                                        🩸 {group}

                                    </div>


                                    <div className="blood-group-count">

                                        {count}

                                    </div>


                                    <p>

                                        Available Unit
                                        {count !== 1
                                            ? "s"
                                            : ""}

                                    </p>

                                </div>

                            );

                        }

                    )
                }


            </div>

        </div>


        {/* ======================================
            REQUEST ANALYTICS
        ====================================== */}

        <div className="analytics-chart-grid">


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Hospital Request Status
                        </h2>

                        <p>
                            Distribution of hospital
                            blood request statuses.
                        </p>

                    </div>

                </div>


                <div className="analytics-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <PieChart>

                            <Pie

                                data={
                                    requestStatusChartData
                                }

                                dataKey="value"

                                nameKey="name"

                                cx="50%"

                                cy="50%"

                                outerRadius={110}

                                label

                            >

                                {
                                    requestStatusChartData.map(

                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell

                                                key={index}

                                                fill={
                                                    chartColors[
                                                        index + 2
                                                    ]
                                                }

                                            />

                                        )

                                    )
                                }

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Request Statistics
                        </h2>

                        <p>
                            Current hospital request
                            status counts.
                        </p>

                    </div>

                </div>


                <div className="dashboard-stats">


                    <div className="dashboard-stat-card pending-card">

                        <div className="stat-icon">
                            ⏳
                        </div>

                        <div>

                            <p>
                                Pending
                            </p>

                            <h2>
                                {pendingRequests}
                            </h2>

                        </div>

                    </div>


                    <div className="dashboard-stat-card approved-card">

                        <div className="stat-icon">
                            ✓
                        </div>

                        <div>

                            <p>
                                Approved
                            </p>

                            <h2>
                                {approvedRequests}
                            </h2>

                        </div>

                    </div>


                    <div className="dashboard-stat-card rejected-card">

                        <div className="stat-icon">
                            ✕
                        </div>

                        <div>

                            <p>
                                Rejected
                            </p>

                            <h2>
                                {rejectedRequests}
                            </h2>

                        </div>

                    </div>


                </div>

            </div>


        </div>


        {/* ======================================
            DONOR ANALYTICS
        ====================================== */}

        <div className="analytics-chart-grid">


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Donors by Blood Group
                        </h2>

                        <p>
                            Distribution of registered
                            donors.
                        </p>

                    </div>

                </div>


                <div className="analytics-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <BarChart
                            data={
                                donorBloodGroupData
                            }
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="bloodGroup"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar

                                dataKey="donors"

                                name="Donors"

                                fill="#7c3aed"

                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Donor Gender Distribution
                        </h2>

                        <p>
                            Gender distribution of
                            registered donors.
                        </p>

                    </div>

                </div>


                <div className="analytics-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <PieChart>

                            <Pie

                                data={
                                    genderData
                                }

                                dataKey="value"

                                nameKey="name"

                                cx="50%"

                                cy="50%"

                                outerRadius={110}

                                label

                            >

                                {
                                    genderData.map(

                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell

                                                key={index}

                                                fill={
                                                    chartColors[
                                                        index
                                                    ]
                                                }

                                            />

                                        )

                                    )
                                }

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>


        </div>


        {/* ======================================
            HOSPITAL ANALYTICS
        ====================================== */}

        <div className="analytics-chart-grid">


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Hospital Requests
                        </h2>

                        <p>
                            Hospitals with the highest
                            number of blood requests.
                        </p>

                    </div>

                </div>


                <div className="analytics-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <BarChart
                            data={
                                hospitalRequestData
                            }
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="hospital"
                                hide
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar

                                dataKey="requests"

                                name="Requests"

                                fill="#f59e0b"

                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Hospital Allocations
                        </h2>

                        <p>
                            Hospitals receiving the
                            highest allocations.
                        </p>

                    </div>

                </div>


                <div className="analytics-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <BarChart
                            data={
                                hospitalAllocationData
                            }
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="hospital"
                                hide
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar

                                dataKey="allocations"

                                name="Allocations"

                                fill="#0891b2"

                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


        </div>


        {/* ======================================
            LOW STOCK ALERT
        ====================================== */}

        <div className="inventory-list-card">


            <div className="list-header">

                <div>

                    <h2>
                        Blood Stock Alerts
                    </h2>

                    <p>
                        Blood groups requiring
                        attention.
                    </p>

                </div>

            </div>


            <div className="analytics-summary-grid">


                <div className="analytics-summary-item">

                    <span>
                        🔴 Zero Stock Groups
                    </span>

                    <strong>

                        {
                            zeroStockGroups.length > 0

                                ? zeroStockGroups.join(
                                    ", "
                                )

                                : "None"

                        }

                    </strong>

                </div>


                <div className="analytics-summary-item">

                    <span>
                        ⚠ Low Stock Groups
                    </span>

                    <strong>

                        {
                            lowStockGroups.length > 0

                                ? lowStockGroups.join(
                                    ", "
                                )

                                : "None"

                        }

                    </strong>

                </div>


                <div className="analytics-summary-item">

                    <span>
                        📈 Most Available
                    </span>

                    <strong>
                        {highestBloodGroup}
                    </strong>

                </div>


                <div className="analytics-summary-item">

                    <span>
                        📉 Least Available
                    </span>

                    <strong>
                        {lowestBloodGroup}
                    </strong>

                </div>


            </div>

        </div>


        {/* ======================================
            BUSINESS INSIGHTS
        ====================================== */}

        <div className="inventory-list-card">


            <div className="list-header">

                <div>

                    <h2>
                        Key Insights
                    </h2>

                    <p>
                        Important operational
                        information.
                    </p>

                </div>

            </div>


            <div className="analytics-summary-grid">


                <div className="analytics-summary-item">

                    <span>
                        🏥 Most Active Hospital
                    </span>

                    <strong>
                        {mostActiveHospital}
                    </strong>

                </div>


                <div className="analytics-summary-item">

                    <span>
                        📦 Top Allocation Hospital
                    </span>

                    <strong>
                        {topAllocationHospital}
                    </strong>

                </div>


                <div className="analytics-summary-item">

                    <span>
                        📋 Pending Requests
                    </span>

                    <strong>
                        {pendingRequests}
                    </strong>

                </div>


                <div className="analytics-summary-item">

                    <span>
                        🩸 Total Available Blood
                    </span>

                    <strong>
                        {availableUnits}
                    </strong>

                </div>


            </div>

        </div>


        {/* ======================================
            RECENT REQUESTS
        ====================================== */}

        <div className="inventory-list-card">


            <div className="list-header">

                <div>

                    <h2>
                        Recent Hospital Requests
                    </h2>

                    <p>
                        Latest hospital blood
                        requests.
                    </p>

                </div>

            </div>


            <div className="table-wrapper">

                <table className="hospital-table">

                    <thead>

                        <tr>

                            <th>
                                #
                            </th>

                            <th>
                                Hospital
                            </th>

                            <th>
                                Blood Group
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {
                            recentRequests.length > 0

                                ? recentRequests.map(

                                    (

                                        request,

                                        index

                                    ) => (

                                        <tr
                                            key={
                                                request.RequestId ||
                                                index
                                            }
                                        >

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>

                                                {
                                                    request.HospitalName ||

                                                    request.HospitalId ||

                                                    "-"
                                                }

                                            </td>

                                            <td>

                                                {
                                                    request.BloodGroup ||

                                                    "-"
                                                }

                                            </td>

                                            <td>

                                                {
                                                    request.Status ||

                                                    "-"
                                                }

                                            </td>

                                        </tr>

                                    )

                                )

                                : (

                                    <tr>

                                        <td
                                            colSpan="4"
                                        >

                                            No request data available.

                                        </td>

                                    </tr>

                                )

                        }

                    </tbody>

                </table>

            </div>

        </div>


        {/* ======================================
            RECENT ALLOCATIONS
        ====================================== */}

        <div className="inventory-list-card">


            <div className="list-header">

                <div>

                    <h2>
                        Recent Blood Allocations
                    </h2>

                    <p>
                        Latest blood allocations
                        to hospitals.
                    </p>

                </div>

            </div>


            <div className="table-wrapper">

                <table className="hospital-table">

                    <thead>

                        <tr>

                            <th>
                                #
                            </th>

                            <th>
                                Hospital
                            </th>

                            <th>
                                Blood Group
                            </th>

                            <th>
                                Allocation ID
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {
                            recentAllocations.length > 0

                                ? recentAllocations.map(

                                    (

                                        allocation,

                                        index

                                    ) => (

                                        <tr
                                            key={
                                                allocation.AllocationId ||
                                                index
                                            }
                                        >

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>

                                                {
                                                    allocation.HospitalName ||

                                                    allocation.HospitalId ||

                                                    "-"
                                                }

                                            </td>

                                            <td>

                                                {
                                                    allocation.BloodGroup ||

                                                    "-"
                                                }

                                            </td>

                                            <td>

                                                {
                                                    allocation.AllocationId ||

                                                    "-"
                                                }

                                            </td>

                                        </tr>

                                    )

                                )

                                : (

                                    <tr>

                                        <td
                                            colSpan="4"
                                        >

                                            No allocation data available.

                                        </td>

                                    </tr>

                                )

                        }

                    </tbody>

                </table>

            </div>

        </div>


    </div>

);

}

export default Analytics;
