import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, RefreshCw, TrendingUp, Calendar, Trash2, RotateCw
} from 'lucide-react';
import { DEPARTMENTS } from '../data/mockData';

export function EmployeesView({ 
  employees = [], 
  onOpenAddModal, 
  onOpenRaiseModal, 
  onOpenLeavesModal, 
  onToggleStatus, 
  onDeleteEmployee,
  onResetData 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        emp.Name.toLowerCase().includes(q) ||
        emp.Empid.includes(q) ||
        emp.Email.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.Dept === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || emp.Status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus]);

  return (
    <div className="view-content-wrapper">
      {/* Top Header Row with Action Button (Matching Screenshot 2) */}
      <div className="view-header-row">
        <div>
          <h2 className="view-page-title">Employees</h2>
          <p className="view-page-subtitle">Manage employee master records registered in the SAP RAP system.</p>
        </div>

        <button 
          type="button" 
          className="btn-primary-action"
          onClick={onOpenAddModal}
        >
          <Plus size={16} />
          <span>Register Employee</span>
        </button>
      </div>

      {/* Mini KPI Card (Matching Screenshot 2) */}
      <div className="mini-stat-card-row">
        <div className="mini-stat-card">
          <div className="mini-stat-icon-wrap">
            👥
          </div>
          <div>
            <div className="mini-stat-label">Total Employees</div>
            <div className="mini-stat-number">{employees.length}</div>
          </div>
        </div>
      </div>

      {/* Main Table Card (Matching Screenshot 2) */}
      <div className="table-container-card">
        {/* Table Title Bar */}
        <div className="table-card-topbar">
          <div>
            <h3 className="table-card-title">Registered Employees</h3>
            <p className="table-card-subtitle">Employees currently registered in the system.</p>
          </div>
          <button 
            type="button" 
            className="btn-refresh-data"
            onClick={onResetData}
            title="Reset to default SAP demo records"
          >
            <RefreshCw size={14} />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="table-filter-bar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clean-search-input"
            />
          </div>

          <div className="filter-dropdowns-wrap">
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="clean-select"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="clean-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Matching Screenshot 2 (#, Emp ID, Name, Dept, Salary, Join Date, Actions) */}
        <div className="table-scroll-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>EMPLOYEE ID</th>
                <th>EMPLOYEE NAME</th>
                <th>DEPARTMENT</th>
                <th>SALARY</th>
                <th>JOIN DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center-muted" style={{ padding: '36px' }}>
                    No employee records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const initial = emp.Name.charAt(0).toUpperCase();
                  const pendingCount = (emp.Leaves || []).filter(l => l.Status === 'PENDING').length;
                  return (
                    <tr key={emp.Empid}>
                      <td className="text-muted-sm">{index + 1}</td>
                      <td>
                        <span className="id-badge">{emp.Empid}</span>
                      </td>
                      <td>
                        <div className="emp-cell">
                          <span className="avatar-initial">{initial}</span>
                          <div>
                            <div className="emp-name-text">{emp.Name}</div>
                            <div className="emp-email-text">{emp.Email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dept-pill">{emp.Dept}</span>
                      </td>
                      <td className="salary-text">
                        ₹{(parseFloat(emp.Salary) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="text-muted-sm">
                        {emp.Joindate}
                      </td>
                      <td>
                        {emp.Status === 'ACTIVE' && <span className="status-badge status-approved">ACTIVE</span>}
                        {emp.Status === 'ON_LEAVE' && <span className="status-badge status-pending">ON LEAVE</span>}
                        {emp.Status === 'INACTIVE' && <span className="status-badge status-rejected">INACTIVE</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group">
                          {/* Leaves view */}
                          <button
                            type="button"
                            className="btn-action-view"
                            onClick={() => onOpenLeavesModal(emp)}
                            title="Manage Leaves"
                          >
                            <span>Leaves</span>
                            {pendingCount > 0 && <span className="action-pill-alert">!</span>}
                          </button>

                          {/* Raise (Yellow button like 'Update' in screenshot 2) */}
                          <button
                            type="button"
                            className="btn-action-update"
                            onClick={() => onOpenRaiseModal(emp)}
                            title="Execute RAP Action giveRaise"
                          >
                            <span>Raise</span>
                          </button>

                          {/* Toggle Status */}
                          <button
                            type="button"
                            className="btn-action-neutral"
                            onClick={() => onToggleStatus(emp.Empid)}
                            title="Cycle Status (Active / On Leave / Inactive)"
                          >
                            <span>Status</span>
                          </button>

                          {/* Delete (Red button like 'Delete' in screenshot 2) */}
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => onDeleteEmployee(emp.Empid)}
                            title="Delete Employee Record"
                          >
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
