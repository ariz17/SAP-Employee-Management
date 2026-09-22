import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DEPARTMENTS } from '../data/mockData';

export function AddEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [salary, setSalary] = useState('');
  const [joindate, setJoindate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Employee name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid company email address.');
      return;
    }

    const numericSalary = parseFloat(salary);
    // Simulating RAP Validation: validateSalary
    if (isNaN(numericSalary) || numericSalary <= 0 || numericSalary > 9999999) {
      setError('SAP Validation Error: Salary must be greater than 0 and less than 10,000,000 (validateSalary).');
      return;
    }

    onAddEmployee({
      Name: name.trim(),
      Email: email.trim(),
      Dept: dept,
      Salary: numericSalary,
      Joindate: joindate,
      Status: 'ACTIVE' // Simulating RAP Determination: setDefaultStatus
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <UserPlus size={20} className="text-sap-blue" />
            <span>Create Employee Master Record</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            color: '#fb7185',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="input-emp-name">Full Name *</label>
            <input 
              id="input-emp-name"
              type="text" 
              placeholder="e.g. Alexander Hayes" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-emp-email">Corporate Email *</label>
            <input 
              id="input-emp-email"
              type="email" 
              placeholder="e.g. a.hayes@enterprise.sap" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-emp-dept">Department</label>
            <select 
              id="input-emp-dept"
              value={dept} 
              onChange={(e) => setDept(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="input-emp-salary">Base Salary (Annual INR - ₹) *</label>
            <input 
              id="input-emp-salary"
              type="number" 
              placeholder="e.g. 1200000" 
              value={salary} 
              onChange={(e) => setSalary(e.target.value)} 
              step="10000"
              required 
            />
            <small style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>
              Checked by RAP Save Validation: <code>validateSalary</code> (range: ₹1 - ₹99,99,999)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="input-emp-joindate">Effective Joining Date</label>
            <input 
              id="input-emp-joindate"
              type="date" 
              value={joindate} 
              onChange={(e) => setJoindate(e.target.value)} 
            />
          </div>

          <div style={{
            background: 'rgba(56, 189, 248, 0.06)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.75rem',
            color: 'var(--sap-blue-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>Determination <code>setDefaultStatus</code> will auto-assign Status = <strong>ACTIVE</strong> on commit.</span>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="btn-submit-employee" type="submit" className="btn btn-primary">Create in SAP</button>
          </div>
        </form>
      </div>
    </div>
  );
}
