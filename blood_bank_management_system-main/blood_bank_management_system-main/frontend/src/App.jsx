import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


// ==========================================
// PAGES
// ==========================================

import Login from "./pages/Login";

import BloodBankDashboard
    from "./pages/BloodBankDashboard";

import HospitalDashboard
    from "./pages/HospitalDashboard";


// ==========================================
// COMPONENTS
// ==========================================

import ProtectedRoute
    from "./components/ProtectedRoute";


// ==========================================
// LAYOUTS
// ==========================================

import BloodBankLayout
    from "./layouts/BloodBankLayout";


// ==========================================
// BLOOD BANK PAGES
// ==========================================

import RegisterUser
    from "./pages/blood-bank/RegisterUser";

import Donors
    from "./pages/blood-bank/Donors";

import Hospitals
    from "./pages/blood-bank/Hospitals";

import Inventory
    from "./pages/blood-bank/Inventory";

import Requests
    from "./pages/blood-bank/Requests";

import Allocation
    from "./pages/blood-bank/Allocation";


// ==========================================
// HOSPITAL PAGES
// ==========================================

import HospitalRequests
    from "./pages/hospital/HospitalRequests";

import Analytics from "./pages/blood-bank/Analytics";

import Reports from "./pages/blood-bank/Reports";


// ==========================================
// APP
// ==========================================

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ======================================
                    PUBLIC ROUTES
                ====================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ======================================
                    BLOOD BANK ROUTES
                ====================================== */}

                <Route
                    element={

                        <ProtectedRoute
                            allowedRoles={[
                                "BLOOD_BANK"
                            ]}
                        >

                            <BloodBankLayout />

                        </ProtectedRoute>

                    }
                >


                    {/* DASHBOARD */}

                    <Route
                        path="/blood-bank/dashboard"
                        element={
                            <BloodBankDashboard />
                        }
                    />


                    {/* REGISTER USER */}

                    <Route
                        path="/blood-bank/register-user"
                        element={
                            <RegisterUser />
                        }
                    />


                    {/* DONORS */}

                    <Route
                        path="/blood-bank/donors"
                        element={
                            <Donors />
                        }
                    />


                    {/* HOSPITALS */}

                    <Route
                        path="/blood-bank/hospitals"
                        element={
                            <Hospitals />
                        }
                    />


                    {/* INVENTORY */}

                    <Route
                        path="/blood-bank/inventory"
                        element={
                            <Inventory />
                        }
                    />


                    {/* BLOOD REQUESTS */}

                    <Route
                        path="/blood-bank/requests"
                        element={
                            <Requests />
                        }
                    />


                    {/* ALLOCATIONS */}

                    <Route
                        path="/blood-bank/allocations"
                        element={
                            <Allocation />
                        }
                    />

                    <Route
    path="/blood-bank/analytics"
    element={<Analytics />}
/>

<Route
    path="/blood-bank/reports"
    element={<Reports />}
/>


                </Route>


                {/* ======================================
                    HOSPITAL ROUTES
                ====================================== */}

                <Route
                    element={

                        <ProtectedRoute
                            allowedRoles={[
                                "HOSPITAL"
                            ]}
                        >

                            {/* 
                                This wrapper is temporary.

                                We can later create
                                HospitalLayout here.
                            */}

                            <div>

                                <Routes />

                            </div>

                        </ProtectedRoute>

                    }
                >

                </Route>


                {/* ======================================
                    HOSPITAL DASHBOARD
                ====================================== */}

                <Route
                    path="/hospital/dashboard"
                    element={

                        <ProtectedRoute
                            allowedRoles={[
                                "HOSPITAL"
                            ]}
                        >

                            <HospitalDashboard />

                        </ProtectedRoute>

                    }
                />


                {/* ======================================
                    HOSPITAL REQUESTS
                ====================================== */}

                <Route
                    path="/hospital/requests"
                    element={

                        <ProtectedRoute
                            allowedRoles={[
                                "HOSPITAL"
                            ]}
                        >

                            <HospitalRequests />

                        </ProtectedRoute>

                    }
                />


                {/* ======================================
                    FALLBACK
                ====================================== */}

                <Route
                    path="*"
                    element={<Login />}
                />


            </Routes>

        </BrowserRouter>

    );
}


export default App;