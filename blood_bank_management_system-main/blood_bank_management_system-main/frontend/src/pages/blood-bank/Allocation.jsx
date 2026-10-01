import { useEffect, useState } from "react";
import api from "../../services/api";

function Allocation() {

    // ==========================================
    // DATA
    // ==========================================

    const [requests, setRequests] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [allocations, setAllocations] = useState([]);


    // ==========================================
    // LOADING
    // ==========================================

    const [loadingRequests, setLoadingRequests] =
        useState(true);

    const [loadingInventory, setLoadingInventory] =
        useState(true);

    const [loadingAllocations, setLoadingAllocations] =
        useState(true);


    // ==========================================
    // DELETE LOADING
    // ==========================================

    const [deletingAllocationId, setDeletingAllocationId] =
        useState(null);


    // ==========================================
    // ERROR
    // ==========================================

    const [error, setError] = useState("");


    // ==========================================
    // ALLOCATION FORM
    // ==========================================

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [selectedUnits, setSelectedUnits] =
        useState([]);

    const [allocationLoading, setAllocationLoading] =
        useState(false);

    const [allocationError, setAllocationError] =
        useState("");

    const [allocationSuccess, setAllocationSuccess] =
        useState("");


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        loadRequests();
        loadInventory();
        loadAllocations();

    }, []);


    // ==========================================
    // LOAD BLOOD REQUESTS
    // ==========================================

    const loadRequests = async () => {

        try {

            setLoadingRequests(true);

            const response = await api.get(
                "/blood-bank/requests"
            );

            const allRequests =
                response.data.data || [];


            // Only approved requests can be allocated

            const approvedRequests =
                allRequests.filter(
                    (request) =>
                        request.Status === "APPROVED"
                );


            setRequests(
                approvedRequests
            );

        } catch (error) {

            console.error(
                "Failed to load requests:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load blood requests."
            );

        } finally {

            setLoadingRequests(false);

        }
    };


    // ==========================================
    // LOAD AVAILABLE INVENTORY
    // ==========================================

    const loadInventory = async () => {

        try {

            setLoadingInventory(true);

            const response = await api.get(
                "/blood-bank/inventory"
            );

            const allInventory =
                response.data.data || [];


            // Only AVAILABLE blood units

            const availableUnits =
                allInventory.filter(
                    (unit) =>
                        unit.Status === "AVAILABLE"
                );


            setInventory(
                availableUnits
            );

        } catch (error) {

            console.error(
                "Failed to load inventory:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load inventory."
            );

        } finally {

            setLoadingInventory(false);

        }
    };


    // ==========================================
    // LOAD ALLOCATIONS
    // ==========================================

    const loadAllocations = async () => {

        try {

            setLoadingAllocations(true);

            const response = await api.get(
                "/blood-bank/allocations"
            );

            setAllocations(
                response.data.data || []
            );

        } catch (error) {

            console.error(
                "Failed to load allocations:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load allocations."
            );

        } finally {

            setLoadingAllocations(false);

        }
    };


    // ==========================================
    // REFRESH ALL DATA
    // ==========================================

    const refreshAll = async () => {

        setError("");

        await Promise.all([
            loadRequests(),
            loadInventory(),
            loadAllocations()
        ]);

    };


    // ==========================================
    // SELECT REQUEST
    // ==========================================

    const handleSelectRequest = (
        request
    ) => {

        setSelectedRequest(
            request
        );


        // Clear previously selected blood units

        setSelectedUnits([]);


        setAllocationError("");
        setAllocationSuccess("");

    };


    // ==========================================
    // GET COMPATIBLE BLOOD UNITS
    // ==========================================

    const getCompatibleUnits = () => {

        if (!selectedRequest) {

            return [];

        }


        return inventory.filter(
            (unit) =>
                unit.BloodGroup ===
                selectedRequest.BloodGroup
        );

    };


    // ==========================================
    // SELECT / UNSELECT BLOOD UNIT
    // ==========================================

    const handleUnitSelection = (
        bloodUnitId
    ) => {

        if (!selectedRequest) {

            return;

        }


        const requiredQuantity =
            Number(
                selectedRequest.Quantity
            );


        setSelectedUnits(
            (previousUnits) => {


                // Remove selected unit

                if (

                    previousUnits.includes(
                        bloodUnitId
                    )

                ) {

                    return previousUnits.filter(
                        (id) =>
                            id !== bloodUnitId
                    );

                }


                // Prevent selecting more units
                // than requested quantity

                if (

                    previousUnits.length >=
                    requiredQuantity

                ) {

                    setAllocationError(
                        `You can select only ${requiredQuantity} blood unit(s).`
                    );

                    return previousUnits;

                }


                setAllocationError("");


                return [

                    ...previousUnits,

                    bloodUnitId

                ];

            }
        );

    };


    // ==========================================
    // CREATE ALLOCATION
    // ==========================================

    const handleAllocate = async () => {

        setAllocationError("");
        setAllocationSuccess("");


        // Validate request

        if (!selectedRequest) {

            setAllocationError(
                "Please select a blood request."
            );

            return;

        }


        const requiredQuantity =
            Number(
                selectedRequest.Quantity
            );


        // Validate selected units

        if (

            selectedUnits.length !==
            requiredQuantity

        ) {

            setAllocationError(
                `Please select exactly ${requiredQuantity} blood unit(s).`
            );

            return;

        }


        try {

            setAllocationLoading(
                true
            );


            const response =
                await api.post(

                    "/blood-bank/allocations",

                    {

                        requestId:
                            selectedRequest.RequestId,

                        bloodUnitIds:
                            selectedUnits

                    }

                );


            setAllocationSuccess(

                response.data.message ||

                "Blood allocated successfully."

            );


            // Refresh requests, inventory
            // and allocation history

            await refreshAll();


            // Clear selected request

            setSelectedRequest(
                null
            );


            // Clear selected blood units

            setSelectedUnits(
                []
            );


            setTimeout(
                () => {

                    setAllocationSuccess(
                        ""
                    );

                },

                3000
            );

        } catch (error) {

            console.error(
                "Allocation failed:",
                error.response?.data ||
                error.message
            );


            setAllocationError(

                error.response?.data?.message ||

                "Failed to allocate blood."

            );

        } finally {

            setAllocationLoading(
                false
            );

        }

    };


    // ==========================================
    // DELETE ALLOCATION
    // ==========================================

    const handleDeleteAllocation =
        async (allocation) => {

            const confirmed =
                window.confirm(

                    `Are you sure you want to delete allocation ${allocation.AllocationId}?`

                );


            if (!confirmed) {

                return;

            }


            try {

                setError("");


                setDeletingAllocationId(
                    allocation.AllocationId
                );


                // ==================================
                // DELETE ALLOCATION
                // ==================================

                await api.delete(

                    `/blood-bank/allocations/${allocation.AllocationId}`

                );


                // ==================================
                // REFRESH ALL DATA
                //
                // This refreshes:
                // 1. Allocation history
                // 2. Blood inventory
                // 3. Approved requests
                // ==================================

                await refreshAll();


                // ==================================
                // SUCCESS MESSAGE
                // ==================================

                setAllocationSuccess(
                    "Allocation deleted successfully."
                );


                setTimeout(
                    () => {

                        setAllocationSuccess(
                            ""
                        );

                    },

                    3000
                );

            } catch (error) {

                console.error(
                    "Failed to delete allocation:",
                    error.response?.data ||
                    error.message
                );


                setError(

                    error.response?.data?.message ||

                    "Failed to delete allocation."

                );

            } finally {

                setDeletingAllocationId(
                    null
                );

            }

        };


    // ==========================================
    // COMPATIBLE UNITS
    // ==========================================

    const compatibleUnits =
        getCompatibleUnits();


    return (

        <div className="allocation-page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="allocation-header">

                <div>

                    <h1>
                        Blood Allocation
                    </h1>

                    <p>
                        Allocate available blood units
                        to approved hospital requests.
                    </p>

                </div>


                <button
                    className="refresh-btn"

                    onClick={
                        refreshAll
                    }

                    disabled={
                        loadingRequests ||
                        loadingInventory ||
                        loadingAllocations
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
                SUCCESS
            ====================================== */}

            {allocationSuccess && (

                <div className="form-alert success-alert">

                    {allocationSuccess}

                </div>

            )}


            {/* ======================================
                ALLOCATION SECTION
            ====================================== */}

            <div className="allocation-grid">


                {/* ==================================
                    APPROVED REQUESTS
                ================================== */}

                <div className="allocation-card">

                    <div className="allocation-card-header">

                        <h2>
                            Approved Requests
                        </h2>

                        <p>
                            Select a request to allocate blood.
                        </p>

                    </div>


                    {loadingRequests ? (

                        <div className="state-message">

                            <div className="loading-spinner"></div>

                            <p>
                                Loading approved requests...
                            </p>

                        </div>

                    ) : requests.length === 0 ? (

                        <div className="state-message">

                            <div className="state-icon">

                                ✓

                            </div>

                            <h3>
                                No Approved Requests
                            </h3>

                            <p>
                                There are currently no approved
                                blood requests waiting for allocation.
                            </p>

                        </div>

                    ) : (

                        <div className="request-selection-list">

                            {requests.map(

                                (request) => (

                                    <div

                                        key={
                                            request.RequestId
                                        }

                                        className={
                                            selectedRequest
                                                ?.RequestId ===
                                            request.RequestId

                                                ? "allocation-request-card selected-request"

                                                : "allocation-request-card"
                                        }

                                        onClick={() =>
                                            handleSelectRequest(
                                                request
                                            )
                                        }
                                    >

                                        <div className="allocation-request-top">

                                            <span className="hospital-id">

                                                {
                                                    request.RequestId
                                                }

                                            </span>


                                            <span className="status-badge approved-status">

                                                APPROVED

                                            </span>

                                        </div>


                                        <div className="allocation-request-info">


                                            <div>

                                                <span>
                                                    Hospital ID
                                                </span>

                                                <strong>

                                                    {
                                                        request.HospitalId
                                                    }

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Blood Group
                                                </span>

                                                <strong>

                                                    {
                                                        request.BloodGroup
                                                    }

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Quantity
                                                </span>

                                                <strong>

                                                    {
                                                        request.Quantity
                                                    }

                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                )

                            )}

                        </div>

                    )}

                </div>


                {/* ==================================
                    AVAILABLE BLOOD UNITS
                ================================== */}

                <div className="allocation-card">

                    <div className="allocation-card-header">

                        <h2>
                            Available Blood Units
                        </h2>

                        <p>

                            {
                                selectedRequest

                                    ? `Select ${selectedRequest.Quantity} unit(s) of ${selectedRequest.BloodGroup}.`

                                    : "Select an approved request first."
                            }

                        </p>

                    </div>


                    {!selectedRequest ? (

                        <div className="state-message">

                            <div className="state-icon">

                                🩸

                            </div>

                            <h3>
                                Select a Request
                            </h3>

                            <p>
                                Choose an approved blood request
                                to view compatible blood units.
                            </p>

                        </div>

                    ) : loadingInventory ? (

                        <div className="state-message">

                            <div className="loading-spinner"></div>

                            <p>
                                Loading blood units...
                            </p>

                        </div>

                    ) : compatibleUnits.length === 0 ? (

                        <div className="state-message error-state">

                            <div className="state-icon">

                                ⚠

                            </div>

                            <h3>
                                No Compatible Units
                            </h3>

                            <p>

                                No available blood units were found
                                for blood group{" "}

                                <strong>

                                    {
                                        selectedRequest.BloodGroup
                                    }

                                </strong>

                                .

                            </p>

                        </div>

                    ) : (

                        <div className="blood-unit-selection-list">

                            {compatibleUnits.map(

                                (unit) => {

                                    const isSelected =
                                        selectedUnits.includes(
                                            unit.BloodUnitId
                                        );


                                    return (

                                        <div

                                            key={
                                                unit.BloodUnitId
                                            }

                                            className={
                                                isSelected

                                                    ? "blood-unit-card selected-unit"

                                                    : "blood-unit-card"
                                            }
                                        >

                                            <label>

                                                <input

                                                    type="checkbox"

                                                    checked={
                                                        isSelected
                                                    }

                                                    onChange={() =>
                                                        handleUnitSelection(
                                                            unit.BloodUnitId
                                                        )
                                                    }

                                                    disabled={
                                                        allocationLoading
                                                    }
                                                />


                                                <div className="blood-unit-content">

                                                    <strong>

                                                        {
                                                            unit.BloodUnitId
                                                        }

                                                    </strong>


                                                    <span>

                                                        Donor:{" "}

                                                        {
                                                            unit.DonorId
                                                        }

                                                    </span>

                                                </div>


                                                <div className="blood-group-badge">

                                                    {
                                                        unit.BloodGroup
                                                    }

                                                </div>

                                            </label>

                                        </div>

                                    );

                                }

                            )}

                        </div>

                    )}


                    {/* ==============================
                        ALLOCATION ERROR
                    ============================== */}

                    {allocationError && (

                        <div className="form-alert error-alert">

                            {allocationError}

                        </div>

                    )}


                    {/* ==============================
                        ALLOCATION BUTTON
                    ============================== */}

                    {selectedRequest && (

                        <div className="allocation-action">

                            <div className="selected-count">

                                Selected:

                                <strong>

                                    {" "}

                                    {
                                        selectedUnits.length
                                    }

                                    {" / "}

                                    {
                                        selectedRequest.Quantity
                                    }

                                </strong>

                            </div>


                            <button

                                className="allocate-btn"

                                onClick={
                                    handleAllocate
                                }

                                disabled={
                                    allocationLoading ||

                                    selectedUnits.length !==
                                    Number(
                                        selectedRequest.Quantity
                                    )
                                }
                            >

                                {
                                    allocationLoading

                                        ? "Allocating..."

                                        : "Allocate Blood"
                                }

                            </button>

                        </div>

                    )}

                </div>

            </div>


            {/* ======================================
                ALLOCATION HISTORY
            ====================================== */}

            <div className="allocation-history-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Allocation History
                        </h2>

                        <p>
                            Recently allocated blood units.
                        </p>

                    </div>

                </div>


                {loadingAllocations ? (

                    <div className="state-message">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading allocations...
                        </p>

                    </div>

                ) : allocations.length === 0 ? (

                    <div className="state-message">

                        <div className="state-icon">

                            🩸

                        </div>

                        <h3>
                            No Allocations Yet
                        </h3>

                        <p>
                            Blood allocation history will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="hospital-table">

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Allocation ID
                                    </th>

                                    <th>
                                        Request ID
                                    </th>

                                    <th>
                                        Blood Unit ID
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {allocations.map(

                                    (
                                        allocation,
                                        index
                                    ) => (

                                        <tr

                                            key={
                                                allocation.AllocationId
                                            }
                                        >

                                            <td>

                                                {
                                                    index + 1
                                                }

                                            </td>


                                            <td>

                                                <span className="hospital-id">

                                                    {
                                                        allocation.AllocationId
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {
                                                    allocation.RequestId
                                                }

                                            </td>


                                            <td>

                                                <strong>

                                                    {
                                                        allocation.BloodUnitId
                                                    }

                                                </strong>

                                            </td>


                                            {/* ======================
                                                DELETE BUTTON
                                            ====================== */}

                                            <td>

                                                <button

                                                    className="delete-allocation-btn"

                                                    onClick={() =>
                                                        handleDeleteAllocation(
                                                            allocation
                                                        )
                                                    }

                                                    disabled={
                                                        deletingAllocationId ===
                                                        allocation.AllocationId
                                                    }
                                                >

                                                    {
                                                        deletingAllocationId ===
                                                        allocation.AllocationId

                                                            ? "Deleting..."

                                                            : "Delete"
                                                    }

                                                </button>

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

export default Allocation;