require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes =
    require("./routes/authRoutes");

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const userRoutes =
    require("./routes/userRoutes");

const hospitalRoutes =
    require("./routes/hospitalRoutes");

const donorRoutes =
    require("./routes/donorRoutes");

const inventoryRoutes =
    require("./routes/inventoryRoutes");

const hospitalRequestRoutes =
    require("./routes/hospitalRequestRoutes");

const bloodBankRequestRoutes =
    require("./routes/bloodBankRequestRoutes");

const allocationRoutes =
    require("./routes/allocationRoutes");

const reportRoutes =
    require("./routes/reportRoutes");


const app = express();


// ============================================================
// CORS
// ============================================================

app.use(
    cors({
        origin: process.env.FRONTEND_URL || true,
        credentials: true
    })
);


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    express.json()
);


// ============================================================
// ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/blood-bank/dashboard",
    dashboardRoutes
);


app.use(
    "/api/blood-bank/users",
    userRoutes
);


app.use(
    "/api/blood-bank/hospitals",
    hospitalRoutes
);


app.use(
    "/api/blood-bank/donors",
    donorRoutes
);


app.use(
    "/api/blood-bank/inventory",
    inventoryRoutes
);


app.use(
    "/api/hospital/requests",
    hospitalRequestRoutes
);


app.use(
    "/api/blood-bank/requests",
    bloodBankRequestRoutes
);


app.use(
    "/api/blood-bank/allocations",
    allocationRoutes
);


app.use(
    "/api/blood-bank/reports",
    reportRoutes
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Blood Bank Management System Backend is running"

        });

    }
);


// ============================================================
// PORT
// ============================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
