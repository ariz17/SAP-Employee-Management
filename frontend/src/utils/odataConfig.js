/**
 * SAP ABAP OData V4 Service Configuration
 *
 * Service Name   : ZUI_EMPLOYEE_SERVICE_565
 * Binding Type   : OData V4 - UI (Service Binding)
 * Service Definition : ZUI_EMPLOYEE_SERVICE_565.srvd
 *
 * These URLs are auto-generated when the OData Service Binding is published
 * on SAP BTP ABAP Environment / S/4HANA Cloud.
 *
 * To connect this frontend to the live ABAP backend, replace the placeholder
 * host below with your actual SAP BTP ABAP service instance URL.
 */

/** ============================================================================
 *  Replace this with your actual SAP BTP ABAP Environment host, e.g.:
 *  https://<tenant>.abap.region.hana.ondemand.com
 *  ============================================================================ */
const SAP_BTP_HOST = 'https://<your-tenant>.abap.region.hana.ondemand.com';

const ODATA_SERVICE_BASE = `${SAP_BTP_HOST}/sap/opu/odata4/sap/ZUI_EMPLOYEE_SERVICE_565/srvd/sap/ZUI_EMPLOYEE_SERVICE_565/0001/`;

// Classic / Eclipse CDS OData V2 endpoint
export const ECLIPSE_CDS_SERVICE = {
  BASE_URL: '/sap/opu/odata/sap/ZI_EMPLOYEE_CDS',
  ENTITY_SET: '/sap/opu/odata/sap/ZI_EMPLOYEE_CDS/ZI_EMPLOYEE',
  METADATA: '/sap/opu/odata/sap/ZI_EMPLOYEE_CDS/$metadata'
};


export const ODATA_CONFIG = {
  /**
   * Service root URL — the metadata document is available here:
   * GET /sap/opu/odata4/sap/ZUI_EMPLOYEE_SERVICE_565/srvd/sap/ZUI_EMPLOYEE_SERVICE_565/0001/$metadata
   */
  SERVICE_URL: ODATA_SERVICE_BASE,

  /**
   * Entity Set: ZC_EMPLOYEE_DETAILS (Root CDS Projection View)
   * Operations supported via Managed RAP BDEF:
   *   GET  /Employee            → read collection
   *   GET  /Employee(Empid='X') → read single record
   *   POST /Employee            → create (RAP: create)
   *   PUT  /Employee(Empid='X') → update (RAP: update)
   *   DELETE /Employee(Empid='X') → delete (RAP: delete)
   */
  EMPLOYEE_ENTITY_SET: `${ODATA_SERVICE_BASE}Employee`,

  /**
   * Entity Set: ZC_EMPLOYEE_LEAVE (Child CDS Projection View — RAP Composition)
   * Operations supported via composition:
   *   GET  /Employee(Empid='X')/LeaveRequest            → read all leaves for employee
   *   POST /Employee(Empid='X')/LeaveRequest            → create new leave (RAP composition child)
   *   DELETE /Employee(Empid='X')/LeaveRequest(LeaveId='Y') → delete leave
   */
  LEAVE_ENTITY_SET: `${ODATA_SERVICE_BASE}LeaveRequest`,

  /**
   * Custom Actions (defined in behavior definition ZI_EMPLOYEE_565.bdef)
   * These are triggered as OData V4 bound actions via POST:
   *
   *   POST /Employee(Empid='X')/com.sap.ZUI_EMPLOYEE_SERVICE_565.giveRaise
   *   Body: { "percentage_raise": 10, "revision_reason": "Annual Appraisal" }
   *
   *   POST /Employee(Empid='X')/com.sap.ZUI_EMPLOYEE_SERVICE_565.changeStatus
   *
   *   POST /Employee(Empid='X')/LeaveRequest(LeaveId='Y')/com.sap.ZUI_EMPLOYEE_SERVICE_565.approveLeave
   */
  ACTIONS: {
    GIVE_RAISE: 'com.sap.ZUI_EMPLOYEE_SERVICE_565.giveRaise',
    CHANGE_STATUS: 'com.sap.ZUI_EMPLOYEE_SERVICE_565.changeStatus',
    APPROVE_LEAVE: 'com.sap.ZUI_EMPLOYEE_SERVICE_565.approveLeave',
  },

  /**
   * ABAP Class (Behavior Pool): ZBP_I_EMPLOYEE_DETAILS
   * All action, determination, and validation implementations live here.
   *
   * Determinations :
   *   - setDefaultStatus   → sets Status = 'ACTIVE' on create
   *   - calculateLeaveDays → computes DaysCount from StartDate - EndDate
   *
   * Validations :
   *   - validateSalary → ensures Salary > 0 and < 9,999,999 (fires on save)
   *   - validateDates  → ensures StartDate ≤ EndDate (fires on save)
   */
  BEHAVIOR_CLASS: 'ZBP_I_EMPLOYEE_DETAILS',

  /**
   * Common Query Options
   */
  QUERY_OPTIONS: {
    EXPAND_LEAVES: '$expand=LeaveRequest',
    ORDER_BY_EMPID: '$orderby=Empid',
    TOP_100: '$top=100',
    FORMAT_JSON: '$format=json',
  }
};

/**
 * Helper: Build a single-entity URL
 * @param {string} empid - Employee ID
 * @returns {string} Full OData URL for a single employee record
 * @example
 *   getSingleEmployeeUrl('100101')
 *   → .../Employee(Empid='100101')
 */
export function getSingleEmployeeUrl(empid) {
  return `${ODATA_CONFIG.EMPLOYEE_ENTITY_SET}(Empid='${empid}')`;
}

/**
 * Helper: Build the giveRaise action URL
 * @param {string} empid - Employee ID to give raise
 * @returns {string} Full OData V4 bound action URL
 */
export function getGiveRaiseUrl(empid) {
  return `${getSingleEmployeeUrl(empid)}/${ODATA_CONFIG.ACTIONS.GIVE_RAISE}`;
}

/**
 * Helper: Build the approveLeave action URL
 * @param {string} empid
 * @param {string} leaveId
 * @returns {string}
 */
export function getApproveLeaveUrl(empid, leaveId) {
  return `${getSingleEmployeeUrl(empid)}/LeaveRequest(LeaveId='${leaveId}')/${ODATA_CONFIG.ACTIONS.APPROVE_LEAVE}`;
}
