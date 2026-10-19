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
  const [reviewModal, setReviewModal] = useState(null); // { leave, action: 'APPROVE' | 'REJECT', comment: '' }

  const handleOpenReview = (leave, action) => {
    setReviewModal({
      leave,
      action,
      comment: ''
    });
  };

  const handleConfirmReview = () => {
    if (!reviewModal) return;
    const { leave, action, comment } = reviewModal;
    setRecentlyProcessed(prev => ({ ...prev, [leave.LeaveId]: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' }));
    if (action === 'APPROVE') {
      onApproveLeave(leave.Empid, leave.LeaveId, comment.trim());
    } else {
      onRejectLeave(leave.Empid, leave.LeaveId, comment.trim());
    }
    setReviewModal(null);
  };

  // Collect all leaves (excluding dummy test records without dates)
  const allLeaves = useMemo(() => {
    const list = [];
    employees.forEach(emp => {
      (emp.Leaves || []).forEach(l => {
        if (!l || !l.StartDate || !l.EndDate) return;
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
        (item.Reason && item.Reason.toLowerCase().includes(q)) ||
        item.empDept.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [allLeaves, statusFilter, searchTerm, recentlyProcessed]);

  const pendingCount = allLeaves.filter(l => l.Status === 'PENDING').length;
  const approvedCount = allLeaves.filter(l => l.Status === 'APPROVED').length;
  const rejectedCount = allLeaves.filter(l => l.Status === 'REJECTED').length;

  return (
    <div className="view-content-wrapper">
      {/* Table Card */}
      <div className="table-container-card">
        {/* Header with Title on Left, Count Badge on Right */}
        <div className="table-card-topbar">
          <div>
            <h2 className="table-card-title" style={{ fontSize: '1.25rem' }}>Leave Requests Desk</h2>
            <p className="table-card-subtitle">Review employee descriptions, approve or reject leave requests with HR remarks via SAP NetWeaver Gateway.</p>
          </div>
          <span className="count-pill-badge">{allLeaves.length} Requests</span>
        </div>

        {/* Filter and Search Bar */}
        <div className="table-filter-bar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Employee, ID, Dept, or Reason..."
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

        {/* Table */}
        <div className="table-scroll-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>LEAVE CATEGORY & REASON</th>
                <th>DURATION</th>
                <th>DATES</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION & REMARKS</th>
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
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        {l.LeaveType}
                      </div>
                      {l.Reason && (
                        <div style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          marginTop: '3px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '4px',
                          lineHeight: 1.3
                        }}>
                          <span style={{ color: 'var(--text-subtle)' }}>Reason:</span>
                          <span style={{ fontStyle: 'italic', wordBreak: 'break-word' }}>"{l.Reason}"</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{l.DaysCount}</strong> day{l.DaysCount > 1 ? 's' : ''}
                    </td>
                    <td className="text-muted-sm">
                      {l.StartDate && l.EndDate ? `${l.StartDate} ➔ ${l.EndDate}` : (l.StartDate || l.EndDate || '—')}
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
                            onClick={() => handleOpenReview(l, 'APPROVE')}
                            title="Review and approve request"
                          >
                            <Check size={13} />
                            <span>Accept</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-reject"
                            onClick={() => handleOpenReview(l, 'REJECT')}
                            title="Review and reject request"
                          >
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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
                          {l.HrComment && l.HrComment.trim() !== '' && (
                            <div style={{
                              fontSize: '0.72rem',
                              color: l.Status === 'APPROVED' ? '#10b981' : '#f87171',
                              maxWidth: '180px',
                              textAlign: 'right',
                              wordBreak: 'break-word',
                              lineHeight: 1.2
                            }}>
                              <span style={{ fontWeight: 600 }}>Note:</span> {l.HrComment}
                            </div>
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

      {/* HR Decision Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {reviewModal.action === 'APPROVE' ? (
                  <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <CheckCircle2 size={20} />
                  </div>
                ) : (
                  <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                    <XCircle size={20} />
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    {reviewModal.action === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    SAP NetWeaver Gateway Action • Leave ID: <code>{reviewModal.leave.LeaveId}</code>
                  </p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setReviewModal(null)}><X size={18} /></button>
            </div>

            {/* Leave Summary Details */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Staff Member</span>
                <span style={{ fontWeight: 600 }}>{reviewModal.leave.empName} ({reviewModal.leave.empDept})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Leave Type & Duration</span>
                <span style={{ fontWeight: 600 }}>
                  {reviewModal.leave.LeaveType} • {reviewModal.leave.DaysCount} Day{reviewModal.leave.DaysCount > 1 ? 's' : ''} ({reviewModal.leave.StartDate} ➔ {reviewModal.leave.EndDate})
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', display: 'block', marginBottom: '4px' }}>
                  Employee's Stated Reason:
                </span>
                <div style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--sap-blue-light)',
                  lineHeight: 1.4
                }}>
                  "{reviewModal.leave.Reason || 'No detailed reason specified.'}"
                </div>
              </div>
            </div>

            {/* Decision Remarks */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                {reviewModal.action === 'APPROVE' ? 'HR Approval Note (Optional)' : 'Reason for Rejection (Optional)'}
              </label>

              <textarea
                rows={3}
                value={reviewModal.comment}
                onChange={(e) => setReviewModal(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={reviewModal.action === 'APPROVE' ? 'Enter approval note or instructions (optional)...' : 'Enter reason for rejection (optional)...'}
                className="clean-input"
                style={{ width: '100%', resize: 'vertical', fontSize: '0.82rem', lineHeight: 1.4 }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReviewModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${reviewModal.action === 'APPROVE' ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleConfirmReview}
                style={{
                  background: reviewModal.action === 'APPROVE' ? '#10b981' : '#ef4444',
                  borderColor: reviewModal.action === 'APPROVE' ? '#10b981' : '#ef4444'
                }}
              >
                {reviewModal.action === 'APPROVE' ? <Check size={14} /> : <X size={14} />}
                <span>{reviewModal.action === 'APPROVE' ? 'Confirm & Approve' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
