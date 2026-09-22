import React, { useState } from 'react';
import { X, Calendar, Check, AlertCircle, PlusCircle, Clock, ShieldCheck } from 'lucide-react';

export function LeaveManagementModal({ isOpen, onClose, employee, onApproveLeave, onAddLeave }) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !employee) return null;

  const leaves = employee.Leaves || [];

  const handleApply = (e) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Both start date and end date are required.');
      return;
    }

    // Simulating RAP Validation: validateDates
    if (new Date(startDate) > new Date(endDate)) {
      setError('SAP Validation Error: Leave start date cannot be after end date (validateDates).');
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
      Reason: reason || 'Personal Leave',
      Status: 'PENDING'
    });

    setShowApplyForm(false);
    setReason('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>
              <Calendar size={20} style={{ color: '#8b5cf6' }} />
              <span>Leave & Time-Off Management (RAP Composition)</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Child Entity: <code>ZC_EMPLOYEE_LEAVE</code> associated to parent <code>{employee.Name}</code> ({employee.Empid})
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
                <label>Leave Type</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="Annual Vacation">Annual Vacation</option>
                  <option value="Sick Leave">Sick Leave</option>
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

            <div className="form-group" style={{ marginTop: '12px', marginBottom: '12px' }}>
              <label>Reason / Notes</label>
              <input 
                type="text" 
                placeholder="e.g. Annual summer holidays" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowApplyForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-primary">Submit to SAP RAP</button>
            </div>
          </form>
        )}

        {/* Leaves Table */}
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '10px 14px' }}>Leave ID</th>
                <th style={{ padding: '10px 14px' }}>Type</th>
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
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{leave.LeaveType}</td>
                    <td style={{ padding: '10px 14px' }}>{leave.DaysCount} day{leave.DaysCount > 1 ? 's' : ''}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {leave.StartDate} ➔ {leave.EndDate}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${leave.Status === 'APPROVED' ? 'badge-active' : 'badge-leave'}`}>
                        {leave.Status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {leave.Status === 'PENDING' ? (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => onApproveLeave(employee.Empid, leave.LeaveId)}
                          title="Execute RAP Action approveLeave"
                        >
                          <Check size={12} />
                          <span>Approve (RAP)</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={14} style={{ color: '#10b981' }} /> Approved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
