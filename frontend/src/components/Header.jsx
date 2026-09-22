import React from 'react';
import { Database, Plus, LogOut, UserCheck, Shield, Users, Calendar } from 'lucide-react';

export function Header({ 
  currentUser, 
  onLogout, 
  onOpenAddEmployee, 
  adminSection = 'workforce', 
  onAdminSectionChange 
}) {
  const isAdmin = currentUser?.role === 'admin';

  return (
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
  );
}
