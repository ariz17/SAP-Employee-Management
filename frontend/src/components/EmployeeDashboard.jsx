import React, { useState } from 'react';
import { 
  User, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, 
  Send, Search, Briefcase, Mail, DollarSign, Award, Shield
} from 'lucide-react';

export function EmployeeDashboard({ 
  currentEmployee, 
  employees = [], 
  onApplyLeave 
}) {
  // Leave Form State
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Lookup / Fetch Colleague State
  const [lookupId, setLookupId] = useState('');
  const [fetchedColleague, setFetchedColleague] = useState(null);
  const [lookupError, setLookupError] = useState('');

  // Fallback if currentEmployee not found
  const emp = currentEmployee || {
    Empid: 'N/A',
    Name: 'Unknown Employee',
    Email: 'unknown@enterprise.sap',
    Dept: 'General',
    Salary: 0,
    Joindate: '2026-01-01',
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
      setFormError('SAP RAP Validation: Leave Start Date cannot be after End Date (validateDates).');
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

    setFormSuccess(`Leave request for ${daysCount} day(s) submitted successfully! Awaiting Admin review.`);
    setStartDate('');
    setEndDate('');
    setReason('');

    setTimeout(() => {
      setFormSuccess('');
    }, 5000);
  };

  // Handle Fetch Employee Details
  const handleFetchEmployee = (e) => {
    e.preventDefault();
    setLookupError('');
    setFetchedColleague(null);

    const query = lookupId.trim().toLowerCase();
    if (!query) {
      setLookupError('Please enter an Employee ID or Name to fetch details.');
      return;
    }

    const match = employees.find(
      item => item.Empid.toLowerCase() === query || 
              item.Name.toLowerCase().includes(query) ||
              item.Email.toLowerCase().includes(query)
    );

    if (match) {
      setFetchedColleague(match);
    } else {
      setLookupError(`No employee found matching "${lookupId}". Please check the ID.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome & Profile Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '160px',
          height: '160px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
            }}>
              <User size={34} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                  {emp.Name}
                </h2>
                <span className="empid-tag" style={{ fontSize: '0.8rem' }}>
                  ID: {emp.Empid}
                </span>
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
                  {emp.Dept} Department
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
            padding: '12px 20px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Base Annual Compensation
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              ₹{(parseFloat(emp.Salary) || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Quick Leave Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginTop: '22px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div className="metric-card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total Requests</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>{leaves.length}</div>
          </div>
          <div className="metric-card" style={{ padding: '12px 16px', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.74rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> Pending Admin Action
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>{pendingCount}</div>
          </div>
          <div className="metric-card" style={{ padding: '12px 16px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Approved Leaves
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{approvedCount}</div>
          </div>
          <div className="metric-card" style={{ padding: '12px 16px', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
            <div style={{ fontSize: '0.74rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={13} /> Rejected Leaves
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fb7185', marginTop: '2px' }}>{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Main Employee Workspace Grid: Apply Leave Form + Lookup Tool */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* SECTION 1: Apply for Leave Form */}
        <div className="table-card" style={{ margin: 0, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Calendar size={20} style={{ color: 'var(--sap-blue-light)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Apply for Time-Off / Leave
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Submit a leave request. Requests are processed in real-time and queued for Admin approval or rejection.
          </p>

          {formError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#fb7185',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
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
              padding: '10px 14px',
              color: '#34d399',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={15} />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitLeave}>
            <div className="form-group">
              <label>Leave Category</label>
              <select 
                value={leaveType} 
                onChange={(e) => setLeaveType(e.target.value)}
                className="select-dropdown"
                style={{ width: '100%', background: 'var(--bg-card)' }}
              >
                <option value="Annual Vacation">Annual Vacation</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Parental">Parental Leave</option>
                <option value="Training & Cert">Training & Certification</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
              <label>Reason / Business Note</label>
              <input 
                type="text" 
                placeholder="e.g. Family wedding, Doctor appointment..." 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px' }}
            >
              <Send size={15} />
              <span>Submit Leave Request</span>
            </button>
          </form>
        </div>

        {/* SECTION 2: Fetch & Lookup Employee Details */}
        <div className="table-card" style={{ margin: 0, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Search size={20} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Fetch Employee Record
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Fetch profile and departmental details for any employee across the organization.
          </p>

          <form onSubmit={handleFetchEmployee} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <input 
              type="text" 
              placeholder="Enter Emp ID (e.g. 100102)..."
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary">
              Fetch
            </button>
          </form>

          {lookupError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              color: '#fb7185',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '14px'
            }}>
              <AlertCircle size={14} />
              <span>{lookupError}</span>
            </div>
          )}

          {fetchedColleague ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="empid-tag">{fetchedColleague.Empid}</span>
                <span className={`badge ${
                  fetchedColleague.Status === 'ACTIVE' ? 'badge-active' :
                  fetchedColleague.Status === 'ON_LEAVE' ? 'badge-leave' : 'badge-inactive'
                }`}>
                  {fetchedColleague.Status}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                {fetchedColleague.Name}
              </h4>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {fetchedColleague.Email}
              </div>
              <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Department:</strong> {fetchedColleague.Dept}</div>
                <div><strong>Join Date:</strong> {fetchedColleague.Joindate}</div>
                <div><strong>Registered Leaves:</strong> {fetchedColleague.Leaves?.length || 0}</div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '24px 16px',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-subtle)',
              fontSize: '0.8rem'
            }}>
              Enter an Employee ID above to view details.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: My Leaves History & Real-Time Approval / Rejection Status */}
      <div className="table-card">
        <div className="table-header-title">
          <h2>
            <Clock size={18} style={{ color: 'var(--sap-blue-light)' }} />
            <span>My Leave Applications & Live Status</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {leaves.length} record{leaves.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Leave ID</th>
                <th>Category</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status (Admin Decision)</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    You have not submitted any leave applications yet. Use the form above to apply.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.LeaveId}>
                    <td>
                      <span className="empid-tag">{l.LeaveId}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{l.LeaveType}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {l.StartDate} ➔ {l.EndDate}
                    </td>
                    <td>
                      {l.DaysCount} day{l.DaysCount > 1 ? 's' : ''}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {l.Reason || '—'}
                    </td>
                    <td>
                      {l.Status === 'APPROVED' && (
                        <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Accepted / Approved
                        </span>
                      )}
                      {l.Status === 'PENDING' && (
                        <span className="badge badge-leave" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          <Clock size={12} /> Pending Approval
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
  );
}
