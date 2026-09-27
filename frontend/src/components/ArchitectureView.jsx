import React, { useState } from 'react';
import { Layers, Database, ShieldCheck, Code, GitBranch } from 'lucide-react';

export function ArchitectureView() {
  const [activeTab, setActiveTab] = useState('model');

  return (
    <div className="view-content-wrapper">
      <div className="table-container-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="avatar-large" style={{ background: 'linear-gradient(135deg, var(--primary-color), #38bdf8)' }}>
            <Layers size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>SAP ABAP RAP Architecture</h2>
            <p className="table-card-subtitle">Technical blueprint of Managed RESTful Application Programming Object</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="status-tabs-wrap" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'model' ? 'active' : ''}`}
            onClick={() => setActiveTab('model')}
          >
            1. Composition Data Model
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavior')}
          >
            2. Behavior (Actions & Rules)
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'cds' ? 'active' : ''}`}
            onClick={() => setActiveTab('cds')}
          >
            3. CDS Views & Tables
          </button>
        </div>

        {activeTab === 'model' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Two-Tier Parent-Child Composition</h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              Built according to SAP Clean Core guidelines on SAP BTP ABAP Environment:
            </p>
            <div className="code-box-clean">
              <span style={{ color: '#0284c7', fontWeight: 700 }}>[Root Entity: Employee Master]</span><br />
              Database Table: <span style={{ color: '#10b981' }}>zemply_mng_dbtab</span><br />
              CDS Interface View: <span style={{ color: '#f59e0b' }}>ZI_EMPLOYEE_DETAILS</span> (Root View Entity)<br />
              CDS Consumption View: <span style={{ color: '#f59e0b' }}>ZC_EMPLOYEE_DETAILS</span> (OData V4 Exposure)<br />
              <br />
              &nbsp;&nbsp;│<br />
              &nbsp;&nbsp;└──► <span style={{ color: '#8b5cf6', fontWeight: 600 }}>composition [0..*] of ZI_EMPLOYEE_LEAVE as _Leave</span><br />
              &nbsp;&nbsp;│<br />
              <br />
              <span style={{ color: '#0284c7', fontWeight: 700 }}>[Child Entity: Leave Transaction]</span><br />
              Database Table: <span style={{ color: '#10b981' }}>zemply_leave_tab</span><br />
              CDS Interface View: <span style={{ color: '#f59e0b' }}>ZI_EMPLOYEE_LEAVE</span> (Child View Entity)<br />
              CDS Consumption View: <span style={{ color: '#f59e0b' }}>ZC_EMPLOYEE_LEAVE</span><br />
              Association: <span style={{ color: '#38bdf8' }}>association to parent ZI_EMPLOYEE_DETAILS as _Employee</span>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Managed Behavior Definition (RAP BDEF)</h4>
            <div className="code-box-clean">
              <span style={{ color: '#0284c7', fontWeight: 700 }}>managed implementation in class zbp_i_employee_details unique;</span><br />
              strict ( 2 );<br /><br />
              define behavior for ZI_EMPLOYEE_DETAILS alias Employee<br />
              persistent table zemply_mng_dbtab<br />
              lock master<br />
              authorization master ( instance )<br />
              &#123;<br />
              &nbsp;&nbsp;create; update; delete;<br />
              &nbsp;&nbsp;association _Leave &#123; create; &#125;<br />
              <br />
              &nbsp;&nbsp;<span style={{ color: '#10b981' }}>// Determinations & Validations</span><br />
              &nbsp;&nbsp;determination setDefaultStatus on modify &#123; create; &#125;<br />
              &nbsp;&nbsp;validation validateSalary on save &#123; field Salary; create; update; &#125;<br />
              <br />
              &nbsp;&nbsp;<span style={{ color: '#f59e0b' }}>// Custom Business Actions</span><br />
              &nbsp;&nbsp;action giveRaise parameter ZD_RAISE_PARAM result [1] $self;<br />
              &nbsp;&nbsp;action changeStatus result [1] $self;<br />
              &#125;
            </div>
          </div>
        )}

        {activeTab === 'cds' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Dictionary Tables & Projection Mapping</h4>
            <div className="table-scroll-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>SAP OBJECT</th>
                    <th>TYPE</th>
                    <th>PURPOSE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>zemply_mng_dbtab</code></td>
                    <td>Transparent Table</td>
                    <td>Stores employee master data (client, empid, name, email, dept, salary, joindate, status)</td>
                  </tr>
                  <tr>
                    <td><code>zemply_leave_tab</code></td>
                    <td>Transparent Table</td>
                    <td>Stores composition child leave data (leaveid, empid, leavetype, startdate, enddate, status)</td>
                  </tr>
                  <tr>
                    <td><code>ZI_EMPLOYEE_565</code></td>
                    <td>CDS Interface View</td>
                    <td>Root entity data model with compositions and associations</td>
                  </tr>
                  <tr>
                    <td><code>ZC_EMPLOYEE_565</code></td>
                    <td>CDS Projection View</td>
                    <td>Service consumption entity with UI annotations for Fiori Elements & web client</td>
                  </tr>
                  <tr>
                    <td><code>ZD_RAISE_PARAM</code></td>
                    <td>Abstract CDS Entity</td>
                    <td>Input parameter structure for <code>giveRaise</code> action (percentage, reason)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
