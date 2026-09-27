import React, { useState } from 'react';
import { 
  User, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, 
  Send, Briefcase, Mail, DollarSign
} from 'lucide-react';

export function SelfServiceView({ 
  currentEmployee, 
  employees = [],
  onApplyLeave,
  onSwitchEmployee
}) {
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const emp = currentEmployee || employees[0] || {
    Empid: '100101',
    Name: 'Arbab Rizvi',
    Email: 'arbab.rizvi@enterprise.com',
    Dept: 'IT Consulting',
    Salary: 1250000,
    Joindate: '2023-01-15',
    Status: 'ACTIVE',
    Leaves: []
  };

  const leaves = emp.Leaves || [];
  const approvedCount = leaves.filter(l => l.Status === 'APPROVED').length;
  const pendingCount = leaves.filter(l => l.Status === 'PENDING').length;
  const rejectedCount = leaves.filter(l => l.Status === 'REJECTED').length;

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!startDate || !endDate) {
      setFormError('Please select both Start Date and End Date.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Leave Start Date cannot be after End Date (validateDates).');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    onApplyLeave(emp.Empid, {
      LeaveType: leaveType,
      StartDate: startDate,
      EndDate: endDate,
      DaysCount: daysCount,
      Reason: reason.trim() || 'General Time Off',
      Status: 'PENDING'
    });

    setFormSuccess(`Leave request for ${daysCount} day(s) submitted successfully. Live Status: Pending Admin Approval.`);
    setStartDate('');
    setEndDate('');
    setReason('');

    setTimeout(() => setFormSuccess(''), 4000);
  };

  return (
    <div className="view-content-wrapper">
      {/* Switcher & Profile Card */}
      <div className="table-container-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="avatar-large">
              {emp.Name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{emp.Name}</h2>
                <span className="id-badge">ID: {emp.Empid}</span>
                <span className={`status-badge ${emp.Status === 'ACTIVE' ? 'status-approved' : 'status-pending'}`}>
                  {emp.Status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={14} /> {emp.Dept}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={14} /> {emp.Email}
                </span>
                <span>•</span>
                <span>Joined {emp.Joindate}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onSwitchEmployee && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Simulate Employee:</span>
                <select 
                  value={emp.Empid} 
                  onChange={(e) => onSwitchEmployee(e.target.value)}
                  className="clean-select"
                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                >
                  {employees.map(e => (
                    <option key={e.Empid} value={e.Empid}>
                      {e.Name} ({e.Dept})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="profile-salary-box">
              <span className="stat-label">Annual CTC</span>
              <div className="salary-highlight">₹{(parseFloat(emp.Salary) || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Leave Status Chips */}
        <div className="stats-row-3" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div className="stat-card" style={{ padding: '14px' }}>
            <span className="stat-label">Total Leave Requests</span>
            <div className="stat-number">{leaves.length}</div>
          </div>
          <div className="stat-card" style={{ padding: '14px', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
            <span className="stat-label" style={{ color: '#f59e0b' }}>Pending Review</span>
            <div className="stat-number" style={{ color: '#f59e0b' }}>{pendingCount}</div>
          </div>
          <div className="stat-card" style={{ padding: '14px', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <span className="stat-label" style={{ color: '#10b981' }}>Approved Leaves</span>
            <div className="stat-number" style={{ color: '#10b981' }}>{approvedCount}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Apply on Left, History on Right */}
      <div className="grid-split-2">
        {/* Form Card */}
        <div className="table-container-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Calendar size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Apply for Leave</h3>
          </div>

          {formError && (
            <div className="alert-box-danger">
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="alert-box-success">
              <CheckCircle2 size={15} />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitLeave}>
            <div className="form-group-clean">
              <label>Leave Category</label>
              <select 
                value={leaveType} 
                onChange={(e) => setLeaveType(e.target.value)}
                className="clean-select"
                style={{ width: '100%' }}
              >
                <option value="Annual Vacation">Annual Vacation</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Parental Leave">Parental Leave</option>
                <option value="Training & Cert">Training & Certification</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group-clean">
                <label>Start Date *</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                  className="clean-input"
                />
              </div>

              <div className="form-group-clean">
                <label>End Date *</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                  className="clean-input"
                />
              </div>
            </div>

            <div className="form-group-clean">
              <label>Reason / Note</label>
              <input 
                type="text" 
                placeholder="e.g. Personal errand, family function..." 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                className="clean-input"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary-action"
              style={{ width: '100%', marginTop: '6px', justifyContent: 'center' }}
            >
              <Send size={14} />
              <span>Submit Leave Request</span>
            </button>
          </form>
        </div>

        {/* History Table Card */}
        <div className="table-container-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>My Leave History</h3>
            <span className="count-pill-badge">{leaves.length} records</span>
          </div>

          <div className="table-scroll-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>LEAVE ID</th>
                  <th>TYPE</th>
                  <th>DATES</th>
                  <th>DAYS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center-muted" style={{ padding: '28px' }}>
                      No leaves applied yet. Use the form to apply.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.LeaveId}>
                      <td><span className="id-badge">{l.LeaveId}</span></td>
                      <td style={{ fontWeight: 500 }}>{l.LeaveType}</td>
                      <td className="text-muted-sm">{l.StartDate} ➔ {l.EndDate}</td>
                      <td>{l.DaysCount}d</td>
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
    </div>
  );
}
