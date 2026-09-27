import React from 'react';
import { Database, Plus, LogOut, UserCheck, Shield, Users, Calendar, Layers } from 'lucide-react';

export function Header({ 
  currentUser, 
  onLogout, 
  onOpenAddEmployee, 
  adminSection = 'workforce', 
  onAdminSectionChange,
  onOpenArchitecture
}) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Database size={22} />
        </div>
        <div className="brand-title">
          <h1>
            SAP Workforce Management
            <span className="sap-badge">
              {isAdmin ? 'HR Admin Portal' : 'Employee Self-Service'}
            </span>
          </h1>
          <p>Managed ABAP RAP Business Object • S/4HANA Cloud Services</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Navigation Tabs for Admin */}
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
              style={{ fontSize: '0.78rem', padding: '6px 12px', border: 'none' }}
            >
              <Users size={14} />
              <span>Employees</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${adminSection === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onAdminSectionChange('leaves')}
              style={{ fontSize: '0.78rem', padding: '6px 12px', border: 'none' }}
            >
              <Calendar size={14} />
              <span>Leave Approvals</span>
            </button>
          </div>
        )}

        {/* Action: Add Employee (Admin only) */}
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

        {/* Action: RAP Architecture Explorer Button (Gold for interview) */}
        {onOpenArchitecture && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenArchitecture}
            title="View SAP CDS Views, Tables & RAP Behavior Structure"
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
          >
            <Layers size={14} />
            <span>RAP Architecture</span>
          </button>
        )}

        {/* Current User Badge */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            padding: '5px 12px',
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
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {currentUser.role}
            </span>
          </div>
        )}

        {/* Logout Button */}
        {currentUser && (
          <button 
            id="btn-logout"
            className="btn btn-secondary btn-sm" 
            onClick={onLogout}
            title="Sign out / Switch account"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
