import {

    useEffect,

    useState

} from "react";


import api from "../../services/api";


import jsPDF from "jspdf";


import autoTable from "jspdf-autotable";


function Reports() {


    // ============================================================
    // STATE
    // ============================================================

    const [reportData, setReportData] =
        useState([]);


    const [reportType, setReportType] =
        useState("INVENTORY");


    const [fromDate, setFromDate] =
        useState("");


    const [toDate, setToDate] =
        useState("");


    const [bloodGroup, setBloodGroup] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");



    // ============================================================
    // REPORT API MAP
    // ============================================================

    const reportApiMap = {

        INVENTORY:

            "/blood-bank/reports/inventory",


        DONORS:

            "/blood-bank/reports/donors",


        REQUESTS:

            "/blood-bank/reports/requests",


        ALLOCATIONS:

            "/blood-bank/reports/allocations"

    };



    // ============================================================
    // REPORT TITLE
    // ============================================================

    const getReportTitle = () => {

        const titles = {

            INVENTORY:

                "Blood Inventory Report",


            DONORS:

                "Donor Report",


            REQUESTS:

                "Hospital Request Report",


            ALLOCATIONS:

                "Blood Allocation Report"

        };


        return titles[
            reportType
        ];

    };



    // ============================================================
    // TECHNICAL COLUMN CHECK
    // ============================================================

    const isTechnicalColumn =

        (column, value) => {


            if (

                column === "__metadata"

            ) {

                return true;

            }


            if (

                column.startsWith("__")

            ) {

                return true;

            }


            if (

                column.endsWith("_ENTITY")

            ) {

                return true;

            }


            if (

                value !== null &&

                typeof value === "object" &&

                !(value instanceof Date)

            ) {

                return true;

            }


            return false;

        };



    // ============================================================
    // GET REPORT COLUMNS
    // ============================================================

    const getReportColumns = () => {


        if (

            !Array.isArray(reportData) ||

            reportData.length === 0

        ) {

            return [];

        }


        const allColumns =
            new Set();


        reportData.forEach(

            (item) => {


                if (

                    !item ||

                    typeof item !== "object"

                ) {

                    return;

                }


                Object.keys(item).forEach(

                    (column) => {


                        const value =
                            item[column];


                        if (

                            !isTechnicalColumn(

                                column,

                                value

                            )

                        ) {

                            allColumns.add(
                                column
                            );

                        }

                    }

                );

            }

        );


        return Array.from(
            allColumns
        );

    };



    // ============================================================
    // PARSE DATE
    // ============================================================

    const parseDate =

        (value) => {


            if (!value) {

                return null;

            }


            if (

                value instanceof Date

            ) {

                return value;

            }


            // SAP ODATA DATE

            if (

                typeof value === "string" &&

                value.includes("/Date(")

            ) {


                const match =

                    value.match(
                        /\/Date\((-?\d+)/
                    );


                if (

                    match &&

                    match[1]

                ) {

                    return new Date(

                        Number(
                            match[1]
                        )

                    );

                }

            }


            const date =

                new Date(
                    value
                );


            if (

                isNaN(
                    date.getTime()
                )

            ) {

                return null;

            }


            return date;

        };



    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate =

        (value) => {


            const date =

                parseDate(
                    value
                );


            if (!date) {

                return "-";

            }


            return date.toLocaleDateString();

        };



    // ============================================================
    // GET DATE VALUE
    // ============================================================

    const getDateValue =

        (item) => {


            return (

                item.CollectionDate ||

                item.DonationDate ||

                item.LastDonationDate ||

                item.RequestDate ||

                item.AllocationDate ||

                null

            );

        };



    // ============================================================
    // GENERATE REPORT
    // ============================================================

    const generateReport =

        async () => {


            try {


                setLoading(
                    true
                );


                setError(
                    ""
                );


                setReportData(
                    []
                );


                const apiUrl =

                    reportApiMap[
                        reportType
                    ];


                if (!apiUrl) {

                    throw new Error(
                        "Invalid report type"
                    );

                }


                const response =

                    await api.get(
                        apiUrl
                    );


                let data =

                    response.data?.data ||

                    [];


                if (

                    !Array.isArray(
                        data
                    )

                ) {

                    data = [];

                }



                // =================================================
                // BLOOD GROUP FILTER
                // =================================================

                if (

                    bloodGroup

                ) {


                    data =

                        data.filter(

                            (item) =>

                                item.BloodGroup ===

                                bloodGroup

                        );

                }



                // =================================================
                // DATE FILTER
                // =================================================

                if (

                    fromDate ||

                    toDate

                ) {


                    data =

                        data.filter(

                            (item) => {


                                const reportDate =

                                    getDateValue(
                                        item
                                    );


                                if (

                                    !reportDate

                                ) {

                                    return false;

                                }


                                const date =

                                    parseDate(
                                        reportDate
                                    );


                                if (!date) {

                                    return false;

                                }


                                date.setHours(

                                    0,

                                    0,

                                    0,

                                    0

                                );


                                // FROM DATE

                                if (

                                    fromDate

                                ) {


                                    const from =

                                        new Date(

                                            `${fromDate}T00:00:00`

                                        );


                                    if (

                                        date < from

                                    ) {

                                        return false;

                                    }

                                }


                                // TO DATE

                                if (

                                    toDate

                                ) {


                                    const to =

                                        new Date(

                                            `${toDate}T23:59:59`

                                        );


                                    if (

                                        date > to

                                    ) {

                                        return false;

                                    }

                                }


                                return true;

                            }

                        );

                }


                setReportData(
                    data
                );


            } catch (error) {


                console.error(

                    "Generate report error:",

                    error.response?.data ||

                    error.message

                );


                setError(

                    error.response?.data?.message ||

                    error.message ||

                    "Failed to generate report."

                );


            } finally {


                setLoading(
                    false
                );

            }

        };



    // ============================================================
    // EXPORT CSV
    // ============================================================

    const exportCSV = () => {


        if (

            reportData.length === 0

        ) {


            alert(
                "No report data available to export."
            );


            return;

        }


        const columns =

            getReportColumns();


        if (

            columns.length === 0

        ) {


            alert(
                "No valid report columns available."
            );


            return;

        }


        const csvRows =
            [];


        // HEADER

        csvRows.push(

            columns.join(
                ","
            )

        );


        // DATA

        reportData.forEach(

            (item) => {


                const values =

                    columns.map(

                        (column) => {


                            let value =

                                item[
                                    column
                                ];


                            if (

                                value === null ||

                                value === undefined

                            ) {

                                value = "";

                            }


                            if (

                                column.includes(
                                    "Date"
                                )

                            ) {

                                value =

                                    formatDate(
                                        value
                                    );

                            }


                            value =

                                String(
                                    value
                                );


                            value =

                                value.replace(

                                    /"/g,

                                    '""'

                                );


                            return `"${value}"`;

                        }

                    );


                csvRows.push(

                    values.join(
                        ","
                    )

                );

            }

        );


        const csvContent =

            csvRows.join(
                "\n"
            );


        const blob =

            new Blob(

                [
                    csvContent
                ],

                {

                    type:
                        "text/csv;charset=utf-8;"

                }

            );


        const url =

            URL.createObjectURL(
                blob
            );


        const link =

            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =

            getReportTitle()

                .replace(

                    /\s+/g,

                    "_"

                )

                .toLowerCase()

            + ".csv";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    };



    // ============================================================
    // DOWNLOAD SINGLE ROW PDF
    // ============================================================

    const downloadRowPDF =

        (item, index) => {


            try {


                const doc =

                    new jsPDF();


                const columns =

                    getReportColumns();


                // =================================================
                // PDF TITLE
                // =================================================

                doc.setFontSize(
                    18
                );


                doc.text(

                    getReportTitle(),

                    14,

                    20

                );


                doc.setFontSize(
                    11
                );


                doc.text(

                    `Record ${index + 1}`,

                    14,

                    28

                );


                // =================================================
                // PREPARE PDF DATA
                // =================================================

                const tableData =

                    columns.map(

                        (column) => {


                            let value =

                                item[
                                    column
                                ];


                            // FORMAT DATE

                            if (

                                column.includes(
                                    "Date"
                                )

                            ) {

                                value =

                                    formatDate(
                                        value
                                    );

                            }


                            // EMPTY VALUE

                            if (

                                value === null ||

                                value === undefined ||

                                value === ""

                            ) {

                                value = "-";

                            }


                            // OBJECT SAFETY

                            if (

                                typeof value === "object"

                            ) {

                                value = "-";

                            }


                            const label =

                                column

                                    .replace(

                                        /([A-Z])/g,

                                        " $1"

                                    )

                                    .trim();


                            return [

                                label,

                                String(
                                    value
                                )

                            ];

                        }

                    );


                // =================================================
                // PDF TABLE
                // =================================================

                autoTable(

                    doc,

                    {

                        startY:

                            35,


                        head:

                            [

                                [

                                    "Field",

                                    "Value"

                                ]

                            ],


                        body:

                            tableData,


                        styles:

                            {

                                fontSize:
                                    9

                            },


                        headStyles:

                            {

                                fontSize:
                                    10

                            }

                    }

                );


                // =================================================
                // FILE NAME
                // =================================================

                const recordId =

                    item.BloodUnitId ||

                    item.DonorId ||

                    item.RequestId ||

                    item.AllocationId ||

                    index + 1;


                const fileName =

                    `${reportType}_${recordId}.pdf`;


                doc.save(
                    fileName
                );


            } catch (error) {


                console.error(

                    "PDF download error:",

                    error

                );


                alert(
                    "Failed to generate PDF."
                );

            }

        };



    // ============================================================
    // AUTO LOAD
    // ============================================================

    useEffect(

        () => {

            generateReport();

        },

        []

    );



    // ============================================================
    // TABLE COLUMNS
    // ============================================================

    const columns =

        getReportColumns();



    // ============================================================
    // UI
    // ============================================================

    return (

        <div className="reports-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="inventory-header">

                <div>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        Generate and download
                        blood bank operational reports.
                    </p>

                </div>

            </div>



            {/* =================================================
                FILTER CARD
            ================================================= */}

            <div className="inventory-form-card">


                <div className="form-header">

                    <div>

                        <h2>
                            Generate Report
                        </h2>

                        <p>
                            Select report type and
                            apply filters.
                        </p>

                    </div>

                </div>



                <div className="hospital-form">


                    {/* REPORT TYPE */}

                    <div className="form-group">

                        <label>
                            Report Type
                        </label>


                        <select

                            value={
                                reportType
                            }

                            onChange={
                                (event) =>

                                    setReportType(
                                        event.target.value
                                    )
                            }

                        >

                            <option value="INVENTORY">
                                Blood Inventory Report
                            </option>


                            <option value="DONORS">
                                Donor Report
                            </option>


                            <option value="REQUESTS">
                                Hospital Request Report
                            </option>


                            <option value="ALLOCATIONS">
                                Blood Allocation Report
                            </option>

                        </select>

                    </div>



                    {/* FROM DATE */}

                    <div className="form-group">

                        <label>
                            From Date
                        </label>


                        <input

                            type="date"

                            value={
                                fromDate
                            }

                            onChange={
                                (event) =>

                                    setFromDate(
                                        event.target.value
                                    )
                            }

                        />

                    </div>



                    {/* TO DATE */}

                    <div className="form-group">

                        <label>
                            To Date
                        </label>


                        <input

                            type="date"

                            value={
                                toDate
                            }

                            onChange={
                                (event) =>

                                    setToDate(
                                        event.target.value
                                    )
                            }

                        />

                    </div>



                    {/* BLOOD GROUP */}

                    <div className="form-group">

                        <label>
                            Blood Group
                        </label>


                        <select

                            value={
                                bloodGroup
                            }

                            onChange={
                                (event) =>

                                    setBloodGroup(
                                        event.target.value
                                    )
                            }

                        >

                            <option value="">
                                All Blood Groups
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



                    {/* ACTIONS */}

                    <div className="form-actions">


                        <button

                            type="button"

                            className="save-hospital-btn"

                            onClick={
                                generateReport
                            }

                            disabled={
                                loading
                            }

                        >

                            {

                                loading

                                    ? "Generating..."

                                    : "Generate Report"

                            }

                        </button>



                        <button

                            type="button"

                            className="refresh-btn"

                            onClick={
                                exportCSV
                            }

                            disabled={

                                loading ||

                                reportData.length === 0

                            }

                        >

                            Export CSV

                        </button>


                    </div>


                </div>


            </div>



            {/* ERROR */}

            {

                error && (

                    <div className="form-alert error-alert">

                        {
                            error
                        }

                    </div>

                )

            }



            {/* =================================================
                REPORT RESULT
            ================================================= */}

            <div className="inventory-list-card">


                <div className="list-header">


                    <div>

                        <h2>

                            {
                                getReportTitle()
                            }

                        </h2>


                        <p>
                            Generated report data.
                        </p>


                    </div>



                    <div className="request-count">

                        {
                            reportData.length
                        }

                        {" "}

                        Records

                    </div>


                </div>



                {/* LOADING */}

                {

                    loading && (

                        <div className="state-message">

                            <div className="loading-spinner">

                            </div>


                            <p>
                                Generating report...
                            </p>


                        </div>

                    )

                }



                {/* EMPTY */}

                {

                    !loading &&

                    reportData.length === 0 && (

                        <div className="state-message">


                            <div className="state-icon">

                                📊

                            </div>


                            <h3>
                                No Report Data
                            </h3>


                            <p>

                                No records found for
                                the selected filters.

                            </p>


                        </div>

                    )

                }



                {/* TABLE */}

                {

                    !loading &&

                    reportData.length > 0 &&

                    columns.length > 0 && (

                        <div className="table-wrapper">


                            <table className="hospital-table">


                                <thead>


                                    <tr>


                                        <th>
                                            #
                                        </th>


                                        {

                                            columns.map(

                                                (column) => (

                                                    <th
                                                        key={column}
                                                    >

                                                        {

                                                            column

                                                                .replace(

                                                                    /([A-Z])/g,

                                                                    " $1"

                                                                )

                                                                .trim()

                                                        }

                                                    </th>

                                                )

                                            )

                                        }


                                        {/* PDF COLUMN */}

                                        <th>
                                            PDF
                                        </th>


                                    </tr>


                                </thead>



                                <tbody>


                                    {

                                        reportData.map(

                                            (

                                                item,

                                                index

                                            ) => (

                                                <tr

                                                    key={

                                                        item.BloodUnitId ||

                                                        item.DonorId ||

                                                        item.RequestId ||

                                                        item.AllocationId ||

                                                        index

                                                    }

                                                >


                                                    <td>

                                                        {
                                                            index + 1
                                                        }

                                                    </td>



                                                    {

                                                        columns.map(

                                                            (column) => {


                                                                let value =

                                                                    item[
                                                                        column
                                                                    ];


                                                                // DATE

                                                                if (

                                                                    column.includes(
                                                                        "Date"
                                                                    )

                                                                ) {

                                                                    value =

                                                                        formatDate(
                                                                            value
                                                                        );

                                                                }


                                                                // EMPTY

                                                                if (

                                                                    value === null ||

                                                                    value === undefined ||

                                                                    value === ""

                                                                ) {

                                                                    value = "-";

                                                                }


                                                                // SAFETY

                                                                if (

                                                                    typeof value ===
                                                                    "object"

                                                                ) {

                                                                    value = "-";

                                                                }


                                                                return (

                                                                    <td
                                                                        key={column}
                                                                    >

                                                                        {
                                                                            value
                                                                        }

                                                                    </td>

                                                                );

                                                            }

                                                        )

                                                    }



                                                    {/* DOWNLOAD PDF */}

                                                    <td>


                                                        <button

                                                            type="button"

                                                            className="download-pdf-btn"

                                                            onClick={

                                                                () =>

                                                                    downloadRowPDF(

                                                                        item,

                                                                        index

                                                                    )

                                                            }

                                                        >

                                                            Download PDF

                                                        </button>


                                                    </td>


                                                </tr>

                                            )

                                        )

                                    }


                                </tbody>


                            </table>


                        </div>

                    )

                }


            </div>


        </div>

    );

}


export default Reports;