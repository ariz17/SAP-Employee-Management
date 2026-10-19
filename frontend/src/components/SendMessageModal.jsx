import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, AlertCircle, Sparkles, User, ShieldAlert } from 'lucide-react';

export function SendMessageModal({ 
  isOpen, 
  onClose, 
  employee = null, 
  employees = [], 
  onSendMessage 
}) {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [subject, setSubject] = useState('Direct HR Notice');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync selected employee when modal opens or prop changes
  useEffect(() => {
    if (employee && employee.Empid) {
      setSelectedEmpId(employee.Empid);
    } else if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].Empid);
    }
  }, [employee, employees, isOpen]);

  if (!isOpen) return null;

  const currentEmp = employees.find(e => e.Empid === selectedEmpId) || employee;

  const quickSubjects = [
    'Direct HR Notice',
    'Performance Recognition',
    'Compensation & Benefits',
    'Leave Policy Clarification',
    'One-on-One Discussion'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter a message for the employee.');
      return;
    }
    if (!selectedEmpId) {
      setErrorMsg('Please select a recipient employee.');
      return;
    }

    onSendMessage({
      empid: selectedEmpId,
      subject: subject.trim() || 'Direct HR Notice',
      message: message.trim(),
      priority,
      employeeName: currentEmp?.Name || selectedEmpId
    });

    // Reset and close
    setMessage('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0a6ed1, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(10, 110, 209, 0.25)'
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Send Direct Message</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Deliver a personal notification directly to the employee's portal
              </p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Selected Employee Summary Card */}
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              border: '1px solid rgba(10, 110, 209, 0.2)'
            }}>
              {currentEmp?.Name ? currentEmp.Name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {currentEmp?.Name || 'Select Employee'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                <span>ID: <code>{currentEmp?.Empid || selectedEmpId}</code></span>
                {currentEmp?.Dept && <span>• {currentEmp.Dept}</span>}
              </div>
            </div>
          </div>

          {/* If opened without pre-selected employee, allow picking */}
          {employees.length > 1 && (
            <div style={{ minWidth: '180px' }}>
              <select
                className="clean-select"
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  setErrorMsg('');
                }}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                {employees.map(emp => (
                  <option key={emp.Empid} value={emp.Empid}>
                    {emp.Name} ({emp.Empid})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Compose Form */}
        <form onSubmit={handleSubmit}>
          {/* Quick Subject Chips */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Subject / Category</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick templates:</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {quickSubjects.map(qs => (
                <button
                  key={qs}
                  type="button"
                  onClick={() => setSubject(qs)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: subject === qs ? '1px solid var(--primary-color)' : '1px solid var(--border-subtle)',
                    background: subject === qs ? 'var(--primary-light)' : 'transparent',
                    color: subject === qs ? 'var(--primary-color)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontWeight: subject === qs ? 600 : 400
                  }}
                >
                  {qs}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Project Recognition / Clarification needed"
              required
              className="clean-search-input"
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>

          {/* Personal Message Textarea */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Personal Memo Content *</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {message.length} characters
              </span>
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Write your note to this employee. This will immediately show in their Notifications section..."
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Priority Flag and Delivery Note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: priority === 'HIGH' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)',
            border: priority === 'HIGH' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-subtle)',
            marginBottom: '20px',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {priority === 'HIGH' ? (
                <ShieldAlert size={16} style={{ color: '#ef4444' }} />
              ) : (
                <Sparkles size={16} style={{ color: 'var(--primary-color)' }} />
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {priority === 'HIGH' ? 'Marked as High Priority Alert' : 'Standard HR Communication'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPriority(prev => prev === 'NORMAL' ? 'HIGH' : 'NORMAL')}
              style={{
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                background: priority === 'HIGH' ? '#ef4444' : 'var(--border-subtle)',
                color: priority === 'HIGH' ? '#ffffff' : 'var(--text-main)'
              }}
            >
              {priority === 'HIGH' ? 'High Priority' : 'Normal'}
            </button>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 18px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                fontWeight: 600
              }}
            >
              <Send size={15} />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
