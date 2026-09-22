import React from 'react';
import { Database, Layers, Plus, LogOut, UserCheck } from 'lucide-react';

export function Header({ currentUser, onLogout, onOpenArchitecture, onOpenAddEmployee }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Database size={24} />
        </div>
        <div className="brand-title">
          <h1>
            SAP Cloud Workforce Central
            <span className="sap-badge">BTP ABAP Cloud</span>
          </h1>
          <p>Managed RAP Business Object • Core Data Services (CDS) • OData V4 Service Binding</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>SAP Gateway Online</span>
        </div>

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
            <UserCheck size={14} style={{ color: 'var(--sap-blue-light)' }} />
            <span>User: <strong>{currentUser.userId}</strong></span>
          </div>
        )}

        <button 
          id="btn-inspect-architecture"
          className="btn btn-secondary btn-sm" 
          onClick={onOpenArchitecture}
          title="View ABAP CDS Views and RAP Architecture"
        >
          <Layers size={15} />
          <span>Inspect Architecture</span>
        </button>

        <button 
          id="btn-add-employee-top"
          className="btn btn-primary btn-sm" 
          onClick={onOpenAddEmployee}
        >
          <Plus size={15} />
          <span>Add Employee</span>
        </button>

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
