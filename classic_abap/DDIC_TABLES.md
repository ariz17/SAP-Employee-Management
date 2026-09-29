# 🗄️ Classic ABAP DDIC Tables (SE11)

Create these two transparent tables in SAP GUI using Transaction **`SE11`**.

---

## 1. Table: `ZEMPLY_MNG_TAB` (Employee Master)

* **Transaction:** `SE11` ➔ Database Table: `ZEMPLY_MNG_TAB` ➔ **Create**
* **Short Description:** `Employee Master Table`
* **Delivery Class:** `A` (Application table - master and transaction data)
* **Data Browser/Table View Maint.:** `Display/Maintenance Allowed`

### Fields Specification:

| Field Name | Key | Initial Values | Data Element / Built-in Type | Length | Decimals | Short Description |
| :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| `MANDT` | **X** | **X** | `MANDT` | 3 | 0 | Client |
| `EMPID` | **X** | **X** | `CHAR10` (or `NUMC10`) | 10 | 0 | Employee ID (Key) |
| `FIRST_NAME` | | | `CHAR40` | 40 | 0 | First Name |
| `LAST_NAME` | | | `CHAR40` | 40 | 0 | Last Name |
| `EMAIL` | | | `CHAR100` | 100 | 0 | Corporate Email Address |
| `DEPARTMENT` | | | `CHAR40` | 40 | 0 | Department |
| `DESIGNATION`| | | `CHAR50` | 50 | 0 | Job Title / Role |
| `SALARY` | | | `CURR15_2` (or `DEC15_2` / `BAPICURR_D`) | 15 | 2 | Current Compensation |
| `CURRENCY` | | | `WAERS` (or `CUKY5`) | 5 | 0 | Currency Code (e.g. USD, EUR, INR) |
| `STATUS` | | | `CHAR20` | 20 | 0 | Status (ACTIVE, ON_LEAVE, INACTIVE) |
| `HIRE_DATE` | | | `DATS` | 8 | 0 | Date of Joining |

* **Technical Settings (Ctrl + Shift + F9):**
  * Data Class: `APPL0` (Master data, transparent tables)
  * Size Category: `0` or `1`
  * Buffering: `Buffering not allowed`
* **Currency/Quantity Fields tab (if using `CURR`):**
  * Reference Table: `ZEMPLY_MNG_TAB`, Reference Field: `CURRENCY`
* **Save & Activate (Ctrl + F3)**

---

## 2. Table: `ZEMPLY_LEAVE_TAB` (Leave Requests)

* **Transaction:** `SE11` ➔ Database Table: `ZEMPLY_LEAVE_TAB` ➔ **Create**
* **Short Description:** `Employee Leave Records Table`
* **Delivery Class:** `A`
* **Data Browser/Table View Maint.:** `Display/Maintenance Allowed`

### Fields Specification:

| Field Name | Key | Initial Values | Data Element / Built-in Type | Length | Decimals | Short Description |
| :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| `MANDT` | **X** | **X** | `MANDT` | 3 | 0 | Client |
| `LEAVE_ID` | **X** | **X** | `CHAR10` (or `NUMC10`) | 10 | 0 | Leave Request ID (Key) |
| `EMPID` | | | `CHAR10` | 10 | 0 | Employee ID (Foreign Key) |
| `LEAVE_TYPE` | | | `CHAR20` | 20 | 0 | Vacation / Sick / Personal / Parental |
| `START_DATE` | | | `DATS` | 8 | 0 | Leave Start Date |
| `END_DATE` | | | `DATS` | 8 | 0 | Leave End Date |
| `DAYS_COUNT` | | | `INT4` | 10 | 0 | Total Number of Days |
| `REASON` | | | `CHAR255` | 255 | 0 | Reason for Leave |
| `STATUS` | | | `CHAR20` | 20 | 0 | Status (PENDING, APPROVED, REJECTED) |
| `APPLIED_ON` | | | `DATS` | 8 | 0 | Date Application Submitted |

* **Technical Settings:**
  * Data Class: `APPL1` (Transaction data)
  * Size Category: `0`
* **Save & Activate (Ctrl + F3)**

---

## 3. Sample Data Insertion Report: `ZINSERT_SAMPLE_EMPLOYEES` (SE38)

Run this quick one-time ABAP executable report in **`SE38`** to populate your tables with initial test records:

```abap
*&---------------------------------------------------------------------*
*& Report ZINSERT_SAMPLE_EMPLOYEES
*&---------------------------------------------------------------------*
REPORT zinsert_sample_employees.

DATA: lt_emp   TYPE TABLE OF zemply_mng_tab,
      lt_leave TYPE TABLE OF zemply_leave_tab.

DELETE FROM zemply_mng_tab.
DELETE FROM zemply_leave_tab.

" Insert Sample Employees
lt_emp = VALUE #(
  ( mandt = sy-mandt empid = '100101' first_name = 'Sarah'   last_name = 'Connor'   email = 'sarah.connor@acme.com'   department = 'Engineering' designation = 'Lead Cloud Architect'   salary = '145000.00' currency = 'USD' status = 'ACTIVE'   hire_date = '20210315' )
  ( mandt = sy-mandt empid = '100102' first_name = 'Marcus'  last_name = 'Vance'    email = 'marcus.vance@acme.com'   department = 'DevOps'      designation = 'Senior Site Rel. Eng.'  salary = '128000.00' currency = 'USD' status = 'ACTIVE'   hire_date = '20210801' )
  ( mandt = sy-mandt empid = '100103' first_name = 'Elena'   last_name = 'Rostova'  email = 'elena.rostova@acme.com'  department = 'Security'    designation = 'DevSecOps Specialist'   salary = '132000.00' currency = 'USD' status = 'ON_LEAVE' hire_date = '20220110' )
  ( mandt = sy-mandt empid = '100104' first_name = 'David'   last_name = 'Kim'      email = 'david.kim@acme.com'      department = 'Engineering' designation = 'Full-Stack Developer'   salary = '112000.00' currency = 'USD' status = 'ACTIVE'   hire_date = '20220620' )
  ( mandt = sy-mandt empid = '100105' first_name = 'Amina'   last_name = 'Diallo'   email = 'amina.diallo@acme.com'   department = 'Data & AI'   designation = 'ML Platform Engineer'   salary = '138000.00' currency = 'USD' status = 'ACTIVE'   hire_date = '20230214' )
).

INSERT zemply_mng_tab FROM TABLE lt_emp.

" Insert Sample Leaves
lt_leave = VALUE #(
  ( mandt = sy-mandt leave_id = 'L-201' empid = '100103' leave_type = 'Vacation' start_date = '20261001' end_date = '20261010' days_count = 10 reason = 'Annual family vacation'     status = 'APPROVED' applied_on = '20260915' )
  ( mandt = sy-mandt leave_id = 'L-202' empid = '100101' leave_type = 'Sick'     start_date = '20261005' end_date = '20261007' days_count = 3  reason = 'Medical procedure'          status = 'PENDING'  applied_on = '20260920' )
  ( mandt = sy-mandt leave_id = 'L-203' empid = '100104' leave_type = 'Personal' start_date = '20261015' end_date = '20261016' days_count = 2  reason = 'Family emergency'           status = 'PENDING'  applied_on = '20260922' )
).

INSERT zemply_leave_tab FROM TABLE lt_leave.

COMMIT WORK.
WRITE: / 'Successfully populated test data in ZEMPLY_MNG_TAB and ZEMPLY_LEAVE_TAB!'.
```
