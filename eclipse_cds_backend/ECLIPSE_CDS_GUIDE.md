# ⚡ 5-Minute Eclipse ADT Backend Setup Guide

This guide is designed for freshers to quickly set up the ABAP backend using **Eclipse ADT (ABAP Development Tools)**.

---

## 🛠️ Step 1: Create Database Table in Eclipse (1 Min)

1. In Eclipse ADT, right-click your ABAP package (or `$TMP`) ➔ **New** ➔ **Other ABAP Repository Object** ➔ **Database Table**.
2. Name: `zemply_mng_dbtab`
3. Description: `Employee Database Table`
4. Paste the code from [`eclipse_cds_backend/zemply_mng_dbtab.tabl`](file:///d:/SAP%20Employee%20Management/eclipse_cds_backend/zemply_mng_dbtab.tabl).
5. Press **Ctrl + F3** to activate!

---

## 📊 Step 2: Insert Test Data in Eclipse (1 Min)

1. Right-click package ➔ **New** ➔ **ABAP Class**.
2. Name: `ZCL_INSERT_EMPLOYEE_DATA`
3. Description: `Console Runner to populate employee test data`
4. Paste the code from [`eclipse_cds_backend/ZCL_INSERT_EMPLOYEE_DATA.abap`](file:///d:/SAP%20Employee%20Management/eclipse_cds_backend/ZCL_INSERT_EMPLOYEE_DATA.abap).
5. Press **Ctrl + F3** to activate.
6. Press **F9** (Run as ABAP Application / Console).
7. In the Eclipse ABAP Console view at the bottom, you will see:
   ```text
   SUCCESS: Inserted 5 employees into ZEMPLY_MNG_DBTAB!
   ```

---

## 🌐 Step 3: Create CDS View with `@OData.publish: true` (1 Min)

1. Right-click package ➔ **New** ➔ **Data Definition**.
2. Name: `ZI_EMPLOYEE`
3. Description: `Employee OData CDS View`
4. Paste the code from [`eclipse_cds_backend/ZI_EMPLOYEE.ddls`](file:///d:/SAP%20Employee%20Management/eclipse_cds_backend/ZI_EMPLOYEE.ddls).
5. Press **Ctrl + F3** to activate!

> 💡 **Notice:** A yellow warning icon or notification appears next to `@OData.publish: true` saying:
> *"Service ZI_EMPLOYEE_CDS has been generated."*

---

## 🚀 Step 4: Activate Service in SAP (1 Min)

1. Open SAP GUI, run transaction **`/IWFND/MAINT_SERVICE`**.
2. Click **Add Service**.
3. System Alias: `LOCAL` (or click F4 and select your local backend).
4. Technical Service Name: `*ZI_EMPLOYEE*` ➔ Press Enter or click **Get Services**.
5. Select `ZI_EMPLOYEE_CDS` from the table ➔ Click **Add Selected Services**.
6. Assign Package: `$TMP` ➔ Click Continue (Green checkmark).
7. Message displayed: *"Service was created and metadata was loaded successfully."*

---

## 🧪 Step 5: Test the Live OData Service (1 Min)

1. In `/IWFND/MAINT_SERVICE`, select `ZI_EMPLOYEE_CDS` and click **SAP Gateway Client** (or transaction `/IWFND/GW_CLIENT`).
2. Run this URL:
   ```http
   GET /sap/opu/odata/sap/ZI_EMPLOYEE_CDS/ZI_EMPLOYEE?$format=json
   ```
3. Click **Execute** (`F8`).
4. You will see a green **HTTP 200 OK** status with all 5 employee JSON records returned directly from your table!

---

## 🖥️ Step 6: Connect to React Frontend

1. In `frontend/vite.config.js`, set your SAP host:
   ```js
   proxy: {
     '/sap': {
       target: 'http://localhost:8000', // Your SAP server IP:Port
       changeOrigin: true,
       secure: false,
     }
   }
   ```
2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:3000` to view the live dashboard!
