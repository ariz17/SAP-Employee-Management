import React, { useState, useEffect } from 'react';
import { INITIAL_EMPLOYEES } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { LeaveRequestsView } from './components/LeaveRequestsView';
import { SelfServiceView } from './components/SelfServiceView';
import { AnalyticsView } from './components/AnalyticsView';
import { ArchitectureView } from './components/ArchitectureView';
import { LoginScreen } from './components/LoginScreen';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { GiveRaiseModal } from './components/GiveRaiseModal';
import { LeaveManagementModal } from './components/LeaveManagementModal';
import { getStoredJwtToken, saveJwtToken, removeJwtToken, decodeJwtToken } from './utils/jwtAuth';

export function App() {
  // Theme state: 'light' | 'dark' (defaulting to light as shown in user's screenshots)
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('sap_app_theme');
      return savedTheme || 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sap_app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Authentication session state based on JWT
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = getStoredJwtToken();
      if (token) {
        const decoded = decodeJwtToken(token);
        if (decoded) {
          return { ...decoded, token };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Active section tab: 'dashboard' | 'employees' | 'leaves' | 'self_service' | 'analytics' | 'architecture'
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Load persisted state or fallback to seed data with IT industry departments
  const [employees, setEmployees] = useState(() => {
    try {
      const legacyV2 = localStorage.getItem('sap_workforce_employees_v2');
      if (legacyV2 && (legacyV2.includes('Engineering') || legacyV2.includes('Finance') || legacyV2.includes('Product'))) {
        localStorage.removeItem('sap_workforce_employees_v2');
        localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(INITIAL_EMPLOYEES));
        return INITIAL_EMPLOYEES;
      }

      const saved = localStorage.getItem('sap_workforce_employees_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedForRaise, setSelectedForRaise] = useState(null);
  const [selectedForLeaves, setSelectedForLeaves] = useState(null);

  // Active employee for self-service preview
  const [simulatedEmpId, setSimulatedEmpId] = useState('100101');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(employees));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [employees]);

  // -----------------------------------------------------------------------
  // Fetch LIVE data from SAP Gateway OData Service (ZEMPLOYEE_SRV_SRV)
  // Replace YOUR_SAP_USER and YOUR_SAP_PASSWORD with your SAP login credentials
  // -----------------------------------------------------------------------
  useEffect(() => {
    async function loadEmployees() {
      const backendBase = import.meta.env.VITE_BACKEND_URL || '';
      try {
        // 1. Try calling the Node.js BFF / API Gateway (Render or localhost)
        const response = await fetch(`${backendBase}/api/employees`);
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            setEmployees(resData.data);
            console.log(`✅ Loaded ${resData.data.length} employees (Source: ${resData.source})!`);
            return;
          }
        }
      } catch (backendErr) {
        console.warn('Backend API not reachable, attempting direct SAP Gateway fallback...', backendErr.message);
      }

      // 2. Direct SAP Gateway call (if Vite proxy is running locally)
      try {
        const SAP_USER = 'GLBI-100';
        const SAP_PASSWORD = 'Bt@123';
        const response = await fetch(
          '/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet?$format=json',
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Basic ' + btoa(`${SAP_USER}:${SAP_PASSWORD}`)
            }
          }
        );

        if (!response.ok) throw new Error(`SAP returned HTTP ${response.status}`);

        const data = await response.json();
        const results = data?.d?.results;

        if (Array.isArray(results) && results.length > 0) {
          const sapEmployees = results.map((emp, idx) => ({
            Empid: emp.EMPID || String(100101 + idx),
            Name: emp.NAME || `Employee ${idx + 1}`,
            Email: emp.EMAIL || `employee${idx + 1}@acme.com`,
            Dept: emp.DEPT || 'General',
            Salary: parseFloat(emp.SALARY) || 0,
            Status: emp.STATUS || 'ACTIVE',
            Joindate: '2022-01-01',
            Leaves: []
          }));
          setEmployees(sapEmployees);
          console.log(`✅ Loaded ${sapEmployees.length} employees directly from SAP Gateway!`);
        }
      } catch (err) {
        console.warn('⚠️ SAP Gateway not reachable, using mock data:', err.message);
      }
    }

    loadEmployees();
  }, []); // runs once when the app opens


  // Handle Login via JWT
  const handleLogin = ({ token, user }) => {
    saveJwtToken(token);
    setCurrentUser({ ...user, token });
    if (user.role === 'employee') {
      setCurrentTab('self_service');
      setSimulatedEmpId(user.empid || '100101');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    removeJwtToken();
    setCurrentUser(null);
  };

  // Handler: Add Employee (RAP Create)
  const handleAddEmployee = (newEmpData) => {
    const newId = (100100 + employees.length + 1).toString();
    const created = {
      Empid: newId,
      ...newEmpData,
      Leaves: []
    };
    setEmployees([created, ...employees]);
  };

  // Handler: RAP Action giveRaise
  const handleApplyRaise = (empid, percentage, reason) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.Empid === empid) {
        const currentSalary = parseFloat(emp.Salary) || 0;
        const updatedSalary = Math.round(currentSalary * (1 + (percentage / 100)));
        return {
          ...emp,
          Salary: updatedSalary
        };
      }
      return emp;
    }));
  };

  // Handler: RAP Action changeStatus (Cycles ACTIVE -> ON_LEAVE -> INACTIVE)
  const handleToggleStatus = (empid) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.Empid === empid) {
        let nextStatus = 'ACTIVE';
        if (emp.Status === 'ACTIVE') nextStatus = 'ON_LEAVE';
        else if (emp.Status === 'ON_LEAVE') nextStatus = 'INACTIVE';
        else nextStatus = 'ACTIVE';
        return { ...emp, Status: nextStatus };
      }
      return emp;
    }));
  };

  // Handler: Delete Employee
  const handleDeleteEmployee = (empid) => {
    if (confirm(`Confirm deletion of employee record ${empid}?`)) {
      setEmployees(prev => prev.filter(e => e.Empid !== empid));
    }
  };

  // Handler: RAP Action approveLeave (Accept)
  const handleApproveLeave = (empid, leaveId) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.Empid === empid) {
        const updatedLeaves = (emp.Leaves || []).map(leave => {
          if (leave.LeaveId === leaveId) {
            return { ...leave, Status: 'APPROVED' };
          }
          return leave;
        });
        return { ...emp, Leaves: updatedLeaves };
      }
      return emp;
    }));

    if (selectedForLeaves && selectedForLeaves.Empid === empid) {
      setSelectedForLeaves(prev => ({
        ...prev,
        Leaves: prev.Leaves.map(l => l.LeaveId === leaveId ? { ...l, Status: 'APPROVED' } : l)
      }));
    }
  };

  // Handler: RAP Action rejectLeave (Reject)
  const handleRejectLeave = (empid, leaveId) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.Empid === empid) {
        const updatedLeaves = (emp.Leaves || []).map(leave => {
          if (leave.LeaveId === leaveId) {
            return { ...leave, Status: 'REJECTED' };
          }
          return leave;
        });
        return { ...emp, Leaves: updatedLeaves };
      }
      return emp;
    }));

    if (selectedForLeaves && selectedForLeaves.Empid === empid) {
      setSelectedForLeaves(prev => ({
        ...prev,
        Leaves: prev.Leaves.map(l => l.LeaveId === leaveId ? { ...l, Status: 'REJECTED' } : l)
      }));
    }
  };

  // Handler: Add Leave Request (Composition child create)
  const handleAddLeave = (empid, leaveData) => {
    const newLeaveId = (80010000 + Math.floor(Math.random() * 9000)).toString();
    const newLeave = {
      LeaveId: newLeaveId,
      Empid: empid,
      ...leaveData
    };

    setEmployees(prev => prev.map(emp => {
      if (emp.Empid === empid) {
        return {
          ...emp,
          Leaves: [newLeave, ...(emp.Leaves || [])]
        };
      }
      return emp;
    }));

    if (selectedForLeaves && selectedForLeaves.Empid === empid) {
      setSelectedForLeaves(prev => ({
        ...prev,
        Leaves: [newLeave, ...(prev.Leaves || [])]
      }));
    }
  };

  // Reset to initial sample data
  const handleResetData = () => {
    if (confirm("Reset to default SAP sample employees with IT departments?")) {
      setEmployees(INITIAL_EMPLOYEES);
      localStorage.removeItem('sap_workforce_employees');
      localStorage.removeItem('sap_workforce_employees_v2');
      localStorage.removeItem('sap_workforce_employees_v3');
    }
  };

  // Pending leaves count for sidebar badge
  const pendingLeavesCount = employees.reduce((acc, emp) => {
    return acc + (emp.Leaves ? emp.Leaves.filter(l => l.Status === 'PENDING').length : 0);
  }, 0);

  // Active Employee Record for Self-Service
  const activeEmpRecord = employees.find(e => e.Empid === (currentUser?.role === 'employee' ? currentUser.empid : simulatedEmpId)) || employees[0];

  // If not logged in, render the clean split-card LoginScreen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} employees={employees} />;
  }

  return (
    <div className="portal-app-layout">
      {/* Left Sidebar (Matches Screenshot) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingLeavesCount={pendingLeavesCount}
        onOpenHelp={() => setCurrentTab('architecture')}
      />

      {/* Main Workspace Column */}
      <div className="portal-main-area">
        {/* Top Navbar with Dynamic Title, Light/Dark toggle, User Profile */}
        <TopNavbar
          currentTab={currentTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Tab Views */}
        <main className="portal-page-body">
          {currentTab === 'dashboard' && (
            <DashboardView
              employees={employees}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesView
              employees={employees}
              onOpenAddModal={() => setIsAddOpen(true)}
              onOpenRaiseModal={setSelectedForRaise}
              onOpenLeavesModal={setSelectedForLeaves}
              onToggleStatus={handleToggleStatus}
              onDeleteEmployee={handleDeleteEmployee}
              onResetData={handleResetData}
            />
          )}

          {currentTab === 'leaves' && (
            <LeaveRequestsView
              employees={employees}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {currentTab === 'self_service' && (
            <SelfServiceView
              currentEmployee={activeEmpRecord}
              employees={employees}
              onApplyLeave={handleAddLeave}
              onSwitchEmployee={setSimulatedEmpId}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView employees={employees} />
          )}

          {currentTab === 'architecture' && (
            <ArchitectureView />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <GiveRaiseModal
        isOpen={!!selectedForRaise}
        employee={selectedForRaise}
        onClose={() => setSelectedForRaise(null)}
        onApplyRaise={handleApplyRaise}
      />

      <LeaveManagementModal
        isOpen={!!selectedForLeaves}
        employee={selectedForLeaves}
        onClose={() => setSelectedForLeaves(null)}
        onApproveLeave={handleApproveLeave}
        onRejectLeave={handleRejectLeave}
        onAddLeave={handleAddLeave}
      />
    </div>
  );
}
