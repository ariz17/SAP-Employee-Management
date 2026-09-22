// Seed data conforming to SAP RAP Entities:
// Root: ZI_EMPLOYEE_DETAILS / ZC_EMPLOYEE_DETAILS
// Child: ZI_EMPLOYEE_LEAVE / ZC_EMPLOYEE_LEAVE

export const INITIAL_EMPLOYEES = [
  {
    Empid: "100101",
    Name: "Arbab Rizvi",
    Email: "arbab.rizvi@enterprise.sap",
    Dept: "Engineering",
    Salary: 1250000.00,
    Joindate: "2023-01-15",
    Status: "ACTIVE",
    Leaves: [
      {
        LeaveId: "80010001",
        Empid: "100101",
        LeaveType: "Annual Vacation",
        StartDate: "2026-10-05",
        EndDate: "2026-10-09",
        DaysCount: 5,
        Reason: "Family trip",
        Status: "APPROVED"
      }
    ]
  },
  {
    Empid: "100102",
    Name: "Mridul Tripathi",
    Email: "mridul.tripathi@enterprise.sap",
    Dept: "Finance",
    Salary: 980000.00,
    Joindate: "2022-06-10",
    Status: "ACTIVE",
    Leaves: [
      {
        LeaveId: "80010002",
        Empid: "100102",
        LeaveType: "Sick Leave",
        StartDate: "2026-09-24",
        EndDate: "2026-09-25",
        DaysCount: 2,
        Reason: "Medical checkup",
        Status: "PENDING"
      }
    ]
  },
  {
    Empid: "100103",
    Name: "Harshit Sharma",
    Email: "harshit.sharma@enterprise.sap",
    Dept: "Product",
    Salary: 1400000.00,
    Joindate: "2021-11-01",
    Status: "ON_LEAVE",
    Leaves: [
      {
        LeaveId: "80010003",
        Empid: "100103",
        LeaveType: "Parental",
        StartDate: "2026-09-15",
        EndDate: "2026-10-15",
        DaysCount: 30,
        Reason: "Paternity Leave",
        Status: "APPROVED"
      }
    ]
  },
  {
    Empid: "100104",
    Name: "Mohd Faiz",
    Email: "mohd.faiz@enterprise.sap",
    Dept: "Human Resources",
    Salary: 750000.00,
    Joindate: "2023-08-20",
    Status: "ACTIVE",
    Leaves: []
  },
  {
    Empid: "100105",
    Name: "Kshitiz Goel",
    Email: "kshitiz.goel@enterprise.sap",
    Dept: "Engineering",
    Salary: 1600000.00,
    Joindate: "2020-04-12",
    Status: "ACTIVE",
    Leaves: [
      {
        LeaveId: "80010004",
        Empid: "100105",
        LeaveType: "Training & Cert",
        StartDate: "2026-11-02",
        EndDate: "2026-11-04",
        DaysCount: 3,
        Reason: "SAP TechEd Conference",
        Status: "PENDING"
      }
    ]
  }
];

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Finance",
  "Human Resources",
  "Sales & Marketing"
];
