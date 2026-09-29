const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all incoming requests (Vercel, localhost, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// SAP NetWeaver Gateway Config
const SAP_BASE_URL = process.env.SAP_BASE_URL || 'https://merida.cob.csuchico.edu:8038';
const SAP_ODATA_PATH = process.env.SAP_ODATA_PATH || '/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet';
const SAP_USER = process.env.SAP_USER || 'GLBI-100';
const SAP_PASSWORD = process.env.SAP_PASSWORD || 'Bt@123';

// Ignore self-signed certificates common on university SAP servers
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// In-Memory Fallback Dataset (conforming to SAP ZEMPLY_MNG_DBTAB schema)
let employeeStore = [
  {
    Empid: "100101",
    Name: "Arbab Rizvi",
    Email: "arbab.rizvi@enterprise.com",
    Dept: "IT Consulting",
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
    Name: "Sarah Connor",
    Email: "sarah.connor@enterprise.com",
    Dept: "Cloud & Infrastructure",
    Salary: 980000.00,
    Joindate: "2022-06-10",
    Status: "ACTIVE",
    Leaves: []
  },
  {
    Empid: "100103",
    Name: "Marcus Vance",
    Email: "marcus.vance@enterprise.com",
    Dept: "Software Engineering",
    Salary: 1400000.00,
    Joindate: "2021-11-01",
    Status: "ON_LEAVE",
    Leaves: [
      {
        LeaveId: "80010003",
        Empid: "100103",
        LeaveType: "Sick Leave",
        StartDate: "2026-09-28",
        EndDate: "2026-10-02",
        DaysCount: 5,
        Reason: "Medical recovery",
        Status: "PENDING"
      }
    ]
  },
  {
    Empid: "100104",
    Name: "Priya Nair",
    Email: "priya.nair@enterprise.com",
    Dept: "Human Resources",
    Salary: 820000.00,
    Joindate: "2023-03-20",
    Status: "ACTIVE",
    Leaves: []
  },
  {
    Empid: "100105",
    Name: "Rohit Verma",
    Email: "rohit.verma@enterprise.com",
    Dept: "Finance & Accounts",
    Salary: 1100000.00,
    Joindate: "2020-08-14",
    Status: "ACTIVE",
    Leaves: []
  }
];

// Helper: Fetch live records from SAP Gateway OData
async function fetchFromSapOData() {
  const sapUrl = `${SAP_BASE_URL}${SAP_ODATA_PATH}?$format=json`;
  console.log(`📡 [SAP Gateway] Requesting: ${sapUrl}`);

  const response = await axios.get(sapUrl, {
    auth: {
      username: SAP_USER,
      password: SAP_PASSWORD
    },
    headers: {
      'Accept': 'application/json'
    },
    httpsAgent,
    timeout: 7000 // 7-second timeout before fallback
  });

  const results = response.data?.d?.results;
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('SAP Gateway returned no employee records');
  }

  // Map SAP fields to standard application structure
  return results.map((emp, idx) => ({
    Empid: emp.EMPID || String(100101 + idx),
    Name: emp.NAME || `Employee ${idx + 1}`,
    Email: emp.EMAIL || `employee${idx + 1}@acme.com`,
    Dept: emp.DEPT || 'General',
    Salary: parseFloat(emp.SALARY) || 0,
    Status: emp.STATUS || 'ACTIVE',
    Joindate: emp.JOINDATE || '2022-01-01',
    Leaves: []
  }));
}

// 1. Healthcheck Route
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'SAP Workforce Management API Gateway / BFF',
    architecture: 'React (Frontend) ➔ Express (API Gateway) ➔ SAP NetWeaver Gateway (ABAP OData)',
    sap_target: SAP_BASE_URL,
    sap_service: 'ZEMPLOYEE_SRV_SRV',
    endpoints: {
      getAllEmployees: 'GET /api/employees',
      getEmployeeById: 'GET /api/employees/:id',
      createEmployee: 'POST /api/employees',
      sapStatus: 'GET /api/sap-status',
      directOData: 'GET /sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet?$format=json'
    }
  });
});

// 2. Main Employee API Endpoint (Used by React Frontend)
app.get('/api/employees', async (req, res) => {
  try {
    const liveSapEmployees = await fetchFromSapOData();
    console.log(`✅ [SAP Gateway] Success! Loaded ${liveSapEmployees.length} records from table ZEMPLY_MNG_DBTAB`);
    
    // Update local store with live records
    employeeStore = liveSapEmployees;

    return res.json({
      success: true,
      source: 'LIVE_SAP_GATEWAY',
      sapServer: SAP_BASE_URL,
      count: liveSapEmployees.length,
      data: liveSapEmployees
    });
  } catch (error) {
    console.warn(`⚠️ [SAP Gateway] Offline or unreachable (${error.message}). Serving fault-tolerant fallback data.`);
    
    return res.json({
      success: true,
      source: 'FALLBACK_STORE',
      sapServer: SAP_BASE_URL,
      warning: 'Live SAP Gateway unreachable from this network. Showing enterprise fallback cache.',
      count: employeeStore.length,
      data: employeeStore
    });
  }
});

