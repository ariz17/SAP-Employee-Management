import React, { useState } from 'react';
import { Layers, Database, Code, GitBranch, Globe } from 'lucide-react';
import { ODATA_CONFIG } from '../utils/odataConfig';

export function ArchitectureView() {
  const [activeTab, setActiveTab] = useState('model');

  return (
    <div className="view-content-wrapper">
      <div className="table-container-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="avatar-large" style={{ background: 'linear-gradient(135deg, var(--primary-color), #2563eb)' }}>
            <Layers size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>SAP ABAP RAP Architecture</h2>
            <p className="table-card-subtitle">
              ABAP Managed RESTful Application Programming Model (RAP) on SAP BTP ABAP Environment
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="status-tabs-wrap" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '6px' }}>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'model' ? 'active' : ''}`}
            onClick={() => setActiveTab('model')}
          >
            <Database size={13} style={{ display: 'inline', marginRight: '4px' }} />
            1. CDS Data Model
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavior')}
          >
            <Code size={13} style={{ display: 'inline', marginRight: '4px' }} />
            2. ABAP Behavior (BDEF)
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'abap' ? 'active' : ''}`}
            onClick={() => setActiveTab('abap')}
          >
            <GitBranch size={13} style={{ display: 'inline', marginRight: '4px' }} />
            3. ABAP Class (Handler)
          </button>
          <button
            type="button"
            className={`status-tab-btn ${activeTab === 'odata' ? 'active' : ''}`}
            onClick={() => setActiveTab('odata')}
          >
            <Globe size={13} style={{ display: 'inline', marginRight: '4px' }} />
            4. OData V4 Endpoints
          </button>
        </div>

        {/* TAB 1: CDS Data Model & Composition */}
        {activeTab === 'model' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              Two-Tier CDS Composition Model
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              The ABAP Dictionary tables and their mapping to CDS Interface Views (I-Layer) and CDS Projection Views (C-Layer):
            </p>

            {/* Tables */}
            <div className="table-scroll-wrap" style={{ marginBottom: '16px' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>LAYER</th>
                    <th>ABAP OBJECT NAME</th>
                    <th>TYPE</th>
                    <th>TABLE / SOURCE</th>
                    <th>PURPOSE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="status-badge status-approved">DB</span></td>
                    <td><code>zemply_mng_dbtab</code></td>
                    <td>Transparent Table</td>
                    <td>—</td>
                    <td>Stores employee master data (empid, name, email, dept, salary, joindate, status)</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-approved">DB</span></td>
                    <td><code>zemply_leave_tab</code></td>
                    <td>Transparent Table</td>
                    <td>—</td>
                    <td>Stores child leave records (leaveid, empid, leavetype, startdate, enddate, dayscount, reason, status)</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-pending">I-View</span></td>
                    <td><code>ZI_EMPLOYEE_DETAILS</code></td>
                    <td>Root View Entity</td>
                    <td>zemply_mng_dbtab</td>
                    <td>Interface view — defines composition [0..*] of ZI_EMPLOYEE_LEAVE as _Leave</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-pending">I-View</span></td>
                    <td><code>ZI_EMPLOYEE_LEAVE</code></td>
                    <td>Child View Entity</td>
                    <td>zemply_leave_tab</td>
                    <td>Interface child view — association to parent ZI_EMPLOYEE_DETAILS as _Employee</td>
                  </tr>
                  <tr>
                    <td><span className="dept-pill">C-View</span></td>
                    <td><code>ZC_EMPLOYEE_DETAILS</code></td>
                    <td>Projection View (Root)</td>
                    <td>ZI_EMPLOYEE_DETAILS</td>
                    <td>Consumption view — provider contract: transactional_query. Contains @UI annotations for Fiori List Report.</td>
                  </tr>
                  <tr>
                    <td><span className="dept-pill">C-View</span></td>
                    <td><code>ZC_EMPLOYEE_LEAVE</code></td>
                    <td>Projection View (Child)</td>
                    <td>ZI_EMPLOYEE_LEAVE</td>
                    <td>Consumption child view — provider contract: transactional_query. @UI annotations for line item display.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="code-box-clean">
              <span style={{ color: '#10b981', fontWeight: 700 }}>// ZI_EMPLOYEE_565.ddls — Root Interface View</span><br />
              <br />
              define root view entity <span style={{ color: '#fbbf24' }}>ZI_EMPLOYEE_DETAILS</span><br />
              &nbsp;&nbsp;as select from <span style={{ color: '#a5f3fc' }}>zemply_mng_dbtab</span><br />
              &nbsp;&nbsp;composition [0..*] of <span style={{ color: '#fbbf24' }}>ZI_EMPLOYEE_LEAVE</span> as <span style={{ color: '#818cf8' }}>_Leave</span><br />
              {'{'}<br />
              &nbsp;&nbsp;key empid    as Empid,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name     as Name,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dept     as Dept,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;salary   as Salary,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;joindate as Joindate,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;status   as Status,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#818cf8' }}>_Leave</span>  <span style={{ color: '#6b7280' }}>// composition association</span><br />
              {'}'}
            </div>
          </div>
        )}

        {/* TAB 2: Behavior Definition (BDEF) */}
        {activeTab === 'behavior' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              Behavior Definition — <code>ZI_EMPLOYEE_565.bdef</code>
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              Managed behavior definition for the RAP Business Object. Defines CRUD, custom Actions, Determinations, and Validations.
            </p>

            <div className="code-box-clean" style={{ marginBottom: '16px' }}>
              managed implementation in class <span style={{ color: '#38bdf8' }}>zbp_i_employee_details</span> unique;<br />
              strict ( 2 );<br />
              <br />
              define behavior for <span style={{ color: '#fbbf24' }}>ZI_EMPLOYEE_DETAILS</span><br />
              persistent table <span style={{ color: '#a5f3fc' }}>zemply_mng_dbtab</span><br />
              lock master<br />
              authorization master ( instance )<br />
              {'{'}<br />
              &nbsp;&nbsp;create; update; delete;<br />
              &nbsp;&nbsp;field ( readonly ) Empid;<br />
              &nbsp;&nbsp;association _Leave {'{'} create; {'}'}<br />
              <br />
              &nbsp;&nbsp;<span style={{ color: '#f59e0b' }}>// Custom ABAP Business Actions</span><br />
              &nbsp;&nbsp;action <span style={{ color: '#34d399' }}>giveRaise</span> parameter ZD_RAISE_PARAM result [1] $self;<br />
              &nbsp;&nbsp;action <span style={{ color: '#34d399' }}>changeStatus</span> result [1] $self;<br />
              <br />
              &nbsp;&nbsp;<span style={{ color: '#f59e0b' }}>// Determinations (run automatically on event)</span><br />
              &nbsp;&nbsp;determination <span style={{ color: '#818cf8' }}>setDefaultStatus</span> on modify {'{'} create; {'}'}<br />
              <br />
              &nbsp;&nbsp;<span style={{ color: '#f59e0b' }}>// Validations (run on ETag-driven save)</span><br />
              &nbsp;&nbsp;validation <span style={{ color: '#fb7185' }}>validateSalary</span> on save {'{'} create; update; {'}'}<br />
              {'}'}<br />
              <br />
              define behavior for <span style={{ color: '#fbbf24' }}>ZI_EMPLOYEE_LEAVE</span><br />
              persistent table <span style={{ color: '#a5f3fc' }}>zemply_leave_tab</span><br />
              lock dependent by _Employee<br />
              authorization dependent by _Employee<br />
              {'{'}<br />
              &nbsp;&nbsp;update; delete;<br />
              &nbsp;&nbsp;field ( readonly ) LeaveId, Empid;<br />
              &nbsp;&nbsp;association _Employee;<br />
              <br />
              &nbsp;&nbsp;action <span style={{ color: '#34d399' }}>approveLeave</span> result [1] $self;<br />
              &nbsp;&nbsp;determination <span style={{ color: '#818cf8' }}>calculateLeaveDays</span> on modify {'{'} create; update; {'}'}<br />
              &nbsp;&nbsp;validation <span style={{ color: '#fb7185' }}>validateDates</span> on save {'{'} create; update; {'}'}<br />
              {'}'}
            </div>

            <div className="table-scroll-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>ABAP RAP FEATURE</th>
                    <th>NAME</th>
                    <th>TRIGGER EVENT</th>
                    <th>WHAT IT DOES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="status-badge status-approved">Action</span></td>
                    <td><code>giveRaise</code></td>
                    <td>Button click in UI</td>
                    <td>Reads <code>percentage_raise</code> from parameter, multiplies current Salary, writes back via MODIFY ENTITIES</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-approved">Action</span></td>
                    <td><code>changeStatus</code></td>
                    <td>Button click in UI</td>
                    <td>Cycles employee Status: ACTIVE → ON_LEAVE → INACTIVE → ACTIVE using COND expression</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-approved">Action</span></td>
                    <td><code>approveLeave</code></td>
                    <td>Manager clicks Approve</td>
                    <td>Sets leave Status = 'APPROVED' via MODIFY ENTITIES on child entity ZI_EMPLOYEE_LEAVE</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-pending">Determination</span></td>
                    <td><code>setDefaultStatus</code></td>
                    <td>On CREATE</td>
                    <td>Automatically sets Status = 'ACTIVE' if field is initial — fired by RAP framework on save</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-pending">Determination</span></td>
                    <td><code>calculateLeaveDays</code></td>
                    <td>On MODIFY (create/update)</td>
                    <td>Auto-computes DaysCount = EndDate − StartDate + 1 using ABAP date arithmetic</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-rejected">Validation</span></td>
                    <td><code>validateSalary</code></td>
                    <td>On SAVE</td>
                    <td>Raises RAP error message if Salary ≤ 0 or Salary {'>'} 9,999,999 using failed/reported tables</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-rejected">Validation</span></td>
                    <td><code>validateDates</code></td>
                    <td>On SAVE</td>
                    <td>Raises error if StartDate {'>'} EndDate — prevents invalid leave periods from being persisted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ABAP Class / Behavior Pool */}
        {activeTab === 'abap' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              ABAP Behavior Pool — <code>ZBP_I_EMPLOYEE_DETAILS</code>
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              The ABAP class that implements all behavior methods. Contains two local handler classes (LHC) — one for the root entity and one for the child Leave entity.
            </p>

            <div className="code-box-clean" style={{ marginBottom: '16px' }}>
              <span style={{ color: '#10b981' }}>{'/* ================================================================'}</span><br />
              <span style={{ color: '#10b981' }}>{'   Local Handler: Root Employee Entity (lhc_employee)'}</span><br />
              <span style={{ color: '#10b981' }}>{'================================================================ */'}</span><br />
              <br />
              <span style={{ color: '#818cf8' }}>METHOD</span> giveRaise.<br />
              &nbsp;&nbsp;READ ENTITIES OF zi_employee_details IN LOCAL MODE<br />
              &nbsp;&nbsp;&nbsp;&nbsp;ENTITY zi_employee_details<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FIELDS ( Salary ) WITH CORRESPONDING #( keys )<br />
              &nbsp;&nbsp;&nbsp;&nbsp;RESULT DATA(<span style={{ color: '#a5f3fc' }}>lt_employees</span>).<br />
              <br />
              &nbsp;&nbsp;LOOP AT lt_employees INTO DATA(<span style={{ color: '#fbbf24' }}>ls_emp</span>).<br />
              &nbsp;&nbsp;&nbsp;&nbsp;DATA(lv_pct) = keys[ %tky = ls_emp-%tky ]-%param-<span style={{ color: '#34d399' }}>percentage_raise</span>.<br />
              &nbsp;&nbsp;&nbsp;&nbsp;DATA(lv_new_salary) = ls_emp-Salary * ( 1 + ( lv_pct / 100 ) ).<br />
              &nbsp;&nbsp;&nbsp;&nbsp;MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ENTITY zi_employee_details UPDATE FIELDS ( Salary )<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WITH VALUE #( ( %tky = ls_emp-%tky Salary = lv_new_salary ) ).<br />
              &nbsp;&nbsp;ENDLOOP.<br />
              <span style={{ color: '#818cf8' }}>ENDMETHOD.</span><br />
              <br />
              <span style={{ color: '#818cf8' }}>METHOD</span> setDefaultStatus.  <span style={{ color: '#6b7280' }}>"Determination</span><br />
              &nbsp;&nbsp;MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE<br />
              &nbsp;&nbsp;&nbsp;&nbsp;ENTITY zi_employee_details UPDATE FIELDS ( Status )<br />
              &nbsp;&nbsp;&nbsp;&nbsp;WITH VALUE #( FOR emp IN lt_employees WHERE ( Status IS INITIAL )<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ( %tky = emp-%tky Status = <span style={{ color: '#34d399' }}>'ACTIVE'</span> ) ).<br />
              <span style={{ color: '#818cf8' }}>ENDMETHOD.</span>
            </div>

            <div className="table-scroll-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>LOCAL HANDLER CLASS</th>
                    <th>METHOD</th>
                    <th>ABAP API USED</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>lhc_employee</code></td>
                    <td><code>giveRaise</code></td>
                    <td>READ ENTITIES, MODIFY ENTITIES IN LOCAL MODE</td>
                  </tr>
                  <tr>
                    <td><code>lhc_employee</code></td>
                    <td><code>changeStatus</code></td>
                    <td>COND expression, MODIFY ENTITIES IN LOCAL MODE</td>
                  </tr>
                  <tr>
                    <td><code>lhc_employee</code></td>
                    <td><code>setDefaultStatus</code></td>
                    <td>READ ENTITIES → MODIFY ENTITIES WHERE Status IS INITIAL</td>
                  </tr>
                  <tr>
                    <td><code>lhc_employee</code></td>
                    <td><code>validateSalary</code></td>
                    <td>failed-zi_employee_details, reported-zi_employee_details, new_message_with_text()</td>
                  </tr>
                  <tr>
                    <td><code>lhc_leave</code></td>
                    <td><code>approveLeave</code></td>
                    <td>MODIFY ENTITIES IN LOCAL MODE on child entity zi_employee_leave</td>
                  </tr>
                  <tr>
                    <td><code>lhc_leave</code></td>
                    <td><code>calculateLeaveDays</code></td>
                    <td>EndDate − StartDate + 1 (ABAP date arithmetic), MODIFY ENTITIES</td>
                  </tr>
                  <tr>
                    <td><code>lhc_leave</code></td>
                    <td><code>validateDates</code></td>
                    <td>Condition check, failed-zi_employee_leave, new_message_with_text()</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: OData V4 Endpoints */}
        {activeTab === 'odata' && (
          <div className="arch-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              OData V4 Service Binding — <code>ZUI_EMPLOYEE_SERVICE_565</code>
            </h4>
            <p className="text-muted-sm" style={{ marginBottom: '14px' }}>
              The SAP Service Binding publishes the RAP Business Object as an OData V4 service.
              This frontend currently runs with local mock data. When connected to SAP BTP ABAP Environment,
              the endpoints below will be used.
            </p>

            {/* Base URL */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Service Root URL (OData V4 Metadata)
              </div>
              <code style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--primary-color)' }}>
                {ODATA_CONFIG.SERVICE_URL}$metadata
              </code>
            </div>

            <div className="table-scroll-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>HTTP METHOD</th>
                    <th>ENDPOINT</th>
                    <th>RAP OPERATION</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>GET</span></td>
                    <td><code>/Employee?$expand=LeaveRequest</code></td>
                    <td>Read Collection</td>
                    <td>Fetch all employee records with inline leave history</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>GET</span></td>
                    <td><code>{"/Employee(Empid='100101')"}</code></td>
                    <td>Read by Key</td>
                    <td>Fetch single employee master record</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>POST</span></td>
                    <td><code>/Employee</code></td>
                    <td>Create (RAP: create)</td>
                    <td>Register new employee — triggers <code>setDefaultStatus</code> determination</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>PATCH</span></td>
                    <td><code>{"/Employee(Empid='100101')"}</code></td>
                    <td>Update (RAP: update)</td>
                    <td>Update fields — triggers <code>validateSalary</code> on save</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge status-rejected">DELETE</span></td>
                    <td><code>{"/Employee(Empid='100101')"}</code></td>
                    <td>Delete (RAP: delete)</td>
                    <td>Deletes employee + all composed child leave records</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>POST</span></td>
                    <td><code>{"/Employee(Empid='100101')/LeaveRequest"}</code></td>
                    <td>Create Child (Composition)</td>
                    <td>Creates leave for employee — triggers <code>calculateLeaveDays</code> determination</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>POST</span></td>
                    <td><code>{"/Employee(Empid='X')/com.sap.ZUI_EMPLOYEE_SERVICE_565.giveRaise"}</code></td>
                    <td>Custom Action: giveRaise</td>
                    <td>Bound action — body: <code>{"{ percentage_raise: 10 }"}</code></td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>POST</span></td>
                    <td><code>{"/Employee(Empid='X')/com.sap.ZUI_EMPLOYEE_SERVICE_565.changeStatus"}</code></td>
                    <td>Custom Action: changeStatus</td>
                    <td>Cycles status: ACTIVE → ON_LEAVE → INACTIVE → ACTIVE</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>POST</span></td>
                    <td><code>{"/Employee('X')/LeaveRequest('Y')/com.sap.ZUI_EMPLOYEE_SERVICE_565.approveLeave"}</code></td>
                    <td>Custom Action: approveLeave</td>
                    <td>Sets leave Status = 'APPROVED' on child entity</td>
                  </tr>
                  <tr>
                    <td><span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>GET</span></td>
                    <td><code>/$metadata</code></td>
                    <td>Service Metadata</td>
                    <td>OData V4 EDMX schema — auto-generated from CDS annotations by ABAP runtime</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note about frontend */}
            <div style={{
              marginTop: '16px',
              background: 'var(--color-info-bg)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '0.8rem',
              color: 'var(--color-info-text)'
            }}>
              <strong>Note:</strong> This React frontend simulates all OData operations using local in-browser state (mock data in <code>mockData.js</code>).
              To connect to the live ABAP backend, update <code>src/utils/odataConfig.js</code> with your SAP BTP ABAP tenant URL
              and replace the state management handlers in <code>App.jsx</code> with <code>fetch()</code> calls to the OData endpoints above.
              Authentication would use SAP BTP OAuth 2.0 (XSUAA) or Basic Auth with CSRF tokens.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
