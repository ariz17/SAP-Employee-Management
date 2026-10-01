const {
    getDashboardData
} = require("../services/dashboardService");


const getDashboard = async (req, res) => {
    try {

        const dashboardData = await getDashboardData();

        return res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard data",
            error: error.response?.data || error.message
        });
    }
};


module.exports = {
    getDashboard
};