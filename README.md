# 🏢 SAP Cloud Enterprise Workforce & Leave Management System

[![SAP BTP ABAP Cloud](https://img.shields.io/badge/SAP%20BTP-ABAP%20Cloud-0a6ed1?logo=sap&logoColor=white)](https://www.sap.com/products/technology-platform.html)
[![RAP Framework](https://img.shields.io/badge/Architecture-Managed%20RAP-blue)](https://help.sap.com/)
[![OData V4](https://img.shields.io/badge/Protocol-OData%20V4-orange)](https://www.odata.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react&logoColor=black)](https://react.dev)
[![Clean Core](https://img.shields.io/badge/Clean%20Core-Compliant-emerald)](https://community.sap.com/)

> An enterprise-grade Workforce & Leave Management solution built on **SAP BTP ABAP Cloud** using the **ABAP RESTful Application Programming Model (RAP)** with parent-child composition, custom business actions, validations, and determinations — consumed by a modern **React web portal deployed on Vercel**.

---

## 🌟 Key Highlights for SAP Technical Interviews

1. **Two-Tier RAP Composition (Parent-Child):**
   * **Root Entity:** `Employee` (`ZI_EMPLOYEE_DETAILS`)
   * **Child Entity:** `LeaveRequest` (`ZI_EMPLOYEE_LEAVE`)
   * Implements `composition [0..*] of ZI_EMPLOYEE_LEAVE as _Leave` with full lifecycle cascading.
2. **Custom Business Actions:**
   * `giveRaise`: Calculates salary increments dynamically from percentage parameters (`ZD_RAISE_PARAM`).
   * `changeStatus`: Manages employee lifecycle transitions (`ACTIVE` ➔ `ON_LEAVE` ➔ `INACTIVE`).
   * `approveLeave`: Approves pending time-off requests on the child entity.
3. **Determinations & Validations:**
   * `setDefaultStatus`: Automatically defaults employee status to `ACTIVE` on create.
   * `calculateLeaveDays`: Automatically computes leave duration in days.
   * `validateSalary`: Ensures salary complies with corporate bounds ($1 – $9,999,999).
   * `validateDates`: Validates that leave start date is on or before the end date.
4. **Clean Core Compliant:**
   * Pure ABAP Cloud (`strict 2`), strictly decoupled from underlying database modifications, using OData V4 service bindings.
5. **Interactive Web Application:**
   * React 18 + Vite portal deployed on Vercel with real-time KPI metrics, search & filters, action modals, and an embedded **SAP Architecture Explorer**.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["React Web Portal (Vercel) / Fiori Elements"]
    Gateway["SAP OData V4 Service Binding (ZUI_EMPLOYEE_BINDING_565)"]
    ServiceDef["Service Definition (ZUI_EMPLOYEE_SERVICE_565)"]
    
    subgraph SAP RAP Business Object
        RootProj["Root Projection: ZC_EMPLOYEE_DETAILS"]
        ChildProj["Child Projection: ZC_EMPLOYEE_LEAVE"]
        RootView["Root Interface View: ZI_EMPLOYEE_DETAILS"]
        ChildView["Child Interface View: ZI_EMPLOYEE_LEAVE"]
        Behavior["RAP Behavior Handler: zbp_i_employee_details"]
    end
    
    subgraph SAP HANA Persistence Layer
        EmpTable[("zemply_mng_dbtab (Employee Master)")]
        LeaveTable[("zemply_leave_tab (Leave Records)")]
    end
    
    Client -->|HTTP / OData V4| Gateway
    Gateway --> ServiceDef
    ServiceDef --> RootProj
    ServiceDef --> ChildProj
    RootProj -->|projection on| RootView
    ChildProj -->|projection on| ChildView
    RootView -->|composition [0..*]| ChildView
    RootView --> Behavior
    ChildView --> Behavior
    Behavior -->|SQL / Managed Save| EmpTable
    Behavior -->|SQL / Managed Save| LeaveTable
```

---

## 📁 Repository Structure

```
├── database/
│   ├── zemply_mng_dbtab.tabl      # Transparent DB Table: Employee Master
│   └── zemply_leave_tab.tabl      # Transparent DB Table: Leave Requests
├── cds/
│   ├── ZI_EMPLOYEE_DETAILS.ddls   # Root Interface View (with composition)
│   ├── ZI_EMPLOYEE_LEAVE.ddls     # Child Interface View (with parent association)
│   ├── ZC_EMPLOYEE_DETAILS.ddls   # Projection View (with @UI annotations & actions)
│   ├── ZC_EMPLOYEE_LEAVE.ddls     # Child Projection View (with @UI annotations)
│   └── ZD_RAISE_PARAM.ddls        # Abstract Entity: Salary Raise Action Parameters
├── behavior/
│   ├── ZI_EMPLOYEE_565.bdef       # Managed RAP Behavior Definition (Root & Child)
│   ├── ZC_EMPLOYEE_565.bdef       # Projection Behavior Definition
│   └── ZBP_I_EMPLOYEE_565.abap    # Behavior Pool Implementation Class
├── service/
│   ├── ZUI_EMPLOYEE_SERVICE_565.srvd # OData V4 Service Definition
│   └── SERVICE_BINDING.md         # Service Binding Configuration Steps
├── frontend/                      # Modern React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/            # Header, MetricsBar, Modals, Architecture Drawer
│   │   ├── data/mockData.js       # Seed data matching SAP CDS schema
│   │   ├── App.jsx                # Interactive application & state management
│   │   └── index.css              # SAP Horizon-inspired dark mode styling
│   └── package.json
├── ECLIPSE_SETUP_GUIDE.md         # Step-by-step Eclipse ADT activation walkthrough
└── vercel.json                    # Deployment configuration for Vercel
```

---

## 🚀 Running the React Web Application Locally

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Vercel (Free 1-Click Setup)

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: upgrade to enterprise workforce management with RAP composition and React UI"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New Project"** ➔ Import `SAP-Employee-Management`.
4. In the Project Settings:
   * **Root Directory:** `./frontend` (or leave default since root `vercel.json` is configured).
5. Click **Deploy**! 
6. You now have a live public link to put on your resume and show recruiters!

---

## 💬 Interview Q&A Cheatsheet (For Recruiter Calls)

#### Q1: "What architecture did you use for this project?"
> *"I used the ABAP RESTful Application Programming Model (RAP) on SAP BTP ABAP Cloud. The core design is a two-tier managed RAP business object with an Employee root entity and a child Leave Request entity linked via composition. It uses CDS projection views with `@UI` annotations, custom RAP actions for business logic, and is exposed via OData V4."*

#### Q2: "Why did you use RAP Composition instead of a simple Association?"
> *"Composition denotes an existential parent-child relationship where the child entity cannot exist independently of the root. This allows transactional operations, locking, draft state, and authorization to cascade automatically from the Employee root to its Leave items."*

#### Q3: "What custom actions did you implement in ABAP?"
> *"I implemented `giveRaise`, which accepts a percentage parameter (`ZD_RAISE_PARAM`) and updates employee compensation dynamically, and `approveLeave`, which allows managers to update the status of time-off requests."*

---

## 👨‍💻 Author
* **Arbab Rizvi**
* SAP Certified Associate – Backend Developer - ABAP Cloud
* GitHub: [@ariz17](https://github.com/ariz17)
