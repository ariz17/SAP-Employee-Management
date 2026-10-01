const sapClient = require("./sapService");
const { sapPost } = sapClient;
const bcrypt = require("bcryptjs");

const getUserByUsername = async (username) => {
    const response = await sapClient.get("ZBB_USER_ENTITYSet", {
        params: {
            $filter: `Username eq '${username}'`
        }
    });

    const users = response.data.d.results;

    if (users.length === 0) {
        return null;
    }

    return users[0];
};


// Generate next User ID automatically
const generateUserId = async () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    while (true) {
        let userId = "U";

        for (let i = 0; i < 9; i++) {
            const randomIndex = Math.floor(
                Math.random() * characters.length
            );

            userId += characters[randomIndex];
        }

        const response = await sapClient.get("ZBB_USER_ENTITYSet", {
            params: {
                $filter: `UserId eq '${userId}'`
            }
        });

        const users = response.data.d.results;

        if (users.length === 0) {
            return userId;
        }
    }
};

const createUser = async (userData) => {

    const {
        username,
        password,
        role,
        hospitalId,
        email,
        status
    } = userData;


    // Check whether username already exists
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
        throw new Error("Username already exists");
    }


    // Generate User ID automatically
    const userId = await generateUserId();


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Prepare SAP OData payload
    const payload = {
        UserId: userId,
        Username: username,
        PasswordHash: hashedPassword,
        Role: role,
        HospitalId: hospitalId || "",
        Email: email,
        Status: status || "ACTIVE"
    };


    // Create user in SAP
    const response = await sapPost(
        "ZBB_USER_ENTITYSet",
        payload
    );


    return response.data.d;
};


module.exports = {
    getUserByUsername,
    createUser,
    generateUserId
};