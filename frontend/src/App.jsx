import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Plus, TrendingUp, RefreshCw, Calendar, 
  Trash2, Award, Building2, User, Eye, ArrowLeft
} from 'lucide-react';
import { INITIAL_EMPLOYEES, DEPARTMENTS } from './data/mockData';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { GiveRaiseModal } from './components/GiveRaiseModal';
import { LeaveManagementModal } from './components/LeaveManagementModal';
import { LoginScreen } from './components/LoginScreen';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AdminLeaveDesk } from './components/AdminLeaveDesk';
import { getStoredJwtToken, saveJwtToken, removeJwtToken, decodeJwtToken } from './utils/jwtAuth';

export function App() {
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

  // Admin section: 'workforce' | 'leaves' | 'preview_employee'
  const [adminSection, setAdminSection] = useState('workforce');
  const [previewEmpId, setPreviewEmpId] = useState('100101');

  // Load persisted state or fallback to seed data
  const [employees, setEmployees] = useState(() => {
    try {
      // Clear legacy storage if old names detected in browser cache
      const legacy = localStorage.getItem('sap_workforce_employees');
      if (legacy && (legacy.includes('Sarah Jenkins') || legacy.includes('Marcus Vance') || legacy.includes('Elena Rostova') || legacy.includes('Devon Chen'))) {
        localStorage.removeItem('sap_workforce_employees');
        localStorage.setItem('sap_workforce_employees_v2', JSON.stringify(INITIAL_EMPLOYEES));
        return INITIAL_EMPLOYEES;
      }

      const saved = localStorage.getItem('sap_workforce_employees_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  // Filters & Search for Admin table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedForRaise, setSelectedForRaise] = useState(null);
  const [selectedForLeaves, setSelectedForLeaves] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sap_workforce_employees_v2', JSON.stringify(employees));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [employees]);

  // Handle Login via JWT
  const handleLogin = ({ token, user }) => {
    saveJwtToken(token);
    setCurrentUser({ ...user, token });
    setAdminSection('workforce');
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
    if (confirm("Reset to default SAP sample employees?")) {
      setEmployees(INITIAL_EMPLOYEES);
      localStorage.removeItem('sap_workforce_employees');
      localStorage.removeItem('sap_workforce_employees_v2');
    }
  };

  // Filtered employees list for Admin
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.Empid.includes(searchTerm) ||
        emp.Email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || emp.Dept === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || emp.Status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus]);

  // If not authenticated, render LoginScreen with JWT issuing
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} employees={employees} />;
  }

  // Active Employee Record for Employee view
  const activeEmpId = currentUser.role === 'employee' ? currentUser.empid : previewEmpId;
  const currentEmployeeRecord = employees.find(e => e.Empid === activeEmpId) || employees[0];

  return (
    <div className="app-container">
      {/* Header with Role Badge, Token Inspection & Nav */}
      <Header 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAddEmployee={() => setIsAddOpen(true)}
        adminSection={adminSection}
        onAdminSectionChange={setAdminSection}
      />

      {/* =========================================================================
          SECTION 1: EMPLOYEE DASHBOARD (Role: Employee OR Admin Preview)
          ========================================================================= */}
      {currentUser.role === 'employee' || adminSection === 'preview_employee' ? (
        <div>
          {currentUser.role === 'admin' && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#38bdf8' }}>
                <Eye size={16} />
                <span><strong>Admin Perspective Mode:</strong> Previewing Employee Self-Service Dashboard</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select 
                  value={previewEmpId} 
                  onChange={(e) => setPreviewEmpId(e.target.value)}
                  className="select-dropdown"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  {employees.map(e => (
                    <option key={e.Empid} value={e.Empid}>
                      {e.Empid} - {e.Name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setAdminSection('workforce')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ArrowLeft size={13} />
                  <span>Return to Admin</span>
                </button>
              </div>
            </div>
          )}

          <EmployeeDashboard 
            currentEmployee={currentEmployeeRecord}
            employees={employees}
            onApplyLeave={handleAddLeave}
          />
        </div>
      ) : (
        /* =========================================================================
           SECTION 2: ADMIN DASHBOARDS (Role: Admin)
           ========================================================================= */
        <div>
          {/* Sub-section A: Centralized Leave Approvals & Rejections Desk */}
          {adminSection === 'leaves' && (
            <AdminLeaveDesk 
              employees={employees}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {/* Sub-section B: Workforce Master Data Records */}
          {adminSection === 'workforce' && (
            <div>
              {/* KPI Stats Bar */}
              <MetricsBar employees={employees} />

              {/* Filter and Action Toolbar */}
              <div className="control-toolbar">
                <div className="filter-group">
                  <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input 
                      id="search-input"
                      type="text" 
                      placeholder="Search by name, ID, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select 
                    id="dept-filter"
                    className="select-dropdown"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="ALL">All Departments</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select 
                    id="status-filter"
                    className="select-dropdown"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAdminSection('preview_employee')}
                    title="Preview Employee Self-Service Dashboard"
                  >
                    <Eye size={14} />
                    <span>Employee View</span>
                  </button>

                  <button 
                    id="btn-reset-data"
                    className="btn btn-secondary btn-sm" 
                    onClick={handleResetData}
                    title="Reset to default seed records"
                  >
                    <RefreshCw size={14} />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </div>

              {/* Employee Master Table (ZC_EMPLOYEE_DETAILS) */}
              <div className="table-card">
                <div className="table-header-title">
                  <h2>
                    <Building2 size={18} style={{ color: 'var(--sap-blue-light)' }} />
                    <span>Workforce Records (<code>ZC_EMPLOYEE_DETAILS</code>)</span>
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Showing {filteredEmployees.length} of {employees.length} records
                  </span>
                </div>

                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Base Salary</th>
                        <th>Join Date</th>
                        <th>Status</th>
                        <th>Leave History</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No employee records match the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((emp) => (
                          <tr key={emp.Empid}>
                            <td>
                              <span className="empid-tag">{emp.Empid}</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{emp.Name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.Email}</div>
                            </td>
                            <td>
                              <span className="badge badge-dept">{emp.Dept}</span>
                            </td>
                            <td>
                              <span className="salary-tag">₹{(parseFloat(emp.Salary) || 0).toLocaleString('en-IN')}</span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              {emp.Joindate}
                            </td>
                            <td>
                              <span className={`badge ${
                                emp.Status === 'ACTIVE' ? 'badge-active' :
                                emp.Status === 'ON_LEAVE' ? 'badge-leave' : 'badge-inactive'
                              }`}>
                                {emp.Status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => setSelectedForLeaves(emp)}
                                title="Manage employee leaves (Approve / Reject)"
                              >
                                <Calendar size={13} style={{ color: '#8b5cf6' }} />
                                <span>
                                  {emp.Leaves ? emp.Leaves.length : 0} Leaves
                                  {emp.Leaves && emp.Leaves.some(l => l.Status === 'PENDING') && (
                                    <span style={{ 
                                      marginLeft: '4px', 
                                      background: '#f59e0b', 
                                      color: 'black', 
                                      borderRadius: '50%', 
                                      padding: '1px 5px', 
                                      fontSize: '0.68rem', 
                                      fontWeight: 700 
                                    }}>!</span>
                                  )}
                                </span>
                              </button>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                {/* Custom Action giveRaise */}
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => setSelectedForRaise(emp)}
                                  title="Execute RAP Action giveRaise"
                                >
                                  <TrendingUp size={13} />
                                  <span>Raise</span>
                                </button>

                                {/* Custom Action changeStatus */}
                                <button 
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleToggleStatus(emp.Empid)}
                                  title="Cycle Status (ACTIVE -> ON_LEAVE -> INACTIVE)"
                                >
                                  <span>Toggle Status</span>
                                </button>

                                {/* Delete */}
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteEmployee(emp.Empid)}
                                  title="Delete Employee Record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Modals */}
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
