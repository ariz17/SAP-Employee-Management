const sapClient = require("./sapService");
const { sapPost } = sapClient;

// Get all hospitals
const getAllHospitals = async () => {
    const response = await sapClient.get("ZHOSPITAL_ENTITYSet");

    return response.data.d.results;
};

// Get hospital by ID
const getHospitalById = async (hospitalId) => {
    const response = await sapClient.get("ZHOSPITAL_ENTITYSet", {
        params: {
            $filter: `HospitalId eq '${hospitalId}'`
        }
    });

    const hospitals = response.data.d.results;

    if (hospitals.length === 0) {
        return null;
    }

    return hospitals[0];
};

// Generate random Hospital ID
const generateHospitalId = async () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    while (true) {
        let hospitalId = "H";

        for (let i = 0; i < 9; i++) {
            const randomIndex = Math.floor(
                Math.random() * characters.length
            );

            hospitalId += characters[randomIndex];
        }

        const existingHospital = await getHospitalById(hospitalId);

        if (!existingHospital) {
            return hospitalId;
        }
    }
};

// Create hospital
const createHospital = async (hospitalData) => {
    const {
        hospitalName,
        address,
        contactNo
    } = hospitalData;

    const hospitalId = await generateHospitalId();

    const payload = {
        HospitalId: hospitalId,
        HospitalName: hospitalName,
        Address: address,
        ContactNo: contactNo
    };

    const response = await sapPost(
        "ZHOSPITAL_ENTITYSet",
        payload
    );

    return response.data.d;
};

// Update hospital
const updateHospital = async (hospitalId, hospitalData) => {
    const csrfToken = await sapClient
        .get("", {
            headers: {
                "X-CSRF-Token": "Fetch"
            }
        })
        .then((response) => response.headers["x-csrf-token"]);

    const payload = {
        HospitalName: hospitalData.hospitalName,
        Address: hospitalData.address,
        ContactNo: hospitalData.contactNo
    };

    const response = await sapClient.put(
        `ZHOSPITAL_ENTITYSet(HospitalId='${hospitalId}')`,
        payload,
        {
            headers: {
                "X-CSRF-Token": csrfToken,
                "Content-Type": "application/json",
                Accept: "application/json"
            }
        }
    );

    return response.data.d;
};

// Delete hospital
const deleteHospital = async (hospitalId) => {
    const csrfToken = await sapClient
        .get("", {
            headers: {
                "X-CSRF-Token": "Fetch"
            }
        })
        .then((response) => response.headers["x-csrf-token"]);

    const response = await sapClient.delete(
        `ZHOSPITAL_ENTITYSet(HospitalId='${hospitalId}')`,
        {
            headers: {
                "X-CSRF-Token": csrfToken,
                Accept: "application/json"
            }
        }
    );

    return response;
};

module.exports = {
    getAllHospitals,
    getHospitalById,
    generateHospitalId,
    createHospital,
    updateHospital,
    deleteHospital
};