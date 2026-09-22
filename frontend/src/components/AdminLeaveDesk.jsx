import React, { useState, useMemo } from 'react';
import { 
  Calendar, Check, X, Search, Filter, Clock, CheckCircle2, 
  XCircle, AlertCircle, User, ArrowUpRight 
} from 'lucide-react';

export function AdminLeaveDesk({ 
  employees = [], 
  onApproveLeave, 
  onRejectLeave 
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all leaves across all employees with their parent employee details
  const allLeaves = useMemo(() => {
    const list = [];
    employees.forEach(emp => {
      (emp.Leaves || []).forEach(l => {
        list.push({
          ...l,
          empName: emp.Name,
          empEmail: emp.Email,
          empDept: emp.Dept,
          empStatus: emp.Status
        });
      });
    });
    // Sort so PENDING comes first, then by leave date
    return list.sort((a, b) => {
      if (a.Status === 'PENDING' && b.Status !== 'PENDING') return -1;
      if (a.Status !== 'PENDING' && b.Status === 'PENDING') return 1;
      return new Date(b.StartDate) - new Date(a.StartDate);
    });
  }, [employees]);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return allLeaves.filter(item => {
      const matchesStatus = statusFilter === 'ALL' || item.Status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.empName.toLowerCase().includes(q) ||
        item.Empid.includes(q) ||
        item.LeaveId.includes(q) ||
        item.LeaveType.toLowerCase().includes(q) ||
        item.empDept.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [allLeaves, statusFilter, searchQuery]);

  const pendingCount = allLeaves.filter(l => l.Status === 'PENDING').length;
  const approvedCount = allLeaves.filter(l => l.Status === 'APPROVED').length;
  const rejectedCount = allLeaves.filter(l => l.Status === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Enterprise Leaves</span>
            <Calendar size={16} className="metric-icon" />
          </div>
          <div className="metric-value">{allLeaves.length}</div>
          <div className="metric-subtext">Cumulative submissions</div>
        </div>

        <div className="metric-card" style={{ borderColor: pendingCount > 0 ? '#f59e0b' : 'var(--border-subtle)' }}>
          <div className="metric-header">
            <span className="metric-title" style={{ color: '#f59e0b' }}>Pending Approvals</span>
            <Clock size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div className="metric-value" style={{ color: '#f59e0b' }}>
            {pendingCount}
          </div>
          <div className="metric-subtext">Requires Manager/Admin action</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title" style={{ color: '#10b981' }}>Approved Leaves</span>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          </div>
          <div className="metric-value" style={{ color: '#10b981' }}>{approvedCount}</div>
          <div className="metric-subtext">Approved in RAP workflow</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title" style={{ color: '#fb7185' }}>Rejected Requests</span>
            <XCircle size={16} style={{ color: '#fb7185' }} />
          </div>
          <div className="metric-value" style={{ color: '#fb7185' }}>{rejectedCount}</div>
          <div className="metric-subtext">Declined applications</div>
        </div>
      </div>

      {/* Leave Approval Desk Card */}
      <div className="table-card" style={{ margin: 0 }}>
        <div className="table-header-title">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--sap-blue-light)' }} />
              <span>Centralized Leave Approvals & Rejections (RAP Composition)</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Admin authorization desk to accept or reject employee leave requests
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filteredLeaves.length} of {allLeaves.length} requests
          </span>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="control-toolbar" style={{ borderBottom: '1px solid var(--border-subtle)', borderRadius: 0 }}>
          <div className="filter-group">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by Employee, ID, Type, Dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.76rem' }}
                >
                  {st === 'ALL' && 'All Statuses'}
                  {st === 'PENDING' && `Pending (${pendingCount})`}
                  {st === 'APPROVED' && `Approved (${approvedCount})`}
                  {st === 'REJECTED' && `Rejected (${rejectedCount})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Leave ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Duration & Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Admin Decision</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No leave requests match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.LeaveId} style={{
                    background: l.Status === 'PENDING' ? 'rgba(245, 158, 11, 0.04)' : undefined
                  }}>
                    <td>
                      <span className="empid-tag">{l.LeaveId}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{l.empName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID: {l.Empid}</div>
                    </td>
                    <td>
                      <span className="badge badge-dept">{l.empDept}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {l.LeaveType}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{l.DaysCount} day{l.DaysCount > 1 ? 's' : ''}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {l.StartDate} ➔ {l.EndDate}
                      </div>
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {l.Reason || '—'}
                    </td>
                    <td>
                      {l.Status === 'APPROVED' && (
                        <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      )}
                      {l.Status === 'PENDING' && (
                        <span className="badge badge-leave" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {l.Status === 'REJECTED' && (
                        <span className="badge badge-inactive" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.Status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => onApproveLeave(l.Empid, l.LeaveId)}
                            title="Accept and Approve this leave request"
                            style={{ background: '#059669', borderColor: '#059669', padding: '6px 12px' }}
                          >
                            <Check size={14} />
                            <span>Accept</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => onRejectLeave(l.Empid, l.LeaveId)}
                            title="Reject this leave request"
                            style={{ padding: '6px 12px' }}
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          Processed
                        </span>
                      )}
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
