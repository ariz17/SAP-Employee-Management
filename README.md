# SAP RAP Employee Management System

## Overview

A transactional **SAP Fiori Elements** application built using the **SAP RESTful ABAP Programming Model (RAP)** on SAP BTP ABAP Environment. The system manages employee records with full CRUD operations, business logic validations, and auto-determination — following modern ABAP Cloud development practices.

---

## Features

- ✅ Create, Read, Update, Delete (CRUD) Employee Records
- ✅ **Salary Validation** — Salary must be between 1 and 9,999,999 (error shown on save)
- ✅ **Status Determination** — Auto-sets Status to `ACTIVE` when a new employee is created
- ✅ **Search Filters** — Filter employees by Name, Department, and Status
- ✅ OData V4 Service exposed via SAP Fiori Elements UI
- ✅ RAP Managed Business Object with Behavior Definition

---

## Technologies Used

- SAP ABAP Cloud (BTP ABAP Environment)
- RESTful ABAP Programming Model (RAP)
- CDS View Entities (Root + Projection)
- Behavior Definition + Behavior Implementation
- OData V4
- SAP Fiori Elements
- Eclipse ADT

---

## Project Architecture

```
Database Table  (zemply_mng_dbtab)
       │
       ▼
Root CDS View  (ZI_EMPLOYEE_DETAILS)
       │  → Defines the data model
       ▼
Projection CDS View  (ZC_EMPLOYEE_DETAILS)
       │  → UI annotations, Fiori layout, Search fields
       ▼
Behavior Definition  (ZI_EMPLOYEE_DETAILS)
       │  → CRUD, Validation, Determination
       ▼
Behavior Implementation  (ZBP_I_EMPLOYEE_DETAILS)
       │  → Real ABAP logic for validation & determination
       ▼
Service Definition  (ZUI_EMPLOYEE_SERVICE)
       │
       ▼
Service Binding  (ZUI_EMPLOYEE_SERVICE_BINDING)
       │  → OData V4 - UI
       ▼
SAP Fiori Elements Application
```

---

## RAP Objects

### Database Table
- `ZEMPLY_MNG_DBTAB`
  - Fields: EmpID, Name, Email, Department, Salary, Join Date, Status

### CDS Views
| View | Type | Purpose |
|------|------|---------|
| `ZI_EMPLOYEE_DETAILS` | Root View Entity | Data model, selects from DB table |
| `ZC_EMPLOYEE_DETAILS` | Projection View | UI annotations, Fiori layout |

### Behavior Definition
| Feature | Details |
|---------|---------|
| Operations | Create, Update, Delete |
| Validation | `validateSalary` — Salary must be > 0 and ≤ 9,999,999 |
| Determination | `setDefaultStatus` — Auto-sets Status = ACTIVE on create |

### Service
| Object | Value |
|--------|-------|
| Service Definition | `ZUI_EMPLOYEE_SERVICE` |
| Service Binding | `ZUI_EMPLOYEE_SERVICE_BINDING` |
| Binding Type | OData V4 - UI |

---

## Key Implementation Details

### Salary Validation (Behavior Implementation)
```abap
METHOD validateSalary.
  READ ENTITIES OF zi_employee_details IN LOCAL MODE
    ENTITY zi_employee_details
      FIELDS ( Salary )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_employees).

  LOOP AT lt_employees INTO DATA(ls_emp).
    IF ls_emp-Salary <= 0.
      APPEND VALUE #(
        %tky = ls_emp-%tky
        %msg = new_message_with_text(
                 severity = if_abap_behv_message=>severity-error
                 text     = 'Salary must be greater than 0' )
      ) TO reported-zi_employee_details.
      APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-zi_employee_details.
    ELSEIF ls_emp-Salary > 9999999.
      APPEND VALUE #(
        %tky = ls_emp-%tky
        %msg = new_message_with_text(
                 severity = if_abap_behv_message=>severity-error
                 text     = 'Salary cannot exceed 9,999,999' )
      ) TO reported-zi_employee_details.
      APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-zi_employee_details.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

### Status Determination (Auto-set on Create)
```abap
METHOD setDefaultStatus.
  READ ENTITIES OF zi_employee_details IN LOCAL MODE
    ENTITY zi_employee_details
      FIELDS ( Status )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_employees).

  MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE
    ENTITY zi_employee_details
      UPDATE FIELDS ( Status )
      WITH VALUE #( FOR ls_emp IN lt_employees
        ( %tky   = ls_emp-%tky
          Status = 'ACTIVE' ) ).
ENDMETHOD.
```

---

## Project Structure

```
SAP Employee Management/
├── database/
│   └── zemply_mng_dbtab.tabl       # Database table definition
├── cds/
│   ├── ZI_EMPLOYEE_565.ddls        # Root CDS View Entity
│   └── ZC_EMPLOYEE_565.ddls        # Projection CDS View (UI annotations)
├── behavior/
│   ├── ZI_EMPLOYEE_565.bdef        # Behavior Definition
│   ├── ZC_EMPLOYEE_565.bdef        # Projection Behavior Definition
│   └── ZBP_I_EMPLOYEE_565.abap     # Behavior Implementation Class
├── service/
│   ├── ZUI_EMPLOYEE_SERVICE_565.srvd  # Service Definition
│   └── SERVICE_BINDING.md             # Service Binding info
└── README.md
```

---

## Learning Outcomes

- Built a complete RAP Business Object from scratch
- Implemented CDS View Entities (Root + Projection)
- Created Behavior Definitions with Validation and Determination
- Wrote ABAP behavior implementation logic
- Published OData V4 Services via Service Binding
- Built SAP Fiori Elements UI with search filters and header info

---

## Author

**Arbab Rizvi**
