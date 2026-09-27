import React from 'react';
import { Users, UserCheck, Clock, CheckCircle2, XCircle, Building2, ArrowRight } from 'lucide-react';
import { WorkforceCharts } from './WorkforceCharts';

export function DashboardView({ 
  employees = [], 
  onNavigate 
}) {
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.Status === 'ACTIVE').length;
  const onLeaveCount = employees.filter(e => e.Status === 'ON_LEAVE').length;

  let pendingLeaves = 0;
  let approvedLeaves = 0;
  let rejectedLeaves = 0;

  const recentLeavesList = [];

  employees.forEach(emp => {
    (emp.Leaves || []).forEach(l => {
      if (l.Status === 'PENDING') pendingLeaves++;
      else if (l.Status === 'APPROVED') approvedLeaves++;
      else if (l.Status === 'REJECTED') rejectedLeaves++;

      recentLeavesList.push({
        ...l,
        empName: emp.Name,
        empDept: emp.Dept
      });
    });
  });

  // Unique departments with at least 1 employee
  const activeDepts = new Set(employees.map(e => e.Dept)).size;

  return (
    <div className="view-content-wrapper">
      {/* SECTION 1: Top Metrics Grid (Matches Screenshot 1) */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Employees</span>
          <div className="stat-number">{totalEmployees}</div>
          <span className="stat-helper">Master records</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Workforce</span>
          <div className="stat-number">{activeCount}</div>
          <span className="stat-helper">{totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0}% Active rate</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Pending Requests</span>
          <div className="stat-number" style={{ color: pendingLeaves > 0 ? '#f59e0b' : undefined }}>
            {pendingLeaves}
          </div>
          <span className="stat-helper">Awaiting processing</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">IT Departments</span>
          <div className="stat-number">{activeDepts}</div>
          <span className="stat-helper">Active service lines</span>
        </div>
      </div>

      {/* SECTION 2: Request Statistics (Matches Screenshot 1) */}
      <div className="section-block">
        <div className="section-header">
          <h2 className="section-title">Request Statistics</h2>
          <p className="section-subtitle">Current leave request status</p>
        </div>

        <div className="stats-row-3">
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <div className="stat-number" style={{ color: '#f59e0b' }}>{pendingLeaves}</div>
            <span className="stat-helper">Awaiting processing</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Approved</span>
            <div className="stat-number" style={{ color: '#10b981' }}>{approvedLeaves}</div>
            <span className="stat-helper">Approved requests</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Rejected</span>
            <div className="stat-number" style={{ color: '#f43f5e' }}>{rejectedLeaves}</div>
            <span className="stat-helper">Declined requests</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Visual Graphs & Charts */}
      <div className="section-block">
        <div className="section-header">
          <h2 className="section-title">Workforce & Service Line Analytics</h2>
          <p className="section-subtitle">Visual headcount distribution and leave processing trends</p>
        </div>

        <WorkforceCharts employees={employees} />
      </div>

      {/* SECTION 4: Quick Overview of Recent Requests */}
      <div className="section-block">
        <div className="section-header-action">
          <div>
            <h2 className="section-title">Recent Leave Submissions</h2>
            <p className="section-subtitle">Latest leave requests processed through SAP RAP</p>
          </div>
          <button 
            type="button" 
            className="btn-action-text"
            onClick={() => onNavigate('leaves')}
          >
            <span>View All Leave Requests</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container-card">
          <table className="clean-table">
            <thead>
              <tr>
                <th>LEAVE ID</th>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>TYPE</th>
                <th>DATES</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentLeavesList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center-muted">No leave requests found.</td>
                </tr>
              ) : (
                recentLeavesList.slice(0, 4).map(l => (
                  <tr key={l.LeaveId}>
                    <td><span className="id-badge">{l.LeaveId}</span></td>
                    <td className="font-semibold">{l.empName}</td>
                    <td><span className="dept-pill">{l.empDept}</span></td>
                    <td>{l.LeaveType}</td>
                    <td className="text-muted-sm">{l.StartDate} ➔ {l.EndDate} ({l.DaysCount}d)</td>
                    <td>
                      {l.Status === 'APPROVED' && <span className="status-badge status-approved">Approved</span>}
                      {l.Status === 'PENDING' && <span className="status-badge status-pending">Pending</span>}
                      {l.Status === 'REJECTED' && <span className="status-badge status-rejected">Rejected</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
