import React, { useState } from 'react';
import { 
  User, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, 
  Send, Briefcase, Mail, DollarSign
} from 'lucide-react';

export function EmployeeDashboard({ 
  currentEmployee, 
  onApplyLeave 
}) {
  // Leave Form State
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fallback if currentEmployee not found
  const emp = currentEmployee || {
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

  // Handle Leave Submission
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

    setFormSuccess(`Leave request for ${daysCount} day(s) submitted successfully. Status is Pending Admin Review.`);
    setStartDate('');
    setEndDate('');
    setReason('');

    setTimeout(() => {
      setFormSuccess('');
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Employee Profile Summary Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--sap-blue), #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 14px var(--sap-blue-glow)'
            }}>
              <User size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                  {emp.Name}
                </h2>
                <span className="empid-tag">ID: {emp.Empid}</span>
                <span className={`badge ${
                  emp.Status === 'ACTIVE' ? 'badge-active' :
                  emp.Status === 'ON_LEAVE' ? 'badge-leave' : 'badge-inactive'
                }`}>
                  {emp.Status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Briefcase size={14} style={{ color: 'var(--sap-blue-light)' }} />
                  {emp.Dept}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={14} />
                  {emp.Email}
                </span>
                <span>•</span>
                <span>Joined: {emp.Joindate}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Base Compensation
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              ₹{(parseFloat(emp.Salary) || 0).toLocaleString('en-IN')} / yr
            </div>
          </div>
        </div>

        {/* Quick Leave Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div className="metric-card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Requests</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px' }}>{leaves.length}</div>
          </div>
          <div className="metric-card" style={{ padding: '12px 14px', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Pending Review
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>{pendingCount}</div>
          </div>
          <div className="metric-card" style={{ padding: '12px 14px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Approved
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{approvedCount}</div>
          </div>
          <div className="metric-card" style={{ padding: '12px 14px', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={12} /> Rejected
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fb7185', marginTop: '2px' }}>{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Leave History on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.6fr)', gap: '20px' }}>
        
        {/* SECTION: Apply for Leave Form */}
        <div className="table-card" style={{ margin: 0, padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Calendar size={18} style={{ color: 'var(--sap-blue-light)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              Apply for Leave
            </h3>
          </div>

          {formError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              color: '#fb7185',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}>
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              color: '#34d399',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}>
              <CheckCircle2 size={15} />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitLeave}>
            <div className="form-group">
              <label>Leave Type</label>
              <select 
                value={leaveType} 
                onChange={(e) => setLeaveType(e.target.value)}
                className="select-dropdown"
                style={{ width: '100%', background: 'var(--bg-card)' }}
              >
                <option value="Annual Vacation">Annual Vacation</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Parental Leave">Parental Leave</option>
                <option value="Training & Cert">Training & Certification</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Start Date *</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reason / Note</label>
              <input 
                type="text" 
                placeholder="e.g. Personal errand, family function..." 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
            >
              <Send size={14} />
              <span>Submit Leave Request</span>
            </button>
          </form>
        </div>

        {/* SECTION: My Leaves History Table */}
        <div className="table-card" style={{ margin: 0, padding: '22px' }}>
          <div className="table-header-title" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600 }}>
              <Clock size={18} style={{ color: 'var(--sap-blue-light)' }} />
              <span>My Leave History & Status</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {leaves.length} record{leaves.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="table-responsive" style={{ marginTop: '12px' }}>
            <table>
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No leave requests submitted yet. Use the form on the left to submit a request.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.LeaveId}>
                      <td>
                        <span className="empid-tag">{l.LeaveId}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{l.LeaveType}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {l.StartDate} ➔ {l.EndDate}
                      </td>
                      <td>
                        {l.DaysCount} d
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
