import React from 'react';
import { Database, Layers, Sparkles, Plus, ExternalLink } from 'lucide-react';

export function Header({ onOpenArchitecture, onOpenAddEmployee }) {
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
          <span>SAP RAP Gateway Online</span>
        </div>

        <button 
          id="btn-inspect-architecture"
          className="btn btn-secondary" 
          onClick={onOpenArchitecture}
          title="View ABAP CDS Views and RAP Architecture"
        >
          <Layers size={16} />
          <span>Inspect Architecture</span>
        </button>

        <button 
          id="btn-add-employee-top"
          className="btn btn-primary" 
          onClick={onOpenAddEmployee}
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>
    </header>
  );
}
