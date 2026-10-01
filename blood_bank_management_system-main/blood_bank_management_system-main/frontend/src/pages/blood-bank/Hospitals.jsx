import { useEffect, useState } from "react";
import api from "../../services/api";

function Hospitals() {
    const [hospitals, setHospitals] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Register form
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        hospitalName: "",
        address: "",
        contactNo: ""
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    // View modal
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Update modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        hospitalName: "",
        address: "",
        contactNo: ""
    });

    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    // Load hospitals when page opens
    useEffect(() => {
        loadHospitals();
    }, []);

    // ==========================================
    // GET ALL HOSPITALS
    // ==========================================
    const loadHospitals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/blood-bank/hospitals");

            setHospitals(response.data.data || []);
        } catch (error) {
            console.error(
                "Failed to load hospitals:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load hospitals."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FORM CHANGE
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
    // OPEN REGISTER FORM
    // ==========================================
    const openForm = () => {
        setFormData({
            hospitalName: "",
            address: "",
            contactNo: ""
        });

        setFormError("");
        setFormSuccess("");

        setShowForm(true);
    };

    // ==========================================
    // CLOSE REGISTER FORM
    // ==========================================
    const closeForm = () => {
        if (formLoading) return;

        setShowForm(false);

        setFormData({
            hospitalName: "",
            address: "",
            contactNo: ""
        });

        setFormError("");
        setFormSuccess("");
    };

    // ==========================================
    // REGISTER HOSPITAL
    // ==========================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");
        setFormSuccess("");

        const hospitalName = formData.hospitalName.trim();
        const address = formData.address.trim();
        const contactNo = formData.contactNo.trim();

        // Validation
        if (!hospitalName) {
            setFormError("Hospital name is required.");
            return;
        }

        if (!address) {
            setFormError("Address is required.");
            return;
        }

        if (!/^\d{10}$/.test(contactNo)) {
            setFormError(
                "Contact number must contain exactly 10 digits."
            );
            return;
        }

        try {
            setFormLoading(true);

            const response = await api.post(
                "/blood-bank/hospitals",
                {
                    hospitalName,
                    address,
                    contactNo
                }
            );

            setFormSuccess(
                response.data.message ||
                "Hospital registered successfully."
            );

            // Reload hospital list
            await loadHospitals();

            // Clear form
            setFormData({
                hospitalName: "",
                address: "",
                contactNo: ""
            });

            // Close form after short delay
            setTimeout(() => {
                setShowForm(false);
                setFormSuccess("");
            }, 1000);

        } catch (error) {
            console.error(
                "Failed to register hospital:",
                error.response?.data || error.message
            );

            setFormError(
                error.response?.data?.message ||
                "Failed to register hospital."
            );
        } finally {
            setFormLoading(false);
        }
    };

    // ==========================================
    // VIEW HOSPITAL
    // ==========================================
    const handleView = async (hospitalId) => {
        try {
            setViewLoading(true);
            setSelectedHospital(null);
            setShowViewModal(true);

            const response = await api.get(
                `/blood-bank/hospitals/${hospitalId}`
            );

            setSelectedHospital(response.data.data);

        } catch (error) {
            console.error(
                "Failed to load hospital details:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to load hospital details."
            );

            setShowViewModal(false);

        } finally {
            setViewLoading(false);
        }
    };

    // ==========================================
    // CLOSE VIEW MODAL
    // ==========================================
    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedHospital(null);
    };

    // ==========================================
    // OPEN UPDATE MODAL
    // ==========================================
    const handleEdit = (hospital) => {
        setSelectedHospital(hospital);

        setEditFormData({
            hospitalName: hospital.HospitalName || "",
            address: hospital.Address || "",
            contactNo: hospital.ContactNo || ""
        });

        setEditError("");
        setEditSuccess("");

        setShowEditModal(true);
    };

    // ==========================================
    // CLOSE UPDATE MODAL
    // ==========================================
    const closeEditModal = () => {
        if (editLoading) return;

        setShowEditModal(false);
        setSelectedHospital(null);

        setEditFormData({
            hospitalName: "",
            address: "",
            contactNo: ""
        });

        setEditError("");
        setEditSuccess("");
    };

    // ==========================================
    // UPDATE HOSPITAL
    // ==========================================
    const handleUpdate = async (event) => {
        event.preventDefault();

        setEditError("");
        setEditSuccess("");

        const hospitalName = editFormData.hospitalName.trim();
        const address = editFormData.address.trim();
        const contactNo = editFormData.contactNo.trim();

        if (!hospitalName) {
            setEditError("Hospital name is required.");
            return;
        }

        if (!address) {
            setEditError("Address is required.");
            return;
        }

        if (!/^\d{10}$/.test(contactNo)) {
            setEditError(
                "Contact number must contain exactly 10 digits."
            );
            return;
        }

        if (!selectedHospital?.HospitalId) {
            setEditError("Hospital ID is missing.");
            return;
        }

        try {
            setEditLoading(true);

            const hospitalId = selectedHospital.HospitalId;

            const response = await api.put(
                `/blood-bank/hospitals/${hospitalId}`,
                {
                    hospitalName,
                    address,
                    contactNo
                }
            );

            setEditSuccess(
                response.data.message ||
                "Hospital updated successfully."
            );

            // Reload hospital list
            await loadHospitals();

            // Close modal after short delay
            setTimeout(() => {
                setShowEditModal(false);
                setEditSuccess("");
                setSelectedHospital(null);
            }, 1000);

        } catch (error) {
            console.error(
                "Failed to update hospital:",
                error.response?.data || error.message
            );

            setEditError(
                error.response?.data?.message ||
                "Failed to update hospital."
            );
        } finally {
            setEditLoading(false);
        }
    };

    // ==========================================
    // DELETE HOSPITAL
    // ==========================================
    const handleDelete = async (hospitalId) => {
        const hospital = hospitals.find(
            (item) => item.HospitalId === hospitalId
        );

        const hospitalName =
            hospital?.HospitalName || "this hospital";

        const confirmed = window.confirm(
            `Are you sure you want to delete ${hospitalName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/blood-bank/hospitals/${hospitalId}`
            );

            alert("Hospital deleted successfully.");

            // Reload hospital list
            await loadHospitals();

        } catch (error) {
            console.error(
                "Failed to delete hospital:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete hospital."
            );
        }
    };

    return (
        <div className="hospitals-page">

            {/* ======================================
                PAGE HEADER
            ====================================== */}
            <div className="hospitals-header">

                <div>
                    <h1>Hospitals</h1>

                    <p>
                        Manage hospitals registered with the blood bank.
                    </p>
                </div>

                <button
                    className="register-hospital-btn"
                    onClick={openForm}
                >
                    <span className="btn-icon">+</span>
                    Register Hospital
                </button>

            </div>


            {/* ======================================
                REGISTER FORM
            ====================================== */}
            {showForm && (
                <div className="hospital-form-card">

                    <div className="form-header">

                        <div>
                            <h2>Register New Hospital</h2>

                            <p>
                                Enter the hospital details below.
                                Hospital ID will be generated automatically.
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


                    {/* Error */}
                    {formError && (
                        <div className="form-alert error-alert">
                            {formError}
                        </div>
                    )}


                    {/* Success */}
                    {formSuccess && (
                        <div className="form-alert success-alert">
                            {formSuccess}
                        </div>
                    )}


                    <form
                        className="hospital-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Hospital Name */}
                        <div className="form-group">

                            <label htmlFor="hospitalName">
                                Hospital Name
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                id="hospitalName"
                                name="hospitalName"
                                value={formData.hospitalName}
                                onChange={handleChange}
                                placeholder="Enter hospital name"
                                disabled={formLoading}
                                maxLength="50"
                                required
                            />

                        </div>


                        {/* Address */}
                        <div className="form-group">

                            <label htmlFor="address">
                                Address
                                <span>*</span>
                            </label>

                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter hospital address"
                                disabled={formLoading}
                                maxLength="100"
                                rows="4"
                                required
                            />

                        </div>


                        {/* Contact */}
                        <div className="form-group">

                            <label htmlFor="contactNo">
                                Contact Number
                                <span>*</span>
                            </label>

                            <input
                                type="tel"
                                id="contactNo"
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleChange}
                                placeholder="Enter 10 digit contact number"
                                disabled={formLoading}
                                maxLength="10"
                                inputMode="numeric"
                                required
                            />

                        </div>


                        {/* Actions */}
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
                                    ? "Registering..."
                                    : "Register Hospital"}
                            </button>

                        </div>

                    </form>

                </div>
            )}


            {/* ======================================
                SUMMARY
            ====================================== */}
            <div className="hospital-summary">

                <div className="summary-card">

                    <div className="summary-icon">
                        🏥
                    </div>

                    <div>

                        <p>Total Hospitals</p>

                        <h3>
                            {loading
                                ? "..."
                                : hospitals.length}
                        </h3>

                    </div>

                </div>

            </div>


            {/* ======================================
                HOSPITAL LIST
            ====================================== */}
            <div className="hospital-list-card">

                <div className="list-header">

                    <div>

                        <h2>Registered Hospitals</h2>

                        <p>
                            Hospitals currently registered in the system.
                        </p>

                    </div>

                    <button
                        className="refresh-btn"
                        onClick={loadHospitals}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* Loading */}
                {loading && (
                    <div className="state-message">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading hospitals...
                        </p>

                    </div>
                )}


                {/* Error */}
                {!loading && error && (
                    <div className="state-message error-state">

                        <div className="state-icon">
                            ⚠
                        </div>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={loadHospitals}
                            className="retry-btn"
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {/* Empty */}
                {!loading &&
                    !error &&
                    hospitals.length === 0 && (

                        <div className="state-message">

                            <div className="state-icon">
                                🏥
                            </div>

                            <h3>
                                No Hospitals Found
                            </h3>

                            <p>
                                No hospitals have been registered yet.
                            </p>

                            <button
                                className="register-hospital-btn"
                                onClick={openForm}
                            >
                                <span className="btn-icon">
                                    +
                                </span>

                                Register Hospital
                            </button>

                        </div>
                    )}


                {/* Hospital Table */}
                {!loading &&
                    !error &&
                    hospitals.length > 0 && (

                        <div className="table-wrapper">

                            <table className="hospital-table">

                                <thead>

                                    <tr>

                                        <th>#</th>

                                        <th>
                                            Hospital ID
                                        </th>

                                        <th>
                                            Hospital Name
                                        </th>

                                        <th>
                                            Address
                                        </th>

                                        <th>
                                            Contact Number
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {hospitals.map(
                                        (hospital, index) => (

                                            <tr
                                                key={
                                                    hospital.HospitalId
                                                }
                                            >

                                                {/* Number */}
                                                <td>
                                                    {index + 1}
                                                </td>


                                                {/* Hospital ID */}
                                                <td>

                                                    <span className="hospital-id">
                                                        {
                                                            hospital.HospitalId
                                                        }
                                                    </span>

                                                </td>


                                                {/* Hospital Name */}
                                                <td>

                                                    <div className="hospital-name-cell">

                                                        <div className="hospital-avatar">

                                                            {hospital.HospitalName
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}

                                                        </div>

                                                        <span>
                                                            {
                                                                hospital.HospitalName
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* Address */}
                                                <td>
                                                    {
                                                        hospital.Address
                                                    }
                                                </td>


                                                {/* Contact */}
                                                <td>
                                                    {
                                                        hospital.ContactNo
                                                    }
                                                </td>


                                                {/* Actions */}
                                                <td>

                                                    <div className="hospital-actions">

                                                        <button
                                                            className="view-btn"
                                                            onClick={() =>
                                                                handleView(
                                                                    hospital.HospitalId
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>


                                                        <button
                                                            className="update-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    hospital
                                                                )
                                                            }
                                                        >
                                                            Update
                                                        </button>


                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    hospital.HospitalId
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

            </div>


            {/* ======================================
                VIEW HOSPITAL MODAL
            ====================================== */}
            {showViewModal && (

                <div className="hospital-modal-overlay">

                    <div className="hospital-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Hospital Details
                                </h2>

                                <p>
                                    View registered hospital information.
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
                                    Loading hospital details...
                                </p>
                            </div>

                        ) : selectedHospital ? (

                            <div className="hospital-details">

                                <div className="detail-item">

                                    <span>
                                        Hospital ID
                                    </span>

                                    <strong>
                                        {
                                            selectedHospital.HospitalId
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Hospital Name
                                    </span>

                                    <strong>
                                        {
                                            selectedHospital.HospitalName
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Address
                                    </span>

                                    <strong>
                                        {
                                            selectedHospital.Address
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Contact Number
                                    </span>

                                    <strong>
                                        {
                                            selectedHospital.ContactNo
                                        }
                                    </strong>

                                </div>

                            </div>

                        ) : (

                            <div className="modal-loading">
                                <p>
                                    Hospital details not found.
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


            {/* ======================================
                UPDATE HOSPITAL MODAL
            ====================================== */}
            {showEditModal && (

                <div className="hospital-modal-overlay">

                    <div className="hospital-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Update Hospital
                                </h2>

                                <p>
                                    Update hospital information.
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


                        {/* Hospital ID */}
                        <div className="readonly-hospital-id">

                            <label>
                                Hospital ID
                            </label>

                            <input
                                type="text"
                                value={
                                    selectedHospital?.HospitalId ||
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

                            {/* Hospital Name */}
                            <div className="form-group">

                                <label htmlFor="editHospitalName">
                                    Hospital Name
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    id="editHospitalName"
                                    name="hospitalName"
                                    value={
                                        editFormData.hospitalName
                                    }
                                    onChange={handleEditChange}
                                    placeholder="Enter hospital name"
                                    disabled={editLoading}
                                    maxLength="50"
                                    required
                                />

                            </div>


                            {/* Address */}
                            <div className="form-group">

                                <label htmlFor="editAddress">
                                    Address
                                    <span>*</span>
                                </label>

                                <textarea
                                    id="editAddress"
                                    name="address"
                                    value={
                                        editFormData.address
                                    }
                                    onChange={handleEditChange}
                                    placeholder="Enter hospital address"
                                    disabled={editLoading}
                                    maxLength="100"
                                    rows="4"
                                    required
                                />

                            </div>


                            {/* Contact */}
                            <div className="form-group">

                                <label htmlFor="editContactNo">
                                    Contact Number
                                    <span>*</span>
                                </label>

                                <input
                                    type="tel"
                                    id="editContactNo"
                                    name="contactNo"
                                    value={
                                        editFormData.contactNo
                                    }
                                    onChange={handleEditChange}
                                    placeholder="Enter 10 digit contact number"
                                    disabled={editLoading}
                                    maxLength="10"
                                    inputMode="numeric"
                                    required
                                />

                            </div>


                            {/* Update Buttons */}
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
                                        : "Update Hospital"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Hospitals;