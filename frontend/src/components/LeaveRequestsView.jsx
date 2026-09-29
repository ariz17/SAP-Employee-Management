import React, { useState, useMemo } from 'react';
import { Search, Check, X, Clock, CheckCircle2, XCircle } from 'lucide-react';

export function LeaveRequestsView({ 
  employees = [], 
  onApproveLeave, 
  onRejectLeave 
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyProcessed, setRecentlyProcessed] = useState({});

  const handleApprove = (empid, leaveId) => {
    setRecentlyProcessed(prev => ({ ...prev, [leaveId]: 'APPROVED' }));
    onApproveLeave(empid, leaveId);
  };

  const handleReject = (empid, leaveId) => {
    setRecentlyProcessed(prev => ({ ...prev, [leaveId]: 'REJECTED' }));
    onRejectLeave(empid, leaveId);
  };

  // Collect all leaves
  const allLeaves = useMemo(() => {
    const list = [];
    employees.forEach(emp => {
      (emp.Leaves || []).forEach(l => {
        list.push({
          ...l,
          empName: emp.Name,
          empDept: emp.Dept,
          empEmail: emp.Email
        });
      });
    });

    // Stable sort: newest requests first by LeaveId or StartDate
    // Prevents approved/rejected items from jumping around when their status changes
    return list.sort((a, b) => {
      const cmp = String(b.LeaveId || '').localeCompare(String(a.LeaveId || ''));
      if (cmp !== 0) return cmp;
      return new Date(b.StartDate) - new Date(a.StartDate);
    });
  }, [employees]);

  const filteredLeaves = useMemo(() => {
    return allLeaves.filter(item => {
      const isJustProcessed = Boolean(recentlyProcessed[item.LeaveId]);
      // If user is currently on PENDING tab and just approved/rejected an item, KEEP IT VISIBLE
      const matchesStatus = statusFilter === 'ALL' 
        || item.Status === statusFilter 
        || (statusFilter === 'PENDING' && isJustProcessed);

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        item.empName.toLowerCase().includes(q) ||
        item.Empid.includes(q) ||
        item.LeaveId.includes(q) ||
        item.LeaveType.toLowerCase().includes(q) ||
        item.empDept.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [allLeaves, statusFilter, searchTerm, recentlyProcessed]);

  const pendingCount = allLeaves.filter(l => l.Status === 'PENDING').length;
  const approvedCount = allLeaves.filter(l => l.Status === 'APPROVED').length;
  const rejectedCount = allLeaves.filter(l => l.Status === 'REJECTED').length;

  return (
    <div className="view-content-wrapper">
      {/* Table Card matching Screenshot 3 */}
      <div className="table-container-card">
        {/* Header with Title on Left, Count Badge on Right */}
        <div className="table-card-topbar">
          <div>
            <h2 className="table-card-title" style={{ fontSize: '1.25rem' }}>Leave Requests</h2>
            <p className="table-card-subtitle">All leave requests submitted by staff and processed in RAP composition.</p>
          </div>
          <span className="count-pill-badge">{allLeaves.length} Requests</span>
        </div>

        {/* Filter and Search Bar */}
        <div className="table-filter-bar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Employee, ID, Dept, or Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clean-search-input"
            />
          </div>

          <div className="status-tabs-wrap">
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({allLeaves.length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('APPROVED')}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REJECTED')}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Table Matching Screenshot 3 */}
        <div className="table-scroll-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>LEAVE TYPE</th>
                <th>DURATION</th>
                <th>DATES</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center-muted" style={{ padding: '36px' }}>
                    No leave requests match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.LeaveId}>
                    <td>
                      <span className="id-badge">{l.LeaveId}</span>
                    </td>
                    <td>
                      <div className="emp-name-text">{l.empName}</div>
                      <div className="emp-email-text">ID: {l.Empid}</div>
                    </td>
                    <td>
                      <span className="dept-pill">{l.empDept}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {l.LeaveType}
                    </td>
                    <td>
                      <strong>{l.DaysCount}</strong> day{l.DaysCount > 1 ? 's' : ''}
                    </td>
                    <td className="text-muted-sm">
                      {l.StartDate} ➔ {l.EndDate}
                    </td>
                    <td>
                      {l.Status === 'APPROVED' && (
                        <span className="status-badge status-approved">
                          APPROVED
                        </span>
                      )}
                      {l.Status === 'PENDING' && (
                        <span className="status-badge status-pending">
                          PENDING
                        </span>
                      )}
                      {l.Status === 'REJECTED' && (
                        <span className="status-badge status-rejected">
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.Status === 'PENDING' ? (
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn-action-accept"
                            onClick={() => handleApprove(l.Empid, l.LeaveId)}
                            title="Approve this leave request"
                          >
                            <Check size={13} />
                            <span>Accept</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-reject"
                            onClick={() => handleReject(l.Empid, l.LeaveId)}
                            title="Reject this leave request"
                          >
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          {l.Status === 'APPROVED' ? (
                            <span className="status-badge status-approved" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                              <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Approved
                            </span>
                          ) : (
                            <span className="status-badge status-rejected" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                              <XCircle size={12} style={{ marginRight: '4px' }} /> Rejected
                            </span>
                          )}
                        </div>
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
