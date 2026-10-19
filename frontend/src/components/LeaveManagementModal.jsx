import React, { useState } from 'react';
import { X, Calendar, Check, AlertCircle, PlusCircle, Clock, ShieldCheck, XCircle } from 'lucide-react';

export function LeaveManagementModal({ isOpen, onClose, employee, onApproveLeave, onRejectLeave, onAddLeave }) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null); // { leave, action, comment }

  if (!isOpen || !employee) return null;

  const leaves = (employee.Leaves || []).filter(l => Boolean(l && l.StartDate && l.EndDate));

  const handleApply = (e) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Both start date and end date are required.');
      return;
    }

    // Date validation
    if (new Date(startDate) > new Date(endDate)) {
      setError('Leave start date cannot be after end date.');
      return;
    }

    if (!reason.trim()) {
      setError(`Please specify a description/reason for ${leaveType}.`);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Determination: calculateLeaveDays

    onAddLeave(employee.Empid, {
      LeaveType: leaveType,
      StartDate: startDate,
      EndDate: endDate,
      DaysCount: daysCount,
      Reason: reason.trim(),
      Status: 'PENDING'
    });

    setShowApplyForm(false);
    setReason('');
    setStartDate('');
    setEndDate('');
  };

  const handleConfirmDecision = () => {
    if (!reviewTarget) return;
    const { leave, action, comment } = reviewTarget;
    if (action === 'APPROVE') {
      onApproveLeave(employee.Empid, leave.LeaveId, comment.trim());
    } else {
      onRejectLeave(employee.Empid, leave.LeaveId, comment.trim());
    }
    setReviewTarget(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>
              <Calendar size={20} style={{ color: '#8b5cf6' }} />
              <span>Leave & Time-Off Management (SAP NetWeaver)</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Record in SAP table: <code>ZEMPLY_LEAVE_TAB</code> for <code>{employee.Name}</code> ({employee.Empid})
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Action Toolbar inside Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {leaves.length} Leave Record{leaves.length !== 1 ? 's' : ''} on file
          </span>
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => setShowApplyForm(!showApplyForm)}
          >
            <PlusCircle size={14} />
            <span>{showApplyForm ? 'Close Form' : 'Apply for Leave'}</span>
          </button>
        </div>

        {/* Apply Leave Sub-Form */}
        {showApplyForm && (
          <form onSubmit={handleApply} style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} style={{ color: 'var(--sap-blue-light)' }} />
              <span>New Leave Request Form</span>
            </h4>

            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: '#fb7185',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px'
              }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Leave Category</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="Annual Vacation">Annual Vacation</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Parental">Parental Leave</option>
                  <option value="Training & Cert">Training / Conference</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Start Date *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>End Date *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>

            {/* Detailed Description Box */}
            <div className="form-group" style={{ marginTop: '12px', marginBottom: '14px' }}>
              <label>Reason & Detailed Description *</label>
              <textarea 
                rows={3}
                placeholder="Enter detailed reason for leave request..." 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                className="clean-input"
                style={{ width: '100%', resize: 'vertical', fontSize: '0.8rem', marginTop: '4px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowApplyForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-primary">Submit to SAP Gateway</button>
            </div>
          </form>
        )}

        {/* Leaves Table */}
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '10px 14px' }}>Leave ID</th>
                <th style={{ padding: '10px 14px' }}>Type & Reason</th>
                <th style={{ padding: '10px 14px' }}>Duration</th>
                <th style={{ padding: '10px 14px' }}>Dates</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Manager Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-subtle)' }}>
                    No leave requests found for this employee.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.LeaveId}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{leave.LeaveId}</td>
                    <td style={{ padding: '10px 14px', maxWidth: '200px' }}>
                      <div style={{ fontWeight: 600 }}>{leave.LeaveType}</div>
                      {leave.Reason && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                          "{leave.Reason}"
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{leave.DaysCount} day{leave.DaysCount > 1 ? 's' : ''}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {leave.StartDate && leave.EndDate ? `${leave.StartDate} ➔ ${leave.EndDate}` : (leave.StartDate || leave.EndDate || '—')}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {leave.Status === 'APPROVED' && (
                        <span className="badge badge-active">Approved</span>
                      )}
                      {leave.Status === 'PENDING' && (
                        <span className="badge badge-leave" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          Pending
                        </span>
                      )}
                      {leave.Status === 'REJECTED' && (
                        <span className="badge badge-inactive" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                          Rejected
                        </span>
                      )}
                      {leave.HrComment && leave.HrComment.trim() !== '' && (
                        <div style={{ fontSize: '0.7rem', color: leave.Status === 'APPROVED' ? '#10b981' : '#f87171', marginTop: '2px' }}>
                          HR: {leave.HrComment}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {leave.Status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => setReviewTarget({ leave, action: 'APPROVE', comment: '' })}
                            title="Approve Leave with remarks"
                            style={{ background: '#059669', borderColor: '#059669' }}
                          >
                            <Check size={12} />
                            <span>Accept</span>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => setReviewTarget({ leave, action: 'REJECT', comment: '' })}
                            title="Reject leave with remarks"
                          >
                            <X size={12} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {leave.Status === 'APPROVED' ? (
                            <>
                              <ShieldCheck size={14} style={{ color: '#10b981' }} /> Approved
                            </>
                          ) : (
                            <>
                              <XCircle size={14} style={{ color: '#fb7185' }} /> Rejected
                            </>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Decision Prompt */}
        {reviewTarget && (
          <div style={{
            marginTop: '16px',
            padding: '14px',
            background: 'rgba(0, 0, 0, 0.6)',
            border: `1px solid ${reviewTarget.action === 'APPROVE' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: 'var(--radius-md)'
          }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: reviewTarget.action === 'APPROVE' ? '#10b981' : '#f87171' }}>
              Confirm {reviewTarget.action === 'APPROVE' ? 'Approval' : 'Rejection'} for Leave #{reviewTarget.leave.LeaveId}
            </h4>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.75rem' }}>HR Decision Note (Optional):</label>
              <input
                type="text"
                placeholder={reviewTarget.action === 'APPROVE' ? 'e.g. Approved, tasks handed over...' : 'e.g. Critical sprint deadline, reschedule...'}
                value={reviewTarget.comment}
                onChange={(e) => setReviewTarget(prev => ({ ...prev, comment: e.target.value }))}
                className="clean-input"
                style={{ fontSize: '0.8rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setReviewTarget(null)}>Cancel</button>
              <button
                type="button"
                className={`btn btn-sm ${reviewTarget.action === 'APPROVE' ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleConfirmDecision}
                style={{
                  background: reviewTarget.action === 'APPROVE' ? '#10b981' : '#ef4444',
                  borderColor: reviewTarget.action === 'APPROVE' ? '#10b981' : '#ef4444'
                }}
              >
                Confirm {reviewTarget.action === 'APPROVE' ? 'Accept' : 'Reject'}
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
