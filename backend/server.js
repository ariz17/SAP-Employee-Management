const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all incoming requests (Vercel, localhost, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-csrf-token']
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

// File-backed persistence path (survives requests and server restarts)
const DATA_FILE = path.join(__dirname, 'data', 'employees.json');

// Default initial dataset with rich IT departments and leave requests
const DEFAULT_EMPLOYEES = [
  {
    Empid: "100101",
    Name: "Parag Tonger",
    Email: "PARAG.TONGER@GMAIL.COM",
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
        Reason: "Family vacation",
        Status: "APPROVED"
      }
    ]
  },
  {
    Empid: "100102",
    Name: "Harshit Sharma",
    Email: "HARSHIT.SHARMA@GMAIL.COM",
    Dept: "Cloud & Infrastructure",
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
    Name: "Dikshant Sharma",
    Email: "DIKSHANT.SHARMA@GMAIL.COM",
    Dept: "Software Engineering",
    Salary: 1400000.00,
    Joindate: "2021-11-01",
    Status: "ON_LEAVE",
    Leaves: [
      {
        LeaveId: "80010003",
        Empid: "100103",
        LeaveType: "Parental Leave",
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
    Email: "mohd.faiz@enterprise.com",
    Dept: "Cybersecurity",
    Salary: 850000.00,
    Joindate: "2023-08-20",
    Status: "ACTIVE",
    Leaves: []
  },
  {
    Empid: "100105",
    Name: "Kshitiz Goel",
    Email: "kshitiz.goel@enterprise.com",
    Dept: "Data & AI Analytics",
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

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load data from storage file, using in-memory store:', err.message);
  }
  return null;
}

function saveStore(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to persist store to file:', err.message);
  }
}

// Global active store
let employeeStore = loadStore() || JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES));

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
    timeout: 7000
  });

  const results = response.data?.d?.results;
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('SAP Gateway returned no employee records');
  }

  return results.map((emp, idx) => ({
    Empid: emp.Empid || emp.EMPID || String(100101 + idx),
    Name: emp.Name || emp.NAME || `Employee ${idx + 1}`,
    Email: emp.Email || emp.EMAIL || `employee${idx + 1}@acme.com`,
    Dept: emp.Dept || emp.DEPT || 'IT Consulting',
    Salary: parseFloat(emp.Salary || emp.SALARY) || 90000,
    Status: emp.Status || emp.STATUS || 'ACTIVE',
    Joindate: emp.Joindate || emp.JOINDATE || '2023-01-15',
    Leaves: []
  }));
}

// Helper: Fetch CSRF token and session cookies for SAP Gateway writes
async function getSapCsrfToken() {
  const sapUrl = `${SAP_BASE_URL}${SAP_ODATA_PATH}?$top=1&$format=json`;
  const response = await axios.get(sapUrl, {
    auth: { username: SAP_USER, password: SAP_PASSWORD },
    headers: { 'x-csrf-token': 'Fetch', 'Accept': 'application/json' },
    httpsAgent,
    timeout: 7000
  });
  const token = response.headers['x-csrf-token'];
  const cookies = response.headers['set-cookie'] || [];
  return { token, cookies };
}

// Helper: Attempt to sync update to SAP Gateway (OData PUT)
async function syncUpdateToSap(empid, empData) {
  try {
    const { token, cookies } = await getSapCsrfToken();
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    const url = `${SAP_BASE_URL}${SAP_ODATA_PATH}('${empid}')`;
    const payload = {
      Empid: String(empid),
      Name: empData.Name,
      Email: empData.Email,
      Dept: empData.Dept,
      Salary: String(empData.Salary),
      Status: empData.Status
    };
    const res = await axios.put(url, payload, {
      auth: { username: SAP_USER, password: SAP_PASSWORD },
      headers: {
        'x-csrf-token': token,
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      httpsAgent,
      timeout: 7000
    });
    console.log(`✅ [SAP Gateway] Successfully synced PUT to SAP for ${empid}`);
    return { success: true, status: res.status };
  } catch (err) {
    console.warn(`⚠️ [SAP Gateway] Notice for ${empid}: ${err.response?.status || err.message} (${err.response?.data?.error?.message?.value || 'SEGW sandbox read-only'}). Successfully preserved in API Gateway persistent store.`);
    return { success: false, error: err.message };
  }
}

// Initial boot check: if data file didn't exist, try enriching baseline from SAP
if (!fs.existsSync(DATA_FILE)) {
  fetchFromSapOData()
    .then(liveEmployees => {
      liveEmployees.forEach(live => {
        const idx = employeeStore.findIndex(e => e.Empid === live.Empid);
        if (idx !== -1) {
          employeeStore[idx] = {
            ...employeeStore[idx],
            Name: live.Name,
            Email: live.Email,
            Dept: live.Dept || employeeStore[idx].Dept,
            Salary: live.Salary || employeeStore[idx].Salary,
            Status: live.Status || employeeStore[idx].Status
          };
        } else {
          employeeStore.push(live);
        }
      });
      saveStore(employeeStore);
      console.log(`✅ [Startup] Synced ${liveEmployees.length} records from SAP Gateway into store`);
    })
    .catch(err => {
      console.log(`ℹ️ [Startup] Initial SAP fetch (${err.message}). Using enterprise persistent store.`);
      saveStore(employeeStore);
    });
}

// =====================================================================
// API ROUTES
// =====================================================================

// 1. Healthcheck Route
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'SAP Workforce Management API Gateway / BFF',
    architecture: 'React (Frontend) ➔ Express (API Gateway) ➔ SAP NetWeaver Gateway (ABAP OData)',
    sap_target: SAP_BASE_URL,
    sap_service: 'ZEMPLOYEE_SRV_SRV',
    persisted_employees: employeeStore.length,
    endpoints: {
      getAllEmployees: 'GET /api/employees',
      getEmployeeById: 'GET /api/employees/:id',
      createEmployee: 'POST /api/employees',
      updateEmployee: 'PUT /api/employees/:id',
      giveRaise: 'PATCH /api/employees/:id/raise',
      toggleStatus: 'PATCH /api/employees/:id/status',
      deleteEmployee: 'DELETE /api/employees/:id',
      addLeave: 'POST /api/employees/:id/leave',
      updateLeaveStatus: 'PATCH /api/employees/:id/leave/:leaveId',
      resetData: 'POST /api/reset',
      sapStatus: 'GET /api/sap-status'
    }
  });
});

