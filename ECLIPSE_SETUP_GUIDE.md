# 🛠️ SAP Eclipse ADT Activation Guide (Step-by-Step)

This guide walks you through activating the **Enterprise Workforce & Leave Management** project in your Eclipse ADT (ABAP Development Tools) connected to SAP BTP ABAP Cloud.

---

## 📋 Activation Sequence (Dependency Order)

When creating objects in Eclipse ADT, always follow this order so dependencies resolve cleanly:

### Step 1: Create Transparent Database Tables
1. Right-click your package (e.g. `ZEMPLOYEE`) ➔ **New** ➔ **Other ABAP Repository Object** ➔ **Database Table**.
2. Create Table: `zemply_mng_dbtab`
   * Copy code from [`database/zemply_mng_dbtab.tabl`](file:///d:/SAP%20Employee%20Management/database/zemply_mng_dbtab.tabl)
   * Press **Ctrl + F3** to activate.
3. Create Table: `zemply_leave_tab`
   * Copy code from [`database/zemply_leave_tab.tabl`](file:///d:/SAP%20Employee%20Management/database/zemply_leave_tab.tabl)
   * Press **Ctrl + F3** to activate.

---

### Step 2: Create Action Parameter Abstract Entity
1. Right-click package ➔ **New** ➔ **Data Definition**.
2. Name: `ZD_RAISE_PARAM`
   * Copy code from [`cds/ZD_RAISE_PARAM.ddls`](file:///d:/SAP%20Employee%20Management/cds/ZD_RAISE_PARAM.ddls)
   * Press **Ctrl + F3** to activate.

---

### Step 3: Create Core Data Services (CDS) Views
1. **Child Interface View:**
   * Right-click package ➔ **New** ➔ **Data Definition** ➔ Name: `ZI_EMPLOYEE_LEAVE`
   * Copy code from [`cds/ZI_EMPLOYEE_LEAVE.ddls`](file:///d:/SAP%20Employee%20Management/cds/ZI_EMPLOYEE_LEAVE.ddls)
2. **Root Interface View:**
   * Right-click package ➔ **New** ➔ **Data Definition** ➔ Name: `ZI_EMPLOYEE_DETAILS`
   * Copy code from [`cds/ZI_EMPLOYEE_DETAILS.ddls`](file:///d:/SAP%20Employee%20Management/cds/ZI_EMPLOYEE_DETAILS.ddls)
   * Activate both interface views (**Ctrl + Shift + F3**).
3. **Projection Views:**
   * Create `ZC_EMPLOYEE_LEAVE` from [`cds/ZC_EMPLOYEE_LEAVE.ddls`](file:///d:/SAP%20Employee%20Management/cds/ZC_EMPLOYEE_LEAVE.ddls)
   * Create `ZC_EMPLOYEE_DETAILS` from [`cds/ZC_EMPLOYEE_DETAILS.ddls`](file:///d:/SAP%20Employee%20Management/cds/ZC_EMPLOYEE_DETAILS.ddls)
   * Activate both projection views.

---

### Step 4: Create RAP Behavior Definitions
1. Right-click `ZI_EMPLOYEE_DETAILS` ➔ **New Behavior Definition**.
   * Copy code from [`behavior/ZI_EMPLOYEE_565.bdef`](file:///d:/SAP%20Employee%20Management/behavior/ZI_EMPLOYEE_565.bdef)
2. Right-click `ZC_EMPLOYEE_DETAILS` ➔ **New Behavior Definition** (Type: Projection).
   * Copy code from [`behavior/ZC_EMPLOYEE_565.bdef`](file:///d:/SAP%20Employee%20Management/behavior/ZC_EMPLOYEE_565.bdef)
3. Generate and implement the Behavior Pool Class:
   * Double-click class name `zbp_i_employee_details` in the BDEF and press **Ctrl + 1** ➔ **Create Behavior Implementation**.
   * Paste code from [`behavior/ZBP_I_EMPLOYEE_565.abap`](file:///d:/SAP%20Employee%20Management/behavior/ZBP_I_EMPLOYEE_565.abap)
   * Activate (**Ctrl + F3**).

---

### Step 5: Service Definition & Binding (OData V4)
1. Right-click package ➔ **New** ➔ **Service Definition** ➔ Name: `ZUI_EMPLOYEE_SERVICE_565`
   * Copy code from [`service/ZUI_EMPLOYEE_SERVICE_565.srvd`](file:///d:/SAP%20Employee%20Management/service/ZUI_EMPLOYEE_SERVICE_565.srvd)
   * Activate.
2. Right-click `ZUI_EMPLOYEE_SERVICE_565` ➔ **New Service Binding**.
   * Binding Type: **OData V4 - UI**
   * Name: `ZUI_EMPLOYEE_BINDING_565`
   * Click **Publish**!
3. Double-click the entity `Employee` inside the Service Binding editor and click **Preview** to launch the SAP Fiori Elements preview in your browser!
