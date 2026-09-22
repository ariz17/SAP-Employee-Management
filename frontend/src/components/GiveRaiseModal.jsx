import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

export function GiveRaiseModal({ isOpen, onClose, employee, onApplyRaise }) {
  const [percentage, setPercentage] = useState(10);
  const [reason, setReason] = useState('Annual Performance Merit Increment');

  if (!isOpen || !employee) return null;

  const currentSalary = parseFloat(employee.Salary) || 0;
  const pct = parseFloat(percentage) || 0;
  const incrementAmount = (currentSalary * pct) / 100;
  const newSalary = currentSalary + incrementAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Triggers custom RAP action: giveRaise
    onApplyRaise(employee.Empid, pct, reason);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <TrendingUp size={20} style={{ color: '#38bdf8' }} />
            <span>SAP RAP Action: <code>giveRaise</code></span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Target Employee</span>
            <span style={{ fontWeight: 600 }}>{employee.Name} ({employee.Empid})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Current Base Salary</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${currentSalary.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="input-raise-pct">Percentage Increase (%)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              {[5, 10, 15, 20].map((val) => (
                <button
                  type="button"
                  key={val}
                  className={`btn btn-sm ${percentage === val ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPercentage(val)}
                >
                  +{val}%
                </button>
              ))}
            </div>
            <input 
              id="input-raise-pct"
              type="number" 
              min="1" 
              max="100" 
              value={percentage} 
              onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-raise-reason">Action Parameter: <code>ZD_RAISE_PARAM~revision_reason</code></label>
            <input 
              id="input-raise-reason"
              type="text" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
            />
          </div>

          {/* Real-time Calculation Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(10, 110, 209, 0.15), rgba(56, 189, 248, 0.1))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--sap-blue-light)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Dynamic Calculation Preview
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Old Salary</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1rem' }}>${currentSalary.toLocaleString()}</div>
              </div>
              <ArrowRight size={20} style={{ color: 'var(--sap-blue-light)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>New Salary (+${incrementAmount.toLocaleString()})</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem', color: '#34d399' }}>${newSalary.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="btn-execute-raise" type="submit" className="btn btn-primary">Execute RAP Action</button>
          </div>
        </form>
      </div>
    </div>
  );
}