// 2. Main Employee API Endpoint (Used by React Frontend)
// Returns current persistent store so changes NEVER get reset on reload
app.get('/api/employees', async (req, res) => {
  if (req.query.refresh === 'true' || employeeStore.length === 0) {
    try {
      const liveSapEmployees = await fetchFromSapOData();
      liveSapEmployees.forEach(live => {
        const existing = employeeStore.find(e => e.Empid === live.Empid);
        if (!existing) {
          employeeStore.push(live);
        }
      });
      saveStore(employeeStore);
    } catch (error) {
      console.warn(`⚠️ [SAP Gateway] Could not refresh from SAP: ${error.message}`);
    }
  }

  return res.json({
    success: true,
    source: 'ENTERPRISE_API_GATEWAY',
    sapServer: SAP_BASE_URL,
    count: employeeStore.length,
    data: employeeStore
  });
});

// 3. Get Single Employee by ID
app.get('/api/employees/:id', (req, res) => {
  const emp = employeeStore.find(e => e.Empid === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  res.json({ success: true, data: emp });
});

// 4. Create Employee (Persisted + SAP sync attempt)
app.post('/api/employees', async (req, res) => {
  const newEmp = {
    Empid: req.body.Empid || String(100100 + employeeStore.length + 1),
    Name: req.body.Name || 'New Employee',
    Email: req.body.Email || 'new.emp@enterprise.com',
    Dept: req.body.Dept || 'IT Consulting',
    Salary: parseFloat(req.body.Salary) || 50000,
    Status: req.body.Status || 'ACTIVE',
    Joindate: req.body.Joindate || new Date().toISOString().split('T')[0],
    Leaves: []
  };

  employeeStore.unshift(newEmp);
  saveStore(employeeStore);

  // Background sync attempt with SAP Gateway
  (async () => {
    try {
      const { token, cookies } = await getSapCsrfToken();
      const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      await axios.post(`${SAP_BASE_URL}${SAP_ODATA_PATH}`, {
        Empid: newEmp.Empid,
        Name: newEmp.Name,
        Email: newEmp.Email,
        Dept: newEmp.Dept,
        Salary: String(newEmp.Salary),
        Status: newEmp.Status
      }, {
        auth: { username: SAP_USER, password: SAP_PASSWORD },
        headers: {
          'x-csrf-token': token,
          'Cookie': cookieHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        httpsAgent,
        timeout: 7000
      });
      console.log(`✅ [SAP Gateway] Synced POST to SAP for ${newEmp.Empid}`);
    } catch (e) {
      console.warn(`⚠️ [SAP Gateway] Notice on create ${newEmp.Empid}: ${e.message}`);
    }
  })().catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: newEmp
  });
});