// 3. Get Single Employee by ID
app.get('/api/employees/:id', (req, res) => {
  const emp = employeeStore.find(e => e.Empid === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  res.json({ success: true, data: emp });
});

// 4. Create Employee (Simulates RAP / ABAP Insert)
app.post('/api/employees', (req, res) => {
  const newEmp = {
    Empid: req.body.Empid || String(Date.now()).slice(-6),
    Name: req.body.Name || 'New Employee',
    Email: req.body.Email || 'new.emp@enterprise.com',
    Dept: req.body.Dept || 'General',
    Salary: parseFloat(req.body.Salary) || 50000,
    Status: req.body.Status || 'ACTIVE',
    Joindate: req.body.Joindate || new Date().toISOString().split('T')[0],
    Leaves: []
  };

  employeeStore.unshift(newEmp);
  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: newEmp
  });
});

// 5. Submit Leave Request for Employee
app.post('/api/employees/:id/leave', (req, res) => {
  const emp = employeeStore.find(e => e.Empid === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const newLeave = {
    LeaveId: '800' + String(Date.now()).slice(-5),
    Empid: emp.Empid,
    LeaveType: req.body.LeaveType || 'Annual Vacation',
    StartDate: req.body.StartDate || new Date().toISOString().split('T')[0],
    EndDate: req.body.EndDate || new Date().toISOString().split('T')[0],
    DaysCount: parseInt(req.body.DaysCount, 10) || 1,
    Reason: req.body.Reason || 'Leave Request',
    Status: 'PENDING'
  };

  if (!Array.isArray(emp.Leaves)) {
    emp.Leaves = [];
  }
  emp.Leaves.unshift(newLeave);

  res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully',
    data: newLeave
  });
});

// 6. SAP Gateway Connectivity Health Check
app.get('/api/sap-status', async (req, res) => {
  try {
    const live = await fetchFromSapOData();
    res.json({
      status: 'ONLINE',
      message: 'Connected to live SAP NetWeaver Gateway',
      server: SAP_BASE_URL,
      records: live.length
    });
  } catch (error) {
    res.json({
      status: 'OFFLINE_OR_FIREWALLED',
      message: 'SAP Gateway not reachable directly from this IP/network',
      server: SAP_BASE_URL,
      error: error.message
    });
  }
});

// 7. Direct OData format pass-through endpoint
// Allows clients expecting raw OData V2 JSON structure (/sap/opu/odata/...) to work directly
app.get('/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet', async (req, res) => {
  try {
    const liveSapEmployees = await fetchFromSapOData();
    return res.json({
      d: {
        results: liveSapEmployees.map(emp => ({
          __metadata: {
            id: `${SAP_BASE_URL}${SAP_ODATA_PATH}('${emp.Empid}')`,
            uri: `${SAP_BASE_URL}${SAP_ODATA_PATH}('${emp.Empid}')`,
            type: 'ZEMPLOYEE_SRV_SRV.ZEMPLY_MNG_DBTAB'
          },
          MANDT: '100',
          EMPID: emp.Empid,
          NAME: emp.Name,
          EMAIL: emp.Email,
          DEPT: emp.Dept,
          SALARY: String(emp.Salary),
          JOINDATE: emp.Joindate,
          STATUS: emp.Status
        }))
      }
    });
  } catch (error) {
    return res.json({
      d: {
        results: employeeStore.map(emp => ({
          __metadata: {
            id: `fallback('${emp.Empid}')`,
            uri: `fallback('${emp.Empid}')`,
            type: 'ZEMPLOYEE_SRV_SRV.ZEMPLY_MNG_DBTAB'
          },
          MANDT: '100',
          EMPID: emp.Empid,
          NAME: emp.Name,
          EMAIL: emp.Email,
          DEPT: emp.Dept,
          SALARY: String(emp.Salary),
          JOINDATE: emp.Joindate,
          STATUS: emp.Status
        }))
      }
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SAP BFF API Gateway running on http://localhost:${PORT}`);
  console.log(`🔗 Target SAP Server: ${SAP_BASE_URL}`);
  console.log(`📄 OData Service: ZEMPLOYEE_SRV_SRV`);
  console.log(`=======================================================`);
});
