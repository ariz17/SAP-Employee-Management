# 🏢 SAP Employee Management System (React + SAP NetWeaver / ABAP OData)

[![SAP ABAP](https://img.shields.io/badge/SAP-ABAP%20NetWeaver-0a6ed1?logo=sap&logoColor=white)](https://www.sap.com)
[![OData Service](https://img.shields.io/badge/Backend-OData%20Gateway-orange)](https://www.odata.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react&logoColor=black)](https://react.dev)
[![Status](https://img.shields.io/badge/Status-Interview%20Ready-success)](#)

> An enterprise full-stack workforce portal built with a modern **React 18** frontend connected to a live **SAP NetWeaver Gateway OData Service** (`ZEMPLOYEE_SRV_SRV`) backed by transparent ABAP database tables (`ZEMPLY_MNG_DBTAB`). Designed as a high-impact second project alongside MERN for fresher interviews (HCL, Capgemini, TCS, Wipro, Infosys).

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [How We Created the SAP OData Service (Step-by-Step)](#-how-we-created-the-sap-odata-service-step-by-step)
3. [System Architecture (3-Tier Enterprise BFF)](#-system-architecture-3-tier-enterprise-bff)
4. [Fresher Interview Speaking Script & Prep](#-fresher-interview-speaking-script--prep)
5. [How to Run the Project Locally](#-how-to-run-the-project-locally)
6. [Repository File Structure](#-repository-file-structure)

---

## 🌟 Project Overview

In real enterprise companies, SAP manages employee master data, payroll, and department structures, but SAP GUI screens can be complex for everyday employees. 

This project bridges that gap by providing:
* **Modern Self-Service UI:** Built with React 18, Vite, and responsive CSS for viewing profiles, requesting leave, and checking status.
* **HR Manager Dashboard:** Real-time headcount metrics, department breakdowns, salary stats, and quick employee actions.
* **Dual-Mode Data Architecture:** Fetches live records from the **SAP Gateway OData Service** when connected to the network; seamlessly falls back to local data if the SAP server is offline.

---

## 🛠️ How We Created the SAP OData Service (Step-by-Step)

Here is the exact short breakdown of how the SAP backend and OData service were built:

### Step 1: Create Database Table in SE11
* Opened SAP GUI transaction **`SE11`** (ABAP Dictionary).
* Created transparent table **`ZEMPLY_MNG_DBTAB`** with delivery class `A`.
* Defined key fields and attributes:
  * `MANDT` (Client)
  * `EMPID` (Primary Key - Employee ID)
  * `NAME` (Employee Full Name)
  * `DEPT` (Department e.g., Engineering, Sales, HR)
  * `STATUS` (Status: Active, On Leave, Inactive)
  * `EMAIL`, `SALARY`, `JOINDATE`, `LEAVES`
* Activated the table and created sample employee records via Utilities ➔ Table Contents ➔ Create Entries.

### Step 2: Create OData Project in SEGW
* Opened transaction **`SEGW`** (SAP Gateway Service Builder).
* Created a new project named **`ZEMPLOYEE_SRV`**.
* Right-clicked Data Model ➔ Import ➔ DDIC Structure, selected table `ZEMPLY_MNG_DBTAB`.
* Created:
  * Entity Type: `ZEMPLY_MNG_DBTAB` (set `EMPID` as the key property).
  * Entity Set: `ZEMPLY_MNG_DBTABSet`.

### Step 3: Generate Runtime Objects
* Clicked **Generate Runtime Objects** button (Red & White circle).
* SAP automatically generated the 4 standard gateway classes:
  * `ZCL_ZEMPLOYEE_SRV_MPC` (Model Provider Class)
  * `ZCL_ZEMPLOYEE_SRV_MPC_EXT`
  * `ZCL_ZEMPLOYEE_SRV_DPC` (Data Provider Class)
  * `ZCL_ZEMPLOYEE_SRV_DPC_EXT` (Extension Class for custom logic)
* Implemented the read logic in `ZCL_ZEMPLOYEE_SRV_DPC_EXT` under method `ZEMPLY_MNG_DBTAB_GET_ENTITYSET` using clean Open SQL:
  ```abap
  SELECT * FROM zemply_mng_dbtab INTO CORRESPONDING FIELDS OF TABLE @et_entityset.
  ```

### Step 4: Register & Activate in `/IWFND/MAINT_SERVICE`
* Opened transaction **`/IWFND/MAINT_SERVICE`**.
* Clicked **Add Service**, selected the system alias (`LOCAL`), and fetched `ZEMPLOYEE_SRV_SRV`.
* Assigned package and activated ICF node (green traffic light).

### Step 5: Test in SAP Gateway Client
* Executed transaction **`/IWFND/GW_CLIENT`**.
* Tested Request URI:
  ```
  /sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet?$format=json
  ```
* Received **HTTP 200 OK** returning clean JSON records from table `ZEMPLY_MNG_DBTAB`.

---

## 🔌 System Architecture (3-Tier Enterprise BFF)

```
[ React 18 Frontend ] (Hosted on Vercel)
       │
       ▼  GET /api/employees
[ Node.js Express API Gateway / BFF ] (Hosted on Render)
       │  • Hides SAP credentials securely (.env)
       │  • Eliminates browser CORS issues
       │  • Provides resilient fallback caching
       │
       ▼  GET /sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet?$format=json
[ SAP NetWeaver Gateway ] (https://merida.cob.csuchico.edu:8038)
       │
       ▼  Open SQL (DPC_EXT Class)
[ Database Table: ZEMPLY_MNG_DBTAB ]
```

1. **Frontend (Vercel):** Calls standard REST endpoint `/api/employees` without exposing sensitive SAP credentials in browser code.
2. **BFF API Gateway (Render):** Express server in `backend/` that communicates server-to-server with the SAP NetWeaver Gateway over HTTPS Basic Auth.
3. **Fault-Tolerant Fallback:** If the university SAP server is ever offline or firewalled, the API Gateway immediately serves clean fallback data matching the SAP schema, ensuring the portfolio is always interactive.
4. **Step-by-Step Cloud Deployment:** See [`RENDER_DEPLOYMENT.md`](file:///d:/SAP%20Employee%20Management/RENDER_DEPLOYMENT.md) for 2-minute 1-click deployment on Render & Vercel.

---

## 🎤 Fresher Interview Speaking Script & Prep

> 🌟 For full word-for-word scripts, elevator pitches, and answers for companies like **HCL, Capgemini, TCS, Wipro, and Cognizant**, open:
> 👉 **[`INTERVIEW_SPEECH_GUIDE.md`](./INTERVIEW_SPEECH_GUIDE.md)**

The guide covers:
* **30-Second Elevator Pitch** — Quick summary when asked "Tell me about your 2nd project."
* **1-Minute Full Introduction** — Structured project pitch highlighting SAP + React integration.
* **2-to-3 Minute Technical Walkthrough** — End-to-end breakdown from SE11 table to Render BFF to React Vercel UI.
* **Why BFF Pattern?** — Clear architectural rationale for security and CORS resolution.
* **Top 6 Fresher Q&A** — Direct spoken answers to common technical questions.
* **SAP T-Codes & Cheat Sheet** — Quick reference for `SE11`, `SEGW`, `/IWFND/MAINT_SERVICE`, `/IWFND/GW_CLIENT`.

---

## 🚀 How to Run the Project Locally

### 1. Prerequisites
* Node.js (v18 or higher recommended)
* npm installed

### 2. Run Steps
```bash
# 1. Clone repository
git clone https://github.com/ariz17/SAP-Employee-Management.git
cd "SAP Employee Management"

# 2. Start Backend API Gateway
cd backend
npm install
npm start   # Runs on http://localhost:5000

# 3. Start Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev # Runs on http://localhost:3000
```

---

## 📁 Repository File Structure

```text
├── README.md                           # Complete project guide & interview preparation
├── RENDER_DEPLOYMENT.md                # 2-minute 1-click cloud deployment guide
├── vercel.json                         # Web deployment configuration
├── backend/                            # Node.js Express API Gateway / BFF (Render)
│   ├── server.js                       # Connects to live SAP NetWeaver Gateway OData
│   └── package.json                    # Backend dependencies
├── frontend/                           # React 18 + Vite Web Application (Vercel)
│   ├── vite.config.js                  # Vite configuration & dev proxy
│   ├── package.json                    # Frontend dependencies
│   ├── src/
│   │   ├── App.jsx                     # State management & live API integration
│   │   ├── index.css                   # Custom enterprise responsive styling
│   │   ├── components/                 # Clean, focused UI views
│   │   │   ├── DashboardView.jsx       # Headcount & salary analytics
│   │   │   ├── EmployeesView.jsx       # Live SAP employee directory
│   │   │   ├── SelfServiceView.jsx     # Profile & leave request portal
│   │   │   ├── LeaveRequestsView.jsx   # Leave approvals management
│   │   │   ├── AnalyticsView.jsx       # Department & compensation charts
│   │   │   ├── ArchitectureView.jsx    # Live SAP architecture explorer
│   │   │   └── LoginScreen.jsx         # Clean JWT authentication screen
│   │   └── data/
│   │       └── mockData.js             # Fallback dataset matching SAP table schema
├── database/                           # Transparent SAP DB Tables (SE11)
│   ├── zemply_mng_dbtab.tabl           # Employee master table definition
│   └── zemply_leave_tab.tabl           # Leave requests table definition
├── classic_abap/                       # Real SAP ABAP Source Code
│   ├── ZCL_ZEMPLOYEE_SRV_DPC_EXT.abap  # SEGW DPC_EXT implementation
│   └── ZCL_INSERT_EMPLOYEE_DATA.abap   # ABAP data generator report
├── cds/                                # Core Data Services (RAP Views)
│   ├── ZI_EMPLOYEE_565.ddls            # Interface View
│   └── ZC_EMPLOYEE_565.ddls            # Projection View
├── behavior/                           # Managed RAP Behavior Definitions
│   ├── ZI_EMPLOYEE_565.bdef            # Behavior definition
│   └── ZBP_I_EMPLOYEE_565.abap         # Behavior implementation class
└── service/                            # Service Definition
    └── ZUI_EMPLOYEE_SERVICE_565.srvd
```

---

## 👨‍💻 Author & Contact
* **Arbab Rizvi**
* GitHub: [@ariz17](https://github.com/ariz17)
* Project Category: Enterprise Full-Stack (SAP ABAP NetWeaver + OData + React 18)