// 5. Update Full Employee
app.put('/api/employees/:id', async (req, res) => {
  const idx = employeeStore.findIndex(e => e.Empid === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  employeeStore[idx] = {
    ...employeeStore[idx],
    ...req.body,
    Empid: req.params.id // ensure ID is never changed
  };

  saveStore(employeeStore);
  syncUpdateToSap(req.params.id, employeeStore[idx]).catch(() => {});

  res.json({
    success: true,
    message: 'Employee updated successfully',
    data: employeeStore[idx]
  });
});

// 6. Give Raise (Action)
app.patch('/api/employees/:id/raise', async (req, res) => {
  const { percentage, reason } = req.body;
  const emp = employeeStore.find(e => e.Empid === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const currentSalary = parseFloat(emp.Salary) || 0;
  const pct = parseFloat(percentage) || 0;
  const updatedSalary = Math.round(currentSalary * (1 + (pct / 100)));
  emp.Salary = updatedSalary;

  saveStore(employeeStore);
  syncUpdateToSap(emp.Empid, emp).catch(() => {});

  console.log(`💰 [Gateway] Applied ${pct}% raise to ${emp.Name} (${emp.Empid}). New Salary: ${updatedSalary}`);

  res.json({
    success: true,
    message: `Raise of ${pct}% applied successfully. New salary: ${updatedSalary}`,
    data: emp
  });
});

// 7. Toggle / Change Status (Action)
app.patch('/api/employees/:id/status', async (req, res) => {
  const emp = employeeStore.find(e => e.Empid === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  if (req.body.status) {
    emp.Status = req.body.status;
  } else {
    // Cycle: ACTIVE -> ON_LEAVE -> INACTIVE -> ACTIVE
    if (emp.Status === 'ACTIVE') emp.Status = 'ON_LEAVE';
    else if (emp.Status === 'ON_LEAVE') emp.Status = 'INACTIVE';
    else emp.Status = 'ACTIVE';
  }

  saveStore(employeeStore);
  syncUpdateToSap(emp.Empid, emp).catch(() => {});

  console.log(`🔄 [Gateway] Toggled status of ${emp.Name} (${emp.Empid}) to ${emp.Status}`);

  res.json({
    success: true,
    message: `Status updated to ${emp.Status}`,
    data: emp
  });
});

// 8. Delete Employee
app.delete('/api/employees/:id', async (req, res) => {
  const empid = req.params.id;
  const idx = employeeStore.findIndex(e => e.Empid === empid);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  employeeStore.splice(idx, 1);
  saveStore(employeeStore);

  // Background SAP delete attempt
  (async () => {
    try {
      const { token, cookies } = await getSapCsrfToken();
      const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      await axios.delete(`${SAP_BASE_URL}${SAP_ODATA_PATH}('${empid}')`, {
        auth: { username: SAP_USER, password: SAP_PASSWORD },
        headers: { 'x-csrf-token': token, 'Cookie': cookieHeader },
        httpsAgent,
        timeout: 7000
      });
      console.log(`✅ [SAP Gateway] Synced DELETE to SAP for ${empid}`);
    } catch (e) {
      console.warn(`⚠️ [SAP Gateway] Notice on delete ${empid}: ${e.message}`);
    }
  })().catch(() => {});

  res.json({
    success: true,
    message: `Employee ${empid} deleted successfully`,
    empid
  });
});

// 9. Submit Leave Request for Employee
app.post('/api/employees/:id/leave', (req, res) => {
  const emp = employeeStore.find(e => e.Empid === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const newLeave = {
    LeaveId: req.body.LeaveId || ('800' + String(Date.now()).slice(-5)),
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
  saveStore(employeeStore);

  res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully',
    data: newLeave
  });
});

// 10. Approve / Reject Leave Request
app.patch('/api/employees/:id/leave/:leaveId', (req, res) => {
  const emp = employeeStore.find(e => e.Empid === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const leave = (emp.Leaves || []).find(l => l.LeaveId === req.params.leaveId);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave request not found' });
  }

  leave.Status = req.body.status || 'APPROVED';
  saveStore(employeeStore);

  res.json({
    success: true,
    message: `Leave ${req.params.leaveId} updated to ${leave.Status}`,
    data: leave
  });
});

// 11. Reset Store back to default baseline
app.post('/api/reset', async (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  } catch (e) {}

  employeeStore = JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES));

  try {
    const liveSapEmployees = await fetchFromSapOData();
    liveSapEmployees.forEach(live => {
      const idx = employeeStore.findIndex(e => e.Empid === live.Empid);
      if (idx !== -1) {
        employeeStore[idx] = {
          ...employeeStore[idx],
          Name: live.Name,
          Email: live.Email,
          Dept: live.Dept || employeeStore[idx].Dept,
          Salary: live.Salary || employeeStore[idx].Salary,
          Status: live.Status || employeeStore[idx].Status
        };
      } else {
        employeeStore.push(live);
      }
    });
  } catch (e) {}

  saveStore(employeeStore);

  res.json({
    success: true,
    message: 'Data reset to default baseline',
    data: employeeStore
  });
});

// 12. SAP Gateway Connectivity Health Check
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

// 13. Direct OData format pass-through endpoint
app.get('/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet', async (req, res) => {
  return res.json({
    d: {
      results: employeeStore.map(emp => ({
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
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SAP BFF API Gateway running on http://localhost:${PORT}`);
  console.log(`🔗 Target SAP Server: ${SAP_BASE_URL}`);
  console.log(`📄 OData Service: ZEMPLOYEE_SRV_SRV`);
  console.log(`💾 Local Persistent Store: ${DATA_FILE}`);
  console.log(`=======================================================`);
});
