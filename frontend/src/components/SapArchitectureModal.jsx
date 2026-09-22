import React, { useState } from 'react';
import { X, Layers, Code, GitBranch, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

export function SapArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('erd');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>
              <Layers size={22} style={{ color: '#38bdf8' }} />
              <span>SAP BTP ABAP Cloud Architecture Explorer</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Technical breakdown of the Managed RAP Business Object, CDS Data Model & OData V4 Service
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'erd' ? 'active' : ''}`}
            onClick={() => setActiveTab('erd')}
          >
            1. RAP Composition Model
          </button>
          <button 
            className={`tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavior')}
          >
            2. RAP Behavior (Actions & Rules)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cds' ? 'active' : ''}`}
            onClick={() => setActiveTab('cds')}
          >
            3. CDS Views & Annotations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'odata' ? 'active' : ''}`}
            onClick={() => setActiveTab('odata')}
          >
            4. OData V4 API Schema
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cleancore' ? 'active' : ''}`}
            onClick={() => setActiveTab('cleancore')}
          >
            5. Clean Core Compliance
          </button>
        </div>

        {/* Tab 1: RAP Composition Model */}
        {activeTab === 'erd' && (
          <div>
            <h4 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>Two-Tier RAP Composition Architecture</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Unlike basic tutorials with only 1 flat entity, this project implements <strong>Parent-Child Composition</strong> in the ABAP RESTful Application Programming Model (RAP):
            </p>

            <div style={{
              background: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              lineHeight: 1.8,
              color: '#f8fafc',
              marginBottom: '16px'
            }}>
              <div style={{ color: '#38bdf8', fontWeight: 600 }}>[Root Entity: Employee]</div>
              <div>Table: <span style={{ color: '#a7f3d0' }}>zemply_mng_dbtab</span></div>
              <div>CDS Interface: <span style={{ color: '#fde047' }}>ZI_EMPLOYEE_DETAILS</span> (Root View Entity)</div>
              <div>CDS Projection: <span style={{ color: '#fde047' }}>ZC_EMPLOYEE_DETAILS</span> (Transactional Query)</div>
              <div style={{ margin: '10px 0', color: '#8b5cf6' }}>
                &nbsp;&nbsp;│<br />
                &nbsp;&nbsp;└──► <strong>composition [0..*] of ZI_EMPLOYEE_LEAVE as _Leave</strong><br />
                &nbsp;&nbsp;│
              </div>
              <div style={{ color: '#38bdf8', fontWeight: 600 }}>[Child Entity: Leave Request]</div>
              <div>Table: <span style={{ color: '#a7f3d0' }}>zemply_leave_tab</span></div>
              <div>CDS Interface: <span style={{ color: '#fde047' }}>ZI_EMPLOYEE_LEAVE</span> (Child View Entity)</div>
              <div>CDS Projection: <span style={{ color: '#fde047' }}>ZC_EMPLOYEE_LEAVE</span></div>
              <div>Association: <span style={{ color: '#93c5fd' }}>association to parent ZI_EMPLOYEE_DETAILS as _Employee</span></div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              💡 <strong>Interview Tip:</strong> Mention how lifecycle operations on the root cascade to the children (e.g. deleting an employee automatically handles lock/draft state of related leave items).
            </div>
          </div>
        )}

        {/* Tab 2: RAP Behavior */}
        {activeTab === 'behavior' && (
          <div>
            <h4 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>Behavior Definition & Implementation Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>⚡ Custom Business Actions</div>
                <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '16px', lineHeight: 1.6 }}>
                  <li><code>giveRaise</code>: Dynamically increases employee base salary by given percentage with reason logging.</li>
                  <li><code>changeStatus</code>: Cycles employee status (<code>ACTIVE</code> ➔ <code>ON_LEAVE</code> ➔ <code>INACTIVE</code>).</li>
                  <li><code>approveLeave</code>: Manager approves submitted leave request.</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>🛡️ Validations & Determinations</div>
                <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '16px', lineHeight: 1.6 }}>
                  <li><code>determination setDefaultStatus</code>: Auto-populates <code>Status = 'ACTIVE'</code> on create.</li>
                  <li><code>determination calculateLeaveDays</code>: Calculates duration in days based on start and end dates.</li>
                  <li><code>validation validateSalary</code>: Checks salary is between $1 and $9,999,999 on save.</li>
                  <li><code>validation validateDates</code>: Rejects request if Start Date &gt; End Date.</li>
                </ul>
              </div>
            </div>

            <div className="code-box">
              <span style={{ color: '#94a3b8' }}>// Snippet from behavior/ZI_EMPLOYEE_565.bdef</span><br />
              <span style={{ color: '#c084fc' }}>define behavior for</span> ZI_EMPLOYEE_DETAILS<br />
              persistent table zemply_mng_dbtab<br />
              lock master authorization master ( instance )<br />
              &#123;<br />
              &nbsp;&nbsp;create; update; delete;<br />
              &nbsp;&nbsp;association _Leave &#123; create; &#125;<br />
              &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>action</span> giveRaise parameter ZD_RAISE_PARAM result [1] $self;<br />
              &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>action</span> changeStatus result [1] $self;<br />
              &nbsp;&nbsp;<span style={{ color: '#34d399' }}>determination</span> setDefaultStatus on modify &#123; create; &#125;<br />
              &nbsp;&nbsp;<span style={{ color: '#34d399' }}>validation</span> validateSalary on save &#123; create; update; &#125;<br />
              &#125;
            </div>
          </div>
        )}

        {/* Tab 3: CDS Views & Annotations */}
        {activeTab === 'cds' && (
          <div>
            <h4 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>UI Annotations for Fiori Elements & Frontend Mapping</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              The CDS Projection view uses rich <code>@UI</code> annotations to automatically drive Fiori Launchpad layouts and provide semantic schema for web applications:
            </p>
            <div className="code-box">
              @UI.headerInfo: &#123; typeName: 'Employee', title: &#123; value: 'Name' &#125; &#125;<br />
              @UI.facet: [<br />
              &nbsp;&nbsp;&#123; id: 'EmployeeInfo', type: #IDENTIFICATION_REFERENCE, label: 'Employee Details' &#125;,<br />
              &nbsp;&nbsp;&#123; id: 'EmployeeLeaves', type: #LINEITEM_REFERENCE, label: 'Leave History', targetElement: '_Leave' &#125;<br />
              ]<br /><br />
              @UI.lineItem: [<br />
              &nbsp;&nbsp;&#123; position: 50 &#125;,<br />
              &nbsp;&nbsp;&#123; type: #FOR_ACTION, dataAction: 'giveRaise', label: 'Give Salary Raise' &#125;<br />
              ]<br />
              Salary,
            </div>
          </div>
        )}

        {/* Tab 4: OData V4 */}
        {activeTab === 'odata' && (
          <div>
            <h4 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>SAP OData V4 Service Binding</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Service Definition <code>ZUI_EMPLOYEE_SERVICE_565</code> exposes both entities via OData V4:
            </p>
            <div className="code-box">
              GET /sap/opu/odata4/sap/zui_employee_service_565/srvd/sap/zui_employee_service_565/0001/Employee?$expand=_Leave<br /><br />
              &#123;<br />
              &nbsp;&nbsp;"@odata.context": "$metadata#Employee",<br />
              &nbsp;&nbsp;"value": [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Empid": "100101",<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Name": "Arbab Rizvi",<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Dept": "Engineering",<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Salary": 95000.00,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Status": "ACTIVE",<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_Leave": [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123; "LeaveId": "80010001", "LeaveType": "Annual Vacation", "DaysCount": 5, "Status": "APPROVED" &#125;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
              &nbsp;&nbsp;]<br />
              &#125;
            </div>
          </div>
        )}

        {/* Tab 5: Clean Core Compliance */}
        {activeTab === 'cleancore' && (
          <div>
            <h4 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>Clean Core & SAP BTP Compliance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={18} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Cloud-Ready ABAP (strict 2):</strong> Code does not use legacy ABAP statements (no obsolete <code>SELECT-OPTIONS</code>, classic dynpros, or direct table updates).
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={18} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Decoupled Architecture:</strong> Frontend is decoupled via standard OData V4 RESTful endpoints, meaning the SAP system can be upgraded without breaking consumer apps.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={18} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Standard RAP Framework:</strong> Transactional safety, draft handling, locking, and ETag mechanisms conform directly to SAP official guidelines.
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>Done Exploring</button>
        </div>
      </div>
    </div>
  );
}
