import React, { useState } from 'react';
import { Layers, Database, Code, GitBranch, Globe, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function ArchitectureView() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="view-content-wrapper">
      <div className="table-container-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="avatar-large" style={{ background: 'linear-gradient(135deg, var(--primary-color), #2563eb)' }}>
            <Layers size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>SAP NetWeaver Gateway & ABAP Architecture</h2>
            <p className="table-card-subtitle">
              3-Tier Enterprise Architecture: React.js (Frontend) ➔ Node.js BFF (API Gateway) ➔ SAP NetWeaver (ABAP Backend)
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="status-tabs-wrap" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '6px' }}>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Server size={13} style={{ display: 'inline', marginRight: '4px' }} />
            1. 3-Tier Overview
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            <Database size={13} style={{ display: 'inline', marginRight: '4px' }} />
            2. SE11 Database Tables
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'odata' ? 'active' : ''}`}
            onClick={() => setActiveTab('odata')}
          >
            <Globe size={13} style={{ display: 'inline', marginRight: '4px' }} />
            3. SEGW OData Service
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'abap' ? 'active' : ''}`}
            onClick={() => setActiveTab('abap')}
          >
            <Code size={13} style={{ display: 'inline', marginRight: '4px' }} />
            4. SE24 DPC_EXT Class
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'bff' ? 'active' : ''}`}
            onClick={() => setActiveTab('bff')}
          >
            <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} />
            5. Node.js BFF Gateway
          </button>
        </div>

        {/* TAB 1: 3-Tier Overview */}
        {activeTab === 'overview' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>
              3-Tier Enterprise Architecture Design
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '16px' }}>
              WorkforceHub connects a modern React web portal to a live SAP NetWeaver ABAP system via a dedicated Backend-For-Frontend (BFF) gateway.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className="status-badge status-approved" style={{ marginBottom: '8px', display: 'inline-block' }}>Tier 1: Frontend</span>
                <h5 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>React.js + Vite</h5>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '18px' }}>
                  <li>Executive Dashboard & KPI analytics</li>
                  <li>Employee directory with search & filters</li>
                  <li>Leave approval workflows for HR Admin</li>
                  <li>Self-service leave portal for employees</li>
                </ul>
              </div>

              <div style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className="status-badge status-pending" style={{ marginBottom: '8px', display: 'inline-block' }}>Tier 2: Middleware</span>
                <h5 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>Node.js Express BFF</h5>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '18px' }}>
                  <li>Solves browser CORS limitations</li>
                  <li>Hides SAP system credentials securely</li>
                  <li>Manages SAP CSRF security tokens</li>
                  <li>Normalizes SAP OData date formats</li>
                </ul>
              </div>

              <div style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className="status-badge status-approved" style={{ marginBottom: '8px', display: 'inline-block' }}>Tier 3: Backend</span>
                <h5 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>SAP NetWeaver Gateway</h5>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '18px' }}>
                  <li>SE11 Transparent database tables</li>
                  <li>SEGW OData Service: <code>ZEMPLOYEE_SRV_SRV</code></li>
                  <li>SE24 ABAP class: <code>ZCL_ZEMPLOYEE_SRV_DPC_EXT</code></li>
                  <li>Direct OpenSQL read, insert, and update operations</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SE11 Database Tables */}
        {activeTab === 'tables' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              ABAP Data Dictionary (SE11)
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              Transparent database tables created under package <code>Z_PARAG_REST</code> storing master and transactional records:
            </p>

            <div className="table-scroll-wrap" style={{ marginBottom: '20px' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>TABLE NAME</th>
                    <th>TYPE</th>
                    <th>KEY FIELDS</th>
                    <th>DATA FIELDS</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>ZEMPLY_MNG_DBTAB</code></td>
                    <td><span className="status-badge status-approved">Transparent Table</span></td>
                    <td><code>MANDT</code>, <code>EMPID</code></td>
                    <td><code>NAME</code>, <code>EMAIL</code>, <code>DEPT</code>, <code>SALARY</code>, <code>STATUS</code></td>
                    <td>Employee Master Data (Stores all 7 department staff members)</td>
                  </tr>
                  <tr>
                    <td><code>ZEMPLY_LEAVE_TAB</code></td>
                    <td><span className="status-badge status-approved">Transparent Table</span></td>
                    <td><code>MANDT</code>, <code>LEAVE_ID</code></td>
                    <td><code>EMPID</code>, <code>LEAVE_TYPE</code>, <code>START_DATE</code>, <code>END_DATE</code>, <code>DAYS_COUNT</code>, <code>REASON</code>, <code>STATUS</code></td>
                    <td>Leave Transaction Data (Stores child leave requests linked by EMPID)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SEGW OData Service */}
        {activeTab === 'odata' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              SAP Gateway Service Builder (SEGW)
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              OData v2 service generated in SEGW under Project <code>ZEMPLOYEE_SRV</code>:
            </p>

            <div className="table-scroll-wrap" style={{ marginBottom: '16px' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>ENTITY SET NAME</th>
                    <th>ENTITY TYPE</th>
                    <th>SOURCE TABLE</th>
                    <th>HTTP METHODS</th>
                    <th>ODATA ENDPOINT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>ZEMPLY_MNG_DBTABSet</code></td>
                    <td><code>ZEMPLY_MNG_DBTAB</code></td>
                    <td><code>ZEMPLY_MNG_DBTAB</code></td>
                    <td><code>GET</code>, <code>PUT</code>, <code>POST</code></td>
                    <td><code>/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet</code></td>
                  </tr>
                  <tr>
                    <td><code>LeaveRequestCollection</code></td>
                    <td><code>LeaveRequest</code></td>
                    <td><code>ZEMPLY_LEAVE_TAB</code></td>
                    <td><code>GET</code>, <code>POST</code>, <code>PUT</code></td>
                    <td><code>/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/LeaveRequestCollection</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SE24 DPC_EXT Class */}
        {activeTab === 'abap' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              ABAP Data Provider Extension Class (SE24)
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              Subclass <code>ZCL_ZEMPLOYEE_SRV_DPC_EXT</code> inheriting from <code>ZCL_ZEMPLOYEE_SRV_DPC</code> implementing core CRUD operations:
            </p>

            <div className="table-scroll-wrap" style={{ marginBottom: '16px' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>OPERATION</th>
                    <th>REDEFINED METHOD</th>
                    <th>SQL STATEMENT</th>
                    <th>FUNCTIONALITY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="status-badge status-approved">READ</span></td>
                    <td><code>zemply_mng_dbtab_get_entityset</code></td>
                    <td><code>SELECT * FROM zemply_mng_dbtab</code></td>
                    <td>Queries and returns all 7 employee records to OData</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-approved">READ</span></td>
                    <td><code>/iwbep/if_mgw_appl_srv_runtime~get_entityset</code></td>
                    <td><code>SELECT * FROM zemply_leave_tab</code></td>
                    <td>Intercepts <code>LeaveRequestCollection</code> and returns leave records</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-pending">CREATE</span></td>
                    <td><code>/iwbep/if_mgw_appl_srv_runtime~create_entity</code></td>
                    <td><code>INSERT zemply_leave_tab FROM ls_leave</code></td>
                    <td>Inserts new leave requests submitted from the web portal</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-pending">UPDATE</span></td>
                    <td><code>/iwbep/if_mgw_appl_srv_runtime~update_entity</code></td>
                    <td><code>UPDATE zemply_leave_tab FROM ls_leave_upd</code></td>
                    <td>Updates leave approval status (APPROVED / REJECTED) and employee raises</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Node.js BFF Gateway */}
        {activeTab === 'bff' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              Node.js Express API Gateway (BFF)
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              Middleware server running on port 5000 providing security and protocol translation:
            </p>

            <div className="table-scroll-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>FEATURE</th>
                    <th>PURPOSE</th>
                    <th>IMPLEMENTATION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>CORS Resolution</strong></td>
                    <td>Enables browser clients to communicate across origins safely</td>
                    <td><code>app.use(cors())</code> middleware</td>
                  </tr>
                  <tr>
                    <td><strong>Credential Shielding</strong></td>
                    <td>Keeps SAP username/password hidden from client-side code</td>
                    <td>Node.js server-side Basic Auth header injection</td>
                  </tr>
                  <tr>
                    <td><strong>CSRF Protection</strong></td>
                    <td>Manages <code>x-csrf-token</code> handshake for write operations</td>
                    <td><code>getSapCsrfToken()</code> pre-fetch handshake before POST/PUT</td>
                  </tr>
                  <tr>
                    <td><strong>Data Composition</strong></td>
                    <td>Binds child leaves under parent employees by EMPID</td>
                    <td><code>getLiveSapWorkforce()</code> joins datasets into cohesive JSON</td>
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
