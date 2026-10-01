import { useEffect, useState } from "react";
import api from "../../services/api";

function Donors() {

    const [donors, setDonors] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [editingDonor, setEditingDonor] = useState(null);
    const [selectedDonor, setSelectedDonor] = useState(null);

    const [formData, setFormData] = useState({
        donorName: "",
        gender: "",
        age: "",
        bloodGroup: "",
        mobileNo: "",
        address: "",
        lastDonationDate: ""
    });


    // ========================================================
    // LOAD DONORS
    // ========================================================

    useEffect(() => {
        loadDonors();
    }, []);


    const loadDonors = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/blood-bank/donors"
            );

            setDonors(response.data.data);

        } catch (error) {

            console.error(
                "Failed to load donors:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load donors."
            );

        } finally {

            setLoading(false);
        }
    };


    // ========================================================
    // SEARCH DONORS
    // ========================================================

    const filteredDonors = donors.filter((donor) => {

        const searchValue = search
            .toLowerCase()
            .trim();

        return (
            donor.DonorId?.toLowerCase().includes(searchValue) ||
            donor.DonorName?.toLowerCase().includes(searchValue) ||
            donor.BloodGroup?.toLowerCase().includes(searchValue) ||
            donor.MobileNo?.toLowerCase().includes(searchValue)
        );
    });


    // ========================================================
    // HANDLE INPUT CHANGE
    // ========================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    // ========================================================
    // OPEN ADD DONOR FORM
    // ========================================================

    const handleAddDonor = () => {

        setEditingDonor(null);

        setFormData({
            donorName: "",
            gender: "",
            age: "",
            bloodGroup: "",
            mobileNo: "",
            address: "",
            lastDonationDate: ""
        });

        setShowForm(true);
    };


    // ========================================================
    // OPEN EDIT DONOR FORM
    // ========================================================

    const handleEdit = (donor) => {

        setEditingDonor(donor);

        setFormData({
            donorName: donor.DonorName || "",
            gender: donor.Gender || "",
            age: donor.Age || "",
            bloodGroup: donor.BloodGroup || "",
            mobileNo: donor.MobileNo || "",
            address: donor.Address || "",
            lastDonationDate: donor.LastDonationDate || ""
        });

        setShowForm(true);
    };


    // ========================================================
    // SUBMIT ADD / EDIT
    // ========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            // ------------------------------------------------
            // UPDATE EXISTING DONOR
            // ------------------------------------------------

            if (editingDonor) {

                await api.put(
                    `/blood-bank/donors/${editingDonor.DonorId}`,
                    formData
                );

                alert(
                    "Donor updated successfully."
                );

            }

            // ------------------------------------------------
            // CREATE NEW DONOR
            // ------------------------------------------------

            else {

                await api.post(
                    "/blood-bank/donors",
                    formData
                );

                alert(
                    "Donor registered successfully."
                );
            }


            setShowForm(false);

            setEditingDonor(null);

            await loadDonors();

        } catch (error) {

            console.error(
                "Donor save error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to save donor."
            );
        }
    };


    // ========================================================
    // VIEW DONOR DETAILS
    // ========================================================

    const handleView = async (donorId) => {

        try {

            const response = await api.get(
                `/blood-bank/donors/${donorId}`
            );

            setSelectedDonor(
                response.data.data
            );

            setShowDetails(true);

        } catch (error) {

            console.error(
                "Failed to load donor:",
                error.response?.data || error.message
            );

            alert(
                "Failed to load donor details."
            );
        }
    };


    // ========================================================
    // DELETE DONOR
    // ========================================================

    const handleDelete = async (donorId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this donor?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await api.delete(
                `/blood-bank/donors/${donorId}`
            );

            alert(
                "Donor deleted successfully."
            );

            await loadDonors();

        } catch (error) {

            console.error(
                "Delete donor error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete donor."
            );
        }
    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="page-content">

                <p>
                    Loading donors...
                </p>

            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (
            <div className="page-content">

                <h2>
                    Donors
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={loadDonors}
                >
                    Retry
                </button>

            </div>
        );
    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (

        <div className="page-content">


            {/* =================================================
                PAGE HEADING
            ================================================= */}

            <div className="register-user-heading">

                <div>

                    <h2>
                        Donors
                    </h2>

                    <p>
                        Manage blood donors and their donation
                        information.
                    </p>

                </div>


                <button
                    className="primary-button"
                    onClick={handleAddDonor}
                >
                    + Add Donor
                </button>

            </div>


            {/* =================================================
                DONOR LIST CARD
            ================================================= */}

            <div className="register-user-card">


                {/* Donor List Header */}

                <div className="donor-list-header">

                    <div>

                        <h3>
                            Donor List
                        </h3>

                        <p>
                            Total Donors: {donors.length}
                        </p>

                    </div>


                    <button
                        className="secondary-button"
                        onClick={loadDonors}
                    >
                        Refresh
                    </button>

                </div>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="register-user-field">

                    <label>
                        Search Donors
                    </label>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search by donor ID, name, blood group or mobile number"
                    />

                </div>


                {search && (

                    <p>
                        Showing {filteredDonors.length} of{" "}
                        {donors.length} donors
                    </p>

                )}


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {filteredDonors.length === 0 ? (

                    <div className="empty-state">

                        <h3>

                            {search
                                ? "No donors match your search."
                                : "No donors found."
                            }

                        </h3>


                        {!search && (

                            <button
                                className="primary-button"
                                onClick={handleAddDonor}
                            >
                                + Add First Donor
                            </button>

                        )}

                    </div>

                ) : (


                    /* =================================================
                       DONOR TABLE
                    ================================================= */

                    <div className="donor-table-wrapper">

                        <table className="donor-table">

                            <thead>

                                <tr>

                                    <th>
                                        Donor ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Gender
                                    </th>

                                    <th>
                                        Age
                                    </th>

                                    <th>
                                        Blood Group
                                    </th>

                                    <th>
                                        Mobile
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredDonors.map(
                                    (donor) => (

                                        <tr
                                            key={donor.DonorId}
                                        >

                                            <td>
                                                {donor.DonorId}
                                            </td>

                                            <td>
                                                {donor.DonorName}
                                            </td>

                                            <td>
                                                {donor.Gender}
                                            </td>

                                            <td>
                                                {donor.Age}
                                            </td>

                                            <td>

                                                <strong>
                                                    {donor.BloodGroup}
                                                </strong>

                                            </td>

                                            <td>
                                                {donor.MobileNo}
                                            </td>

                                            <td>

                                                <div className="donor-actions">


                                                    {/* View */}

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            handleView(
                                                                donor.DonorId
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    {/* Edit */}

                                                    <button
                                                        className="edit-button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                donor
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    {/* Delete */}

                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                donor.DonorId
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


            {/* =================================================
                ADD / EDIT DONOR MODAL
            ================================================= */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="modal-card">


                        {/* Modal Header */}

                        <div className="modal-header">

                            <div>

                                <h3>

                                    {editingDonor
                                        ? "Edit Donor"
                                        : "Add Donor"
                                    }

                                </h3>

                                <p>
                                    Enter donor information below.
                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="form-grid">


                                {/* =================================================
                                    DONOR ID
                                    
                                    IMPORTANT:
                                    Not shown here because backend generates it.
                                ================================================= */}


                                {/* Donor Name */}

                                <div className="register-user-field">

                                    <label>
                                        Donor Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="donorName"
                                        value={
                                            formData.donorName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* Gender */}

                                <div className="register-user-field">

                                    <label>
                                        Gender *
                                    </label>

                                    <select
                                        name="gender"
                                        value={
                                            formData.gender
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Gender
                                        </option>

                                        <option value="M">
                                            Male
                                        </option>

                                        <option value="F">
                                            Female
                                        </option>

                                        <option value="O">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* Age */}

                                <div className="register-user-field">

                                    <label>
                                        Age *
                                    </label>

                                    <input
                                        type="number"
                                        name="age"
                                        value={
                                            formData.age
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="18"
                                        max="65"
                                        required
                                    />

                                </div>


                                {/* Blood Group */}

                                <div className="register-user-field">

                                    <label>
                                        Blood Group *
                                    </label>

                                    <select
                                        name="bloodGroup"
                                        value={
                                            formData.bloodGroup
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
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


                                {/* Mobile */}

                                <div className="register-user-field">

                                    <label>
                                        Mobile Number *
                                    </label>

                                    <input
                                        type="tel"
                                        name="mobileNo"
                                        value={
                                            formData.mobileNo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="10"
                                        required
                                    />

                                </div>


                                {/* Last Donation Date */}

                                <div className="register-user-field">

                                    <label>
                                        Last Donation Date
                                    </label>

                                    <input
                                        type="date"
                                        name="lastDonationDate"
                                        value={
                                            formData.lastDonationDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* Address */}

                                <div className="register-user-field full-width">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="3"
                                    />

                                </div>

                            </div>


                            {/* Modal Buttons */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                >

                                    {editingDonor
                                        ? "Update Donor"
                                        : "Register Donor"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                DONOR DETAILS MODAL
            ================================================= */}

            {showDetails &&
                selectedDonor && (

                    <div className="modal-overlay">

                        <div className="modal-card details-card">


                            {/* Header */}

                            <div className="modal-header">

                                <div>

                                    <h3>
                                        Donor Details
                                    </h3>

                                    <p>
                                        Complete donor information
                                    </p>

                                </div>


                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setShowDetails(false)
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* Details */}

                            <div className="details-grid">


                                <div>

                                    <span>
                                        Donor ID
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.DonorId
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.DonorName
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Gender
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.Gender
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Age
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.Age
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Blood Group
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.BloodGroup
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Mobile
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.MobileNo
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Last Donation
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.LastDonationDate ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div className="full-width">

                                    <span>
                                        Address
                                    </span>

                                    <strong>
                                        {
                                            selectedDonor.Address ||
                                            "-"
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* Close Button */}

                            <div className="modal-actions">

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowDetails(false)
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default Donors;