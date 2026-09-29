/**
 * SAP NetWeaver Gateway (SEGW) OData V2 Client
 *
 * Service Name: ZEMPLOYEE_SRV
 * Gateway URL : /sap/opu/odata/sap/ZEMPLOYEE_SRV/
 *
 * This client provides CRUD-Q operations and Function Imports for
 * communicating with a classic SAP ABAP system.
 */

// Base endpoint proxied via Vite (vite.config.js) to avoid CORS
const GATEWAY_BASE_URL = '/sap/opu/odata/sap/ZEMPLOYEE_SRV';

let cachedCsrfToken = null;

/**
 * Fetch CSRF Token from SAP Gateway
 * SAP requires an active CSRF token for all POST, PUT, and DELETE requests.
 */
export async function fetchCsrfToken() {
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  try {
    const response = await fetch(`${GATEWAY_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'X-CSRF-Token': 'Fetch',
        'Accept': 'application/json'
      }
    });

    const token = response.headers.get('x-csrf-token');
    if (token) {
      cachedCsrfToken = token;
      return token;
    }
  } catch (err) {
    console.warn('Could not fetch CSRF token from SAP Gateway:', err.message);
  }

  return null;
}

/**
 * Helper to build request headers with CSRF and JSON formatting
 */
async function buildHeaders(requireCsrf = false) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (requireCsrf) {
    const token = await fetchCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  return headers;
}

/**
 * 1. Read All Employees (GET /EmployeeSet?$format=json)
 */
export async function getEmployeesFromGateway() {
  const headers = await buildHeaders();
  const response = await fetch(`${GATEWAY_BASE_URL}/EmployeeSet?$format=json`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`SAP Gateway error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawEmployees = data.d ? data.d.results : [];

  // Map SAP Gateway properties to frontend structure
  return rawEmployees.map(emp => ({
    id: emp.Empid,
    firstName: emp.FirstName,
    lastName: emp.LastName,
    email: emp.Email,
    department: emp.Department,
    role: emp.Designation,
    salary: parseFloat(emp.Salary) || 0,
    currency: emp.Currency || 'USD',
    status: emp.Status || 'ACTIVE',
    hireDate: emp.HireDate ? new Date(parseInt(emp.HireDate.replace(/\/Date\((\d+)\)\//, '$1'))).toISOString().split('T')[0] : '2022-01-01',
    leaves: []
  }));
}

/**
 * 2. Read All Leaves (GET /LeaveRequestSet?$format=json)
 */
export async function getLeavesFromGateway() {
  const headers = await buildHeaders();
  const response = await fetch(`${GATEWAY_BASE_URL}/LeaveRequestSet?$format=json`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`SAP Gateway error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawLeaves = data.d ? data.d.results : [];

  return rawLeaves.map(leave => ({
    id: leave.LeaveId,
    empid: leave.Empid,
    type: leave.LeaveType,
    startDate: leave.StartDate ? new Date(parseInt(leave.StartDate.replace(/\/Date\((\d+)\)\//, '$1'))).toISOString().split('T')[0] : '',
    endDate: leave.EndDate ? new Date(parseInt(leave.EndDate.replace(/\/Date\((\d+)\)\//, '$1'))).toISOString().split('T')[0] : '',
    days: leave.DaysCount || 1,
    reason: leave.Reason,
    status: leave.Status || 'PENDING'
  }));
}

/**
 * 3. Create Employee (POST /EmployeeSet)
 */
export async function createEmployeeInGateway(employee) {
  const headers = await buildHeaders(true);
  const payload = {
    Empid: employee.id || String(Math.floor(100000 + Math.random() * 900000)),
    FirstName: employee.firstName,
    LastName: employee.lastName,
    Email: employee.email,
    Department: employee.department,
    Designation: employee.role,
    Salary: String(employee.salary),
    Currency: employee.currency || 'USD',
    Status: employee.status || 'ACTIVE'
  };

  const response = await fetch(`${GATEWAY_BASE_URL}/EmployeeSet`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create employee in SAP: ${response.status}`);
  }

  return response.json();
}

/**
 * 4. Execute Function Import: GiveRaise
 * POST /sap/opu/odata/sap/ZEMPLOYEE_SRV/GiveRaise?Empid='100101'&PercentageRaise=10
 */
export async function giveRaiseInGateway(empid, percentageRaise) {
  const headers = await buildHeaders(true);
  const url = `${GATEWAY_BASE_URL}/GiveRaise?Empid='${empid}'&PercentageRaise=${percentageRaise}M`;

  const response = await fetch(url, {
    method: 'POST',
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to execute GiveRaise in SAP Gateway: ${response.status}`);
  }

  return response.json();
}

/**
 * 5. Execute Function Import: ApproveLeave
 * POST /sap/opu/odata/sap/ZEMPLOYEE_SRV/ApproveLeave?LeaveId='L-201'&Empid='100101'
 */
export async function approveLeaveInGateway(leaveId, empid) {
  const headers = await buildHeaders(true);
  const url = `${GATEWAY_BASE_URL}/ApproveLeave?LeaveId='${leaveId}'&Empid='${empid}'`;

  const response = await fetch(url, {
    method: 'POST',
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to approve leave in SAP Gateway: ${response.status}`);
  }

  return response.json();
}
