import React, { useState } from 'react';
import { Database, Plus, LogOut, UserCheck, Shield, Key, X, CheckCircle, Users, Calendar } from 'lucide-react';

export function Header({ 
  currentUser, 
  onLogout, 
  onOpenAddEmployee, 
  adminSection = 'workforce', 
  onAdminSectionChange 
}) {
  const [showTokenModal, setShowTokenModal] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <Database size={24} />
          </div>
          <div className="brand-title">
            <h1>
              SAP Cloud Workforce Central
              <span className="sap-badge">
                {isAdmin ? 'Admin Portal' : 'Employee Self-Service'}
              </span>
            </h1>
            <p>Managed RAP Business Object • Role-Based Access Control (RBAC) • JWT Protected</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Online status indicator */}
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Gateway Online</span>
          </div>

          {/* User & Role Badge */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              {isAdmin ? (
                <Shield size={14} style={{ color: '#38bdf8' }} />
              ) : (
                <UserCheck size={14} style={{ color: '#10b981' }} />
              )}
              <span>
                <strong>{currentUser.name || currentUser.userId}</strong>
              </span>
              <span style={{
                background: isAdmin ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isAdmin ? '#38bdf8' : '#10b981',
                padding: '1px 7px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {currentUser.role}
              </span>
            </div>
          )}

          {/* JWT Token Inspector Button */}
          <button
            type="button"
            id="btn-inspect-jwt"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowTokenModal(true)}
            title="Inspect signed JWT Bearer token and claims"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Key size={13} style={{ color: '#f59e0b' }} />
            <span>JWT Token</span>
          </button>

          {/* Admin Navigation Section Switcher */}
          {isAdmin && (
            <div style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              padding: '2px'
            }}>
              <button
                type="button"
                className={`btn btn-sm ${adminSection === 'workforce' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onAdminSectionChange('workforce')}
                style={{ fontSize: '0.76rem', padding: '5px 10px', border: 'none' }}
              >
                <Users size={13} />
                <span>Workforce</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${adminSection === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onAdminSectionChange('leaves')}
                style={{ fontSize: '0.76rem', padding: '5px 10px', border: 'none' }}
              >
                <Calendar size={13} />
                <span>Leave Desk</span>
              </button>
            </div>
          )}

          {/* Add Employee Button (Admin Only) */}
          {isAdmin && onOpenAddEmployee && (
            <button 
              id="btn-add-employee-top"
              className="btn btn-primary btn-sm" 
              onClick={onOpenAddEmployee}
            >
              <Plus size={15} />
              <span>Add Employee</span>
            </button>
          )}

          {/* Logout Button */}
          {currentUser && (
            <button 
              id="btn-logout"
              className="btn btn-secondary btn-sm" 
              onClick={onLogout}
              title="Sign out of SAP Session"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      {/* JWT Inspection Modal */}
      {showTokenModal && (
        <div className="modal-overlay" onClick={() => setShowTokenModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={20} style={{ color: '#f59e0b' }} />
                <h3>JWT Authorization Token</h3>
              </div>
              <button className="close-btn" onClick={() => setShowTokenModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                <span>Active Bearer Token Verified & Validated</span>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Decoded Token Claims (Payload):
                </label>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto'
                }}>
                  {JSON.stringify(currentUser, null, 2)}
                </pre>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Encoded Bearer Token:
                </label>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-all'
                }}>
                  Bearer {currentUser?.token || 'N/A'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setShowTokenModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
