const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

const jar = new CookieJar();

const sapClient = wrapper(
    axios.create({
        baseURL: process.env.SAP_BASE_URL,
        auth: {
            username: process.env.SAP_USERNAME,
            password: process.env.SAP_PASSWORD
        },
        headers: {
            Accept: "application/json"
        },
        jar,
        withCredentials: true
    })
);

// Get CSRF token
const getCsrfToken = async () => {
    const response = await sapClient.get("", {
        headers: {
            "X-CSRF-Token": "Fetch"
        }
    });

    return response.headers["x-csrf-token"];
};

// POST data to SAP with CSRF token
const sapPost = async (entitySet, data) => {
    const csrfToken = await getCsrfToken();

    const response = await sapClient.post(entitySet, data, {
        headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
            Accept: "application/json"
        }
    });

    return response;
};

module.exports = sapClient;
module.exports.sapPost = sapPost;