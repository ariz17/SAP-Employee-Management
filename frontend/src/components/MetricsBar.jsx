import React from 'react';
import { Users, UserCheck, CalendarOff, DollarSign, TrendingUp } from 'lucide-react';

export function MetricsBar({ employees }) {
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.Status === 'ACTIVE').length;
  const onLeaveCount = employees.filter(e => e.Status === 'ON_LEAVE').length;

  const totalPayroll = employees.reduce((sum, e) => sum + (parseFloat(e.Salary) || 0), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  // Pending leaves across all employees
  const pendingLeaves = employees.reduce((acc, emp) => {
    return acc + (emp.Leaves ? emp.Leaves.filter(l => l.Status === 'PENDING').length : 0);
  }, 0);

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
          <Users size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Total Headcount</span>
          <span className="metric-value">{totalEmployees}</span>
          <span className="metric-subtext">Active SAP Master Records</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
          <UserCheck size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Active Workforce</span>
          <span className="metric-value">{activeCount}</span>
          <span className="metric-subtext">{totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0}% Active Rate</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
          <CalendarOff size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">On Leave</span>
          <span className="metric-value">{onLeaveCount}</span>
          <span className="metric-subtext">{pendingLeaves} Pending Approval</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
          <DollarSign size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Annual Payroll</span>
          <span className="metric-value">₹{(totalPayroll / 100000).toFixed(1)}L</span>
          <span className="metric-subtext">Avg: ₹{avgSalary.toLocaleString('en-IN')}/yr</span>
        </div>
      </div>
    </div>
  );
}
