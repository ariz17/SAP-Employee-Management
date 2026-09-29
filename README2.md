# About the `cds/`, `behavior/`, and `service/` Folders

These 3 folders contain SAP ABAP source code files written in **Eclipse ADT** using the modern **RAP (RESTful Application Programming Model)** approach.

---

## What Each Folder Is

### `cds/` — Core Data Services Views
Written in Eclipse ADT. These are CDS (Core Data Services) views that define how data looks to the outside world.

| File | What it is |
| :--- | :--- |
| `ZI_EMPLOYEE_565.ddls` | Interface View — raw data from the DB table |
| `ZC_EMPLOYEE_565.ddls` | Projection View — what gets exposed to the OData service |
| `ZI_EMPLOYEE_LEAVE.ddls` | Interface View for Leave data |
| `ZC_EMPLOYEE_LEAVE.ddls` | Projection View for Leave data |
| `ZD_RAISE_PARAM.ddls` | Abstract entity for the Give Raise action parameters |

### `behavior/` — RAP Behavior Definitions
Defines what actions are allowed on the data — create, update, delete, and custom actions.

| File | What it is |
| :--- | :--- |
| `ZI_EMPLOYEE_565.bdef` | Behavior Definition — says employees support managed save, give raise, change status |
| `ZBP_I_EMPLOYEE_565.abap` | Behavior Implementation class — actual ABAP code for the actions |

### `service/` — Service Definition & Binding Notes
Exposes the CDS views as an OData V4 service.

| File | What it is |
| :--- | :--- |
| `ZUI_EMPLOYEE_SERVICE_565.srvd` | Service Definition — exposes Employee and LeaveRequest entities |
| `SERVICE_BINDING.md` | Notes on how to create the service binding in Eclipse |

---

## Are These Used in the Frontend or Backend?

**No.** These files run purely inside SAP Eclipse ADT / SAP BTP ABAP environment.

The actual live connection works like this:

```
React (Vercel) → Node.js Backend (Render) → SEGW OData Service (ZEMPLOYEE_SRV_SRV)
                                               ↑
                              This is the classic SEGW service in classic_abap/
```

The `cds/`, `behavior/`, `service/` folders are a **separate, more advanced RAP approach** that was explored during development but the live deployed service uses the classic SEGW approach.

---

## If an Interviewer Asks About These

**Simple answer to say:**

> "Sir, these files are from the modern SAP RAP approach using Eclipse ADT — CDS Views, Behavior Definitions, and Service Definitions. We explored this approach during development. For the live deployment, we used the classic SEGW-based OData service which directly activated on our SAP NetWeaver server and is called by our Node.js backend on Render."

That's it. You don't need to go deeper for a fresher interview at HCL, Capgemini, TCS, or Wipro.

---

## One Line Per Folder to Remember

- **`cds/`** → "CDS views — modern way to define data in SAP Eclipse"
- **`behavior/`** → "RAP Behavior — defines what actions employees can do (raise, status change)"
- **`service/`** → "Service Definition — exposes CDS views as OData V4"
