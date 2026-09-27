import React from 'react';
import { WorkforceCharts } from './WorkforceCharts';
import { DEPARTMENTS } from '../data/mockData';

export function AnalyticsView({ employees = [] }) {
  const totalEmployees = employees.length;
  const totalPayroll = employees.reduce((sum, e) => sum + (parseFloat(e.Salary) || 0), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  let totalLeaves = 0;
  let approvedLeaves = 0;
  employees.forEach(emp => {
    (emp.Leaves || []).forEach(l => {
      totalLeaves++;
      if (l.Status === 'APPROVED') approvedLeaves++;
    });
  });

  const approvalRate = totalLeaves > 0 ? Math.round((approvedLeaves / totalLeaves) * 100) : 100;

  return (
    <div className="view-content-wrapper">
      {/* Overview Stat Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Payroll</span>
          <div className="stat-number">₹{(totalPayroll / 100000).toFixed(1)}L</div>
          <span className="stat-helper">Annual enterprise payroll</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Average Annual Salary</span>
          <div className="stat-number">₹{(avgSalary / 100000).toFixed(1)}L</div>
          <span className="stat-helper">Per staff member</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Leave Approval Rate</span>
          <div className="stat-number" style={{ color: '#10b981' }}>{approvalRate}%</div>
          <span className="stat-helper">{approvedLeaves} of {totalLeaves} requests approved</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Service Lines</span>
          <div className="stat-number">{DEPARTMENTS.length}</div>
          <span className="stat-helper">Configured IT departments</span>
        </div>
      </div>

      {/* Graphs */}
      <div className="section-block">
        <WorkforceCharts employees={employees} />
      </div>

      {/* Department Breakdown Table */}
      <div className="table-container-card">
        <div className="table-card-topbar">
          <div>
            <h3 className="table-card-title">Department Service Line Analysis</h3>
            <p className="table-card-subtitle">Headcount and compensation across IT business units.</p>
          </div>
        </div>

        <div className="table-scroll-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>DEPARTMENT</th>
                <th>HEADCOUNT</th>
                <th>ACTIVE RATE</th>
                <th>TOTAL PAYROLL</th>
                <th>AVERAGE CTC</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map(dept => {
                const deptStaff = employees.filter(e => e.Dept === dept);
                const count = deptStaff.length;
                const active = deptStaff.filter(e => e.Status === 'ACTIVE').length;
                const payroll = deptStaff.reduce((s, e) => s + (parseFloat(e.Salary) || 0), 0);
                const avg = count > 0 ? Math.round(payroll / count) : 0;
                return (
                  <tr key={dept}>
                    <td><span className="dept-pill">{dept}</span></td>
                    <td><strong>{count}</strong> members</td>
                    <td>{count > 0 ? Math.round((active / count) * 100) : 0}% Active</td>
                    <td className="salary-text">₹{payroll.toLocaleString('en-IN')}</td>
                    <td className="salary-text">₹{avg.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
