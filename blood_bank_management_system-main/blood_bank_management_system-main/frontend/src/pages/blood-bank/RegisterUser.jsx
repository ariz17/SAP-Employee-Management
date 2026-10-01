import { useState, useEffect } from "react";
import api from "../../services/api";

function RegisterUser() {

    const [hospitals, setHospitals] = useState([]);
    const [loadingHospitals, setLoadingHospitals] = useState(true);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "HOSPITAL",
        hospitalId: "",
        email: "",
        status: "ACTIVE"
    });


    // Load hospitals when page opens
    useEffect(() => {
        loadHospitals();
    }, []);


    const loadHospitals = async () => {
        try {
            setLoadingHospitals(true);

            const response = await api.get(
                "/blood-bank/hospitals"
            );

            setHospitals(response.data.data);

        } catch (error) {

            console.error(
                "Failed to load hospitals:",
                error.response?.data || error.message
            );

            alert("Failed to load hospitals.");

        } finally {
            setLoadingHospitals(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await api.post(
                "/blood-bank/users",
                formData
            );

            console.log(
                "Registration successful:",
                response.data
            );

            alert("User registered successfully!");


            // Reset form
            setFormData({
                username: "",
                password: "",
                role: "HOSPITAL",
                hospitalId: "",
                email: "",
                status: "ACTIVE"
            });

        } catch (error) {

            console.error(
                "Registration error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to register user."
            );
        }
    };


    return (
        <div className="register-user-page">

            <div className="register-user-heading">
                <h2>Register User</h2>

                <p>
                    Create a new Blood Bank or Hospital user.
                </p>
            </div>


            <div className="register-user-card">

                <form
                    className="register-user-form"
                    onSubmit={handleSubmit}
                >

                    {/* Username */}

                    <div className="register-user-field">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                        />

                    </div>


                    {/* Password */}

                    <div className="register-user-field">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />

                    </div>


                    {/* Role */}

                    <div className="register-user-field">

                        <label>
                            Role
                        </label>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >

                            <option value="HOSPITAL">
                                Hospital
                            </option>

                            <option value="BLOOD_BANK">
                                Blood Bank
                            </option>

                        </select>

                    </div>


                    {/* Hospital */}

                    <div className="register-user-field">

                        <label>
                            Hospital
                        </label>

                        <select
                            name="hospitalId"
                            value={formData.hospitalId}
                            onChange={handleChange}
                            disabled={
                                formData.role === "BLOOD_BANK" ||
                                loadingHospitals
                            }
                            required={
                                formData.role === "HOSPITAL"
                            }
                        >

                            <option value="">
                                {loadingHospitals
                                    ? "Loading hospitals..."
                                    : "Select Hospital"}
                            </option>


                            {hospitals.map((hospital) => (

                                <option
                                    key={hospital.HospitalId}
                                    value={hospital.HospitalId}
                                >
                                    {hospital.HospitalName}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* Email */}

                    <div className="register-user-field">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            required
                        />

                    </div>


                    {/* Status */}

                    <div className="register-user-field">

                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>

                        </select>

                    </div>


                    {/* Submit */}

                    <div className="register-user-actions">

                        <button
                            type="submit"
                            className="register-user-button"
                        >
                            Register User
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default RegisterUser;