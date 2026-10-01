import { useEffect, useState } from "react";
import api from "../../services/api";

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [donors, setDonors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Add form
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        donorId: "",
        collectionDate: "",
        expiryDate: ""
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    // View modal
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Update modal
    const [showEditModal, setShowEditModal] = useState(false);

    const [editFormData, setEditFormData] = useState({
        donorId: "",
        collectionDate: "",
        expiryDate: "",
        status: ""
    });

    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {
        loadInventory();
        loadDonors();
    }, []);


    // ==========================================
    // GET INVENTORY
    // ==========================================

    const loadInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/blood-bank/inventory"
            );

            setInventory(response.data.data || []);

        } catch (error) {
            console.error(
                "Failed to load inventory:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load inventory."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // GET DONORS
    // ==========================================

    const loadDonors = async () => {
        try {
            const response = await api.get(
                "/blood-bank/donors"
            );

            setDonors(response.data.data || []);

        } catch (error) {
            console.error(
                "Failed to load donors:",
                error.response?.data || error.message
            );
        }
    };


    // ==========================================
    // ADD FORM CHANGE
    // ==========================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setFormError("");
        setFormSuccess("");
    };


    // ==========================================
    // DONOR CHANGE FOR ADD FORM
    // ==========================================

    const handleDonorChange = (event) => {
        const donorId = event.target.value;

        setFormData((previousData) => ({
            ...previousData,
            donorId
        }));

        setFormError("");
        setFormSuccess("");
    };


    // ==========================================
    // EDIT FORM CHANGE
    // ==========================================

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setEditError("");
        setEditSuccess("");
    };


    // ==========================================
    // DONOR CHANGE FOR EDIT FORM
    // ==========================================

    const handleEditDonorChange = (event) => {
        const donorId = event.target.value;

        setEditFormData((previousData) => ({
            ...previousData,
            donorId
        }));

        setEditError("");
        setEditSuccess("");
    };


    // ==========================================
    // GET SELECTED DONOR
    // ==========================================

    const selectedDonor = donors.find(
        (donor) =>
            donor.DonorId === formData.donorId
    );


    // ==========================================
    // GET SELECTED EDIT DONOR
    // ==========================================

    const selectedEditDonor = donors.find(
        (donor) =>
            donor.DonorId === editFormData.donorId
    );


    // ==========================================
    // GET DONOR DETAILS
    // ==========================================

    const getDonorDetails = (donorId) => {
        return donors.find(
            (donor) =>
                donor.DonorId === donorId
        );
    };


    // ==========================================
    // OPEN ADD FORM
    // ==========================================

    const openForm = () => {
        setFormData({
            donorId: "",
            collectionDate: "",
            expiryDate: ""
        });

        setFormError("");
        setFormSuccess("");

        setShowForm(true);
    };


    // ==========================================
    // CLOSE ADD FORM
    // ==========================================

    const closeForm = () => {
        if (formLoading) return;

        setShowForm(false);

        setFormData({
            donorId: "",
            collectionDate: "",
            expiryDate: ""
        });

        setFormError("");
        setFormSuccess("");
    };


    // ==========================================
    // ADD BLOOD UNIT
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");
        setFormSuccess("");

        const {
            donorId,
            collectionDate,
            expiryDate
        } = formData;

        const donor = donors.find(
            (item) => item.DonorId === donorId
        );

        if (!donorId) {
            setFormError("Please select a donor.");
            return;
        }

        if (!donor) {
            setFormError("Selected donor was not found.");
            return;
        }

        if (!donor.BloodGroup) {
            setFormError(
                "Blood group is not available for the selected donor."
            );
            return;
        }

        if (!collectionDate) {
            setFormError(
                "Collection date is required."
            );
            return;
        }

        if (!expiryDate) {
            setFormError(
                "Expiry date is required."
            );
            return;
        }

        if (expiryDate < collectionDate) {
            setFormError(
                "Expiry date cannot be before collection date."
            );
            return;
        }

        try {
            setFormLoading(true);

            const response = await api.post(
                "/blood-bank/inventory",
                {
                    donorId,
                    bloodGroup: donor.BloodGroup,
                    collectionDate,
                    expiryDate
                }
            );

            setFormSuccess(
                response.data.message ||
                "Blood unit added successfully."
            );

            await loadInventory();

            setFormData({
                donorId: "",
                collectionDate: "",
                expiryDate: ""
            });

            setTimeout(() => {
                setShowForm(false);
                setFormSuccess("");
            }, 1000);

        } catch (error) {
            console.error(
                "Failed to add blood unit:",
                error.response?.data || error.message
            );

            setFormError(
                error.response?.data?.message ||
                "Failed to add blood unit."
            );

        } finally {
            setFormLoading(false);
        }
    };


    // ==========================================
    // VIEW BLOOD UNIT
    // ==========================================

    const handleView = async (bloodUnitId) => {
        try {
            setViewLoading(true);
            setSelectedUnit(null);
            setShowViewModal(true);

            const response = await api.get(
                `/blood-bank/inventory/${bloodUnitId}`
            );

            setSelectedUnit(response.data.data);

        } catch (error) {
            console.error(
                "Failed to load blood unit:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to load blood unit details."
            );

            setShowViewModal(false);

        } finally {
            setViewLoading(false);
        }
    };


    // ==========================================
    // CLOSE VIEW
    // ==========================================

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedUnit(null);
    };


    // ==========================================
    // OPEN UPDATE
    // ==========================================

    const handleEdit = (unit) => {
        setSelectedUnit(unit);

        setEditFormData({
            donorId: unit.DonorId || "",
            collectionDate:
                unit.CollectionDate || "",
            expiryDate:
                unit.ExpiryDate || "",
            status:
                unit.Status || "AVAILABLE"
        });

        setEditError("");
        setEditSuccess("");

        setShowEditModal(true);
    };


    // ==========================================
    // CLOSE UPDATE
    // ==========================================

    const closeEditModal = () => {
        if (editLoading) return;

        setShowEditModal(false);
        setSelectedUnit(null);

        setEditFormData({
            donorId: "",
            collectionDate: "",
            expiryDate: "",
            status: ""
        });

        setEditError("");
        setEditSuccess("");
    };


    // ==========================================
    // UPDATE BLOOD UNIT
    // ==========================================

    const handleUpdate = async (event) => {
        event.preventDefault();

        setEditError("");
        setEditSuccess("");

        const {
            donorId,
            collectionDate,
            expiryDate,
            status
        } = editFormData;

        const donor = donors.find(
            (item) => item.DonorId === donorId
        );

        if (!donorId) {
            setEditError("Please select a donor.");
            return;
        }

        if (!donor) {
            setEditError("Selected donor was not found.");
            return;
        }

        if (!donor.BloodGroup) {
            setEditError(
                "Blood group is not available for the selected donor."
            );
            return;
        }

        if (!collectionDate) {
            setEditError(
                "Collection date is required."
            );
            return;
        }

        if (!expiryDate) {
            setEditError(
                "Expiry date is required."
            );
            return;
        }

        if (expiryDate < collectionDate) {
            setEditError(
                "Expiry date cannot be before collection date."
            );
            return;
        }

        if (!status) {
            setEditError(
                "Please select a status."
            );
            return;
        }

        if (!selectedUnit?.BloodUnitId) {
            setEditError(
                "Blood Unit ID is missing."
            );
            return;
        }

        try {
            setEditLoading(true);

            const bloodUnitId =
                selectedUnit.BloodUnitId;

            const response = await api.put(
                `/blood-bank/inventory/${bloodUnitId}`,
                {
                    donorId,
                    bloodGroup: donor.BloodGroup,
                    collectionDate,
                    expiryDate,
                    status
                }
            );

            setEditSuccess(
                response.data.message ||
                "Blood unit updated successfully."
            );

            await loadInventory();

            setTimeout(() => {
                setShowEditModal(false);
                setEditSuccess("");
                setSelectedUnit(null);
            }, 1000);

        } catch (error) {
            console.error(
                "Failed to update blood unit:",
                error.response?.data || error.message
            );

            setEditError(
                error.response?.data?.message ||
                "Failed to update blood unit."
            );

        } finally {
            setEditLoading(false);
        }
    };


    return (
        <div className="inventory-page">

            {/* HEADER */}

            <div className="inventory-header">

                <div>
                    <h1>Blood Inventory</h1>

                    <p>
                        Manage available blood units in the blood bank.
                    </p>
                </div>

                <button
                    className="register-hospital-btn"
                    onClick={openForm}
                >
                    <span className="btn-icon">+</span>
                    Add Blood Unit
                </button>

            </div>


            {/* ADD BLOOD UNIT FORM */}

            {showForm && (
                <div className="inventory-form-card">

                    <div className="form-header">

                        <div>
                            <h2>
                                Add Blood Unit
                            </h2>

                            <p>
                                Enter the blood unit information.
                                Blood Unit ID will be generated automatically.
                            </p>
                        </div>

                        <button
                            className="close-form-btn"
                            onClick={closeForm}
                            disabled={formLoading}
                        >
                            ×
                        </button>

                    </div>


                    {formError && (
                        <div className="form-alert error-alert">
                            {formError}
                        </div>
                    )}


                    {formSuccess && (
                        <div className="form-alert success-alert">
                            {formSuccess}
                        </div>
                    )}


                    <form
                        className="hospital-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label htmlFor="donorId">
                                Donor
                                <span>*</span>
                            </label>

                            <select
                                id="donorId"
                                name="donorId"
                                value={formData.donorId}
                                onChange={handleDonorChange}
                                disabled={formLoading}
                                required
                            >

                                <option value="">
                                    Select Donor
                                </option>

                                {donors.map((donor) => (
                                    <option
                                        key={donor.DonorId}
                                        value={donor.DonorId}
                                    >
                                        {donor.DonorId} - {donor.DonorName}
                                    </option>
                                ))}

                            </select>

                        </div>


                        <div className="form-group">

                            <label htmlFor="bloodGroup">
                                Blood Group
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                id="bloodGroup"
                                value={
                                    selectedDonor?.BloodGroup || ""
                                }
                                placeholder="Select donor first"
                                readOnly
                                disabled={formLoading}
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="collectionDate">
                                Collection Date
                                <span>*</span>
                            </label>

                            <input
                                type="date"
                                id="collectionDate"
                                name="collectionDate"
                                value={formData.collectionDate}
                                onChange={handleChange}
                                disabled={formLoading}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="expiryDate">
                                Expiry Date
                                <span>*</span>
                            </label>

                            <input
                                type="date"
                                id="expiryDate"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                disabled={formLoading}
                                required
                            />

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={closeForm}
                                disabled={formLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-hospital-btn"
                                disabled={formLoading}
                            >
                                {formLoading
                                    ? "Adding..."
                                    : "Add Blood Unit"}
                            </button>

                        </div>

                    </form>

                </div>
            )}


            {/* SUMMARY */}

            <div className="inventory-summary">

                <div className="summary-card">

                    <div className="summary-icon">
                        🩸
                    </div>

                    <div>

                        <p>
                            Total Blood Units
                        </p>

                        <h3>
                            {loading
                                ? "..."
                                : inventory.length}
                        </h3>

                    </div>

                </div>

            </div>


            {/* INVENTORY LIST */}

            <div className="inventory-list-card">

                <div className="list-header">

                    <div>

                        <h2>
                            Available Blood Inventory
                        </h2>

                        <p>
                            Active and non-expired blood units.
                        </p>

                    </div>

                    <button
                        className="refresh-btn"
                        onClick={loadInventory}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {loading && (
                    <div className="state-message">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading inventory...
                        </p>

                    </div>
                )}


                {!loading && error && (
                    <div className="state-message error-state">

                        <div className="state-icon">
                            ⚠
                        </div>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={loadInventory}
                            className="retry-btn"
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {!loading &&
                    !error &&
                    inventory.length === 0 && (

                        <div className="state-message">

                            <div className="state-icon">
                                🩸
                            </div>

                            <h3>
                                No Available Blood Units
                            </h3>

                            <p>
                                There are currently no available
                                blood units in inventory.
                            </p>

                            <button
                                className="register-hospital-btn"
                                onClick={openForm}
                            >
                                <span className="btn-icon">
                                    +
                                </span>
                                Add Blood Unit
                            </button>

                        </div>
                    )}


                {/* TABLE */}

                {!loading &&
                    !error &&
                    inventory.length > 0 && (

                        <div className="table-wrapper">

                            <table className="hospital-table">

                                <thead>

                                    <tr>

                                        <th>#</th>

                                        <th>
                                            Blood Unit ID
                                        </th>

                                        <th>
                                            Donor
                                        </th>

                                        <th>
                                            Blood Group
                                        </th>

                                        <th>
                                            Collection Date
                                        </th>

                                        <th>
                                            Expiry Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {inventory.map(
                                        (unit, index) => {

                                            const donorDetails =
                                                getDonorDetails(
                                                    unit.DonorId
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        unit.BloodUnitId
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>

                                                        <span className="hospital-id">
                                                            {
                                                                unit.BloodUnitId
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* DONOR NAME + ID + AGE */}

                                                    <td>

                                                        <div className="hospital-name-cell">

                                                            <div className="hospital-avatar">
                                                                👤
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        donorDetails?.DonorName ||
                                                                        "Unknown Donor"
                                                                    }
                                                                </strong>

                                                                <span>

                                                                    ID: {
                                                                        unit.DonorId
                                                                    }

                                                                    {" • "}

                                                                    Age: {
                                                                        donorDetails?.Age ||
                                                                        "-"
                                                                    }

                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                unit.BloodGroup
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>
                                                        {
                                                            unit.CollectionDate
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            unit.ExpiryDate
                                                        }
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                unit.Status ===
                                                                "AVAILABLE"
                                                                    ? "status-badge available-status"
                                                                    : "status-badge allocated-status"
                                                            }
                                                        >
                                                            {
                                                                unit.Status
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <div className="hospital-actions">

                                                            <button
                                                                className="view-btn"
                                                                onClick={() =>
                                                                    handleView(
                                                                        unit.BloodUnitId
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </button>

                                                            <button
                                                                className="update-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        unit
                                                                    )
                                                                }
                                                            >
                                                                Update
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

            </div>


            {/* VIEW MODAL */}

            {showViewModal && (

                <div className="hospital-modal-overlay">

                    <div className="hospital-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Blood Unit Details
                                </h2>

                                <p>
                                    View blood unit information.
                                </p>

                            </div>

                            <button
                                className="modal-close-btn"
                                onClick={closeViewModal}
                            >
                                ×
                            </button>

                        </div>


                        {viewLoading ? (

                            <div className="modal-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading blood unit details...
                                </p>

                            </div>

                        ) : selectedUnit ? (

                            <div className="hospital-details">

                                <div className="detail-item">

                                    <span>
                                        Blood Unit ID
                                    </span>

                                    <strong>
                                        {
                                            selectedUnit.BloodUnitId
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Donor ID
                                    </span>

                                    <strong>
                                        {
                                            selectedUnit.DonorId
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Donor Name
                                    </span>

                                    <strong>

                                        {
                                            getDonorDetails(
                                                selectedUnit.DonorId
                                            )?.DonorName ||
                                            "-"
                                        }

                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Donor Age
                                    </span>

                                    <strong>

                                        {
                                            getDonorDetails(
                                                selectedUnit.DonorId
                                            )?.Age ||
                                            "-"
                                        }

                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Blood Group
                                    </span>

                                    <strong>
                                        {
                                            selectedUnit.BloodGroup
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Collection Date
                                    </span>

                                    <strong>
                                        {
                                            selectedUnit.CollectionDate
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Expiry Date
                                    </span>

                                    <strong>
                                        {
                                            selectedUnit.ExpiryDate
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {
                                            selectedUnit.Status
                                        }
                                    </strong>

                                </div>

                            </div>

                        ) : (

                            <div className="modal-loading">

                                <p>
                                    Blood unit not found.
                                </p>

                            </div>

                        )}


                        <div className="modal-footer">

                            <button
                                className="cancel-btn"
                                onClick={closeViewModal}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* UPDATE MODAL */}

            {showEditModal && (

                <div className="hospital-modal-overlay">

                    <div className="hospital-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Update Blood Unit
                                </h2>

                                <p>
                                    Update blood unit information.
                                </p>

                            </div>

                            <button
                                className="modal-close-btn"
                                onClick={closeEditModal}
                                disabled={editLoading}
                            >
                                ×
                            </button>

                        </div>


                        <div className="readonly-hospital-id">

                            <label>
                                Blood Unit ID
                            </label>

                            <input
                                type="text"
                                value={
                                    selectedUnit?.BloodUnitId ||
                                    ""
                                }
                                readOnly
                            />

                        </div>


                        {editError && (
                            <div className="form-alert error-alert">
                                {editError}
                            </div>
                        )}


                        {editSuccess && (
                            <div className="form-alert success-alert">
                                {editSuccess}
                            </div>
                        )}


                        <form
                            className="hospital-form"
                            onSubmit={handleUpdate}
                        >

                            <div className="form-group">

                                <label htmlFor="editDonorId">
                                    Donor
                                    <span>*</span>
                                </label>

                                <select
                                    id="editDonorId"
                                    name="donorId"
                                    value={
                                        editFormData.donorId
                                    }
                                    onChange={
                                        handleEditDonorChange
                                    }
                                    disabled={editLoading}
                                    required
                                >

                                    <option value="">
                                        Select Donor
                                    </option>

                                    {donors.map((donor) => (

                                        <option
                                            key={
                                                donor.DonorId
                                            }
                                            value={
                                                donor.DonorId
                                            }
                                        >
                                            {
                                                donor.DonorId
                                            }
                                            {" - "}
                                            {
                                                donor.DonorName
                                            }
                                        </option>

                                    ))}

                                </select>

                            </div>


                            <div className="form-group">

                                <label htmlFor="editBloodGroup">
                                    Blood Group
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    id="editBloodGroup"
                                    value={
                                        selectedEditDonor?.BloodGroup || ""
                                    }
                                    placeholder="Select donor first"
                                    readOnly
                                    disabled={editLoading}
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="editCollectionDate">
                                    Collection Date
                                    <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    id="editCollectionDate"
                                    name="collectionDate"
                                    value={
                                        editFormData.collectionDate
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={editLoading}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="editExpiryDate">
                                    Expiry Date
                                    <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    id="editExpiryDate"
                                    name="expiryDate"
                                    value={
                                        editFormData.expiryDate
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={editLoading}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="editStatus">
                                    Status
                                    <span>*</span>
                                </label>

                                <select
                                    id="editStatus"
                                    name="status"
                                    value={
                                        editFormData.status
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={editLoading}
                                    required
                                >

                                    <option value="AVAILABLE">
                                        AVAILABLE
                                    </option>

                                    <option value="ALLOCATED">
                                        ALLOCATED
                                    </option>

                                </select>

                            </div>


                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeEditModal}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-hospital-btn"
                                    disabled={editLoading}
                                >
                                    {editLoading
                                        ? "Updating..."
                                        : "Update Blood Unit"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Inventory;