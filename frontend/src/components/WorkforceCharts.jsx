import React from 'react';
import { DEPARTMENTS } from '../data/mockData';

export function WorkforceCharts({ employees = [] }) {
  // Compute counts per department
  const deptCounts = DEPARTMENTS.map(dept => {
    const count = employees.filter(e => e.Dept === dept).length;
    return { dept, count };
  });

  const maxDeptCount = Math.max(...deptCounts.map(d => d.count), 1);

  // Compute leave stats
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  employees.forEach(emp => {
    (emp.Leaves || []).forEach(l => {
      if (l.Status === 'PENDING') pendingCount++;
      else if (l.Status === 'APPROVED') approvedCount++;
      else if (l.Status === 'REJECTED') rejectedCount++;
    });
  });

  const totalLeaves = pendingCount + approvedCount + rejectedCount;

  // Department colors (IT industry thematic colors)
  const deptColors = {
    "IT Consulting": "#0a6ed1",
    "Cloud & Infrastructure": "#0284c7",
    "Software Engineering": "#6366f1",
    "Cybersecurity": "#f59e0b",
    "Data & AI Analytics": "#10b981",
    "Quality Assurance & Testing": "#ec4899"
  };

  return (
    <div className="charts-grid">
      {/* Chart 1: Department Distribution Bar Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Department Distribution</h3>
            <p className="chart-subtitle">Headcount breakdown across IT service lines</p>
          </div>
          <span className="chart-badge">{employees.length} Staff Total</span>
        </div>

        <div className="bar-chart-container">
          {deptCounts.map(({ dept, count }) => {
            const pct = Math.round((count / maxDeptCount) * 100);
            const color = deptColors[dept] || 'var(--primary-color)';
            return (
              <div key={dept} className="bar-chart-row">
                <div className="bar-label-group">
                  <span className="bar-dept-name" title={dept}>{dept}</span>
                  <span className="bar-count-badge">{count}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${count > 0 ? Math.max(pct, 12) : 0}%`,
                      backgroundColor: color 
                    }}
                  >
                    {count > 0 && <span className="bar-fill-text">{count} emp</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Leave Processing Status Overview */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Leave Request Status</h3>
            <p className="chart-subtitle">RAP workflow decision distribution</p>
          </div>
          <span className="chart-badge">{totalLeaves} Requests</span>
        </div>

        <div className="donut-chart-container">
          {totalLeaves === 0 ? (
            <div className="empty-chart-text">No leave requests recorded yet</div>
          ) : (
            <>
              {/* Circular Graphic */}
              <div className="donut-circle-wrap">
                <svg viewBox="0 0 36 36" className="donut-svg">
                  {/* Background Circle */}
                  <path
                    className="donut-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Approved segment (Green) */}
                  <path
                    className="donut-segment segment-approved"
                    strokeDasharray={`${(approvedCount / totalLeaves) * 100}, 100`}
                    strokeDashoffset="25"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Pending segment (Amber) */}
                  <path
                    className="donut-segment segment-pending"
                    strokeDasharray={`${(pendingCount / totalLeaves) * 100}, 100`}
                    strokeDashoffset={`${25 - ((approvedCount / totalLeaves) * 100)}`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Rejected segment (Rose) */}
                  <path
                    className="donut-segment segment-rejected"
                    strokeDasharray={`${(rejectedCount / totalLeaves) * 100}, 100`}
                    strokeDashoffset={`${25 - (((approvedCount + pendingCount) / totalLeaves) * 100)}`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="donut-center-text">
                  <span className="donut-center-val">{totalLeaves}</span>
                  <span className="donut-center-sub">Total</span>
                </div>
              </div>

              {/* Legend with exact stats */}
              <div className="donut-legend">
                <div className="legend-row">
                  <div className="legend-left">
                    <span className="legend-dot dot-approved"></span>
                    <span className="legend-label">Approved</span>
                  </div>
                  <span className="legend-value">{approvedCount} ({totalLeaves > 0 ? Math.round((approvedCount/totalLeaves)*100) : 0}%)</span>
                </div>

                <div className="legend-row">
                  <div className="legend-left">
                    <span className="legend-dot dot-pending"></span>
                    <span className="legend-label">Pending</span>
                  </div>
                  <span className="legend-value">{pendingCount} ({totalLeaves > 0 ? Math.round((pendingCount/totalLeaves)*100) : 0}%)</span>
                </div>

                <div className="legend-row">
                  <div className="legend-left">
                    <span className="legend-dot dot-rejected"></span>
                    <span className="legend-label">Rejected</span>
                  </div>
                  <span className="legend-value">{rejectedCount} ({totalLeaves > 0 ? Math.round((rejectedCount/totalLeaves)*100) : 0}%)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
