*&---------------------------------------------------------------------*
*& Class: ZCL_ZEMPLOYEE_SRV_DPC_EXT
*& Description: Data Provider Class Extension for Employee & Leave Service
*& Project: SAP Workforce & Leave Management (Classic Gateway / SEGW)
*& Author: Arbab Rizvi
*&---------------------------------------------------------------------*
CLASS zcl_zemployee_srv_dpc_ext DEFINITION
  PUBLIC
  INHERITING FROM zcl_zemployee_srv_dpc
  CREATE PUBLIC .

  PUBLIC SECTION.
    METHODS:
      /iwbep/if_mgw_appl_srv_runtime~execute_action REDEFINITION.

  PROTECTED SECTION.
    METHODS:
      employeeset_get_entityset    REDEFINITION,
      employeeset_get_entity       REDEFINITION,
      employeeset_create_entity    REDEFINITION,
      employeeset_update_entity    REDEFINITION,
      employeeset_delete_entity    REDEFINITION,

      leaverequestset_get_entityset REDEFINITION,
      leaverequestset_get_entity    REDEFINITION,
      leaverequestset_create_entity REDEFINITION,
      leaverequestset_update_entity REDEFINITION,
      leaverequestset_delete_entity REDEFINITION.

  PRIVATE SECTION.
ENDCLASS.



CLASS zcl_zemployee_srv_dpc_ext IMPLEMENTATION.

* ======================================================================
* 1. GET_ENTITYSET: Read all employees (with filtering and sorting)
* ======================================================================
  METHOD employeeset_get_entityset.
    DATA: lt_db_emp TYPE TABLE OF zemply_mng_tab,
          ls_db_emp TYPE zemply_mng_tab,
          ls_entity TYPE zcl_zemployee_srv_mpc=>ts_employee.

    " Fetch records from Transparent Table
    SELECT * FROM zemply_mng_tab INTO TABLE lt_db_emp.

    IF sy-subrc <> 0.
      " Table is empty or no records found
      RETURN.
    ENDIF.

    " Map database fields to Gateway Entity Set Properties
    LOOP AT lt_db_emp INTO ls_db_emp.
      CLEAR ls_entity.
      ls_entity-empid       = ls_db_emp-empid.
      ls_entity-firstname   = ls_db_emp-first_name.
      ls_entity-lastname    = ls_db_emp-last_name.
      ls_entity-email       = ls_db_emp-email.
      ls_entity-department  = ls_db_emp-department.
      ls_entity-designation = ls_db_emp-designation.
      ls_entity-salary      = ls_db_emp-salary.
      ls_entity-currency    = ls_db_emp-currency.
      ls_entity-status      = ls_db_emp-status.

      IF ls_db_emp-hire_date IS NOT INITIAL.
        ls_entity-hiredate = ls_db_emp-hire_date.
      ENDIF.

      APPEND ls_entity TO et_entityset.
    ENDLOOP.
  ENDMETHOD.


* ======================================================================
* 2. GET_ENTITY: Read a single employee by Key (Empid)
* ======================================================================
  METHOD employeeset_get_entity.
    DATA: lv_empid  TYPE zemply_mng_tab-empid,
          ls_db_emp TYPE zemply_mng_tab,
          ls_key    TYPE /iwbep/s_mgw_name_value_pair.

    " Read key property from incoming request
    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'Empid'.
    IF sy-subrc = 0.
      lv_empid = ls_key-value.
    ELSE.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>business_error.
    ENDIF.

    " Fetch record from transparent table
    SELECT SINGLE * FROM zemply_mng_tab
      INTO ls_db_emp
      WHERE empid = lv_empid.

    IF sy-subrc <> 0.
      " Return 404 Not Found error
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.

    " Map database record to outgoing entity structure
    er_entity-empid       = ls_db_emp-empid.
    er_entity-firstname   = ls_db_emp-first_name.
    er_entity-lastname    = ls_db_emp-last_name.
    er_entity-email       = ls_db_emp-email.
    er_entity-department  = ls_db_emp-department.
    er_entity-designation = ls_db_emp-designation.
    er_entity-salary      = ls_db_emp-salary.
    er_entity-currency    = ls_db_emp-currency.
    er_entity-status      = ls_db_emp-status.
    er_entity-hiredate    = ls_db_emp-hire_date.
  ENDMETHOD.


* ======================================================================
* 3. CREATE_ENTITY: Create new employee (POST /EmployeeSet)
* ======================================================================
  METHOD employeeset_create_entity.
    DATA: ls_payload TYPE zcl_zemployee_srv_mpc=>ts_employee,
          ls_db_emp  TYPE zemply_mng_tab.

    " Deserialize incoming JSON payload into ABAP structure
    io_data_provider->read_entry_data( IMPORTING es_data = ls_payload ).

    IF ls_payload-empid IS INITIAL.
      " Auto-generate or validate ID
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>business_error.
    ENDIF.

    " Check for duplicate
    SELECT SINGLE empid FROM zemply_mng_tab INTO @DATA(lv_exists) WHERE empid = @ls_payload-empid.
    IF sy-subrc = 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>business_error.
    ENDIF.

    " Map payload to DB table
    ls_db_emp-mandt       = sy-mandt.
    ls_db_emp-empid       = ls_payload-empid.
    ls_db_emp-first_name  = ls_payload-firstname.
    ls_db_emp-last_name   = ls_payload-lastname.
    ls_db_emp-email       = ls_payload-email.
    ls_db_emp-department  = ls_payload-department.
    ls_db_emp-designation = ls_payload-designation.
    ls_db_emp-salary      = ls_payload-salary.
    ls_db_emp-currency    = COND #( WHEN ls_payload-currency IS NOT INITIAL THEN ls_payload-currency ELSE 'USD' ).
    ls_db_emp-status      = COND #( WHEN ls_payload-status IS NOT INITIAL THEN ls_payload-status ELSE 'ACTIVE' ).
    ls_db_emp-hire_date   = COND #( WHEN ls_payload-hiredate IS NOT INITIAL THEN ls_payload-hiredate ELSE sy-datum ).

    INSERT zemply_mng_tab FROM ls_db_emp.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>business_error.
    ENDIF.

    " Return created entity
    er_entity = ls_payload.
    er_entity-status = ls_db_emp-status.
    er_entity-currency = ls_db_emp-currency.
  ENDMETHOD.


* ======================================================================
* 4. UPDATE_ENTITY: Update employee details (PUT /EmployeeSet('100101'))
* ======================================================================
  METHOD employeeset_update_entity.
    DATA: ls_payload TYPE zcl_zemployee_srv_mpc=>ts_employee,
          lv_empid   TYPE zemply_mng_tab-empid,
          ls_key     TYPE /iwbep/s_mgw_name_value_pair,
          ls_db_emp  TYPE zemply_mng_tab.

    " Read key property from incoming request
    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'Empid'.
    IF sy-subrc = 0.
      lv_empid = ls_key-value.
    ENDIF.

    " Read incoming update payload
    io_data_provider->read_entry_data( IMPORTING es_data = ls_payload ).

    SELECT SINGLE * FROM zemply_mng_tab INTO ls_db_emp WHERE empid = lv_empid.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.

    " Apply updates
    IF ls_payload-firstname IS NOT INITIAL.   ls_db_emp-first_name  = ls_payload-firstname. ENDIF.
    IF ls_payload-lastname IS NOT INITIAL.    ls_db_emp-last_name   = ls_payload-lastname. ENDIF.
    IF ls_payload-email IS NOT INITIAL.       ls_db_emp-email       = ls_payload-email. ENDIF.
    IF ls_payload-department IS NOT INITIAL.  ls_db_emp-department  = ls_payload-department. ENDIF.
    IF ls_payload-designation IS NOT INITIAL. ls_db_emp-designation = ls_payload-designation. ENDIF.
    IF ls_payload-salary > 0.                 ls_db_emp-salary      = ls_payload-salary. ENDIF.
    IF ls_payload-status IS NOT INITIAL.      ls_db_emp-status      = ls_payload-status. ENDIF.

    UPDATE zemply_mng_tab FROM ls_db_emp.

    er_entity = ls_payload.
    er_entity-empid = lv_empid.
  ENDMETHOD.


* ======================================================================
* 5. DELETE_ENTITY: Delete employee and cascading leaves
* ======================================================================
  METHOD employeeset_delete_entity.
    DATA: lv_empid TYPE zemply_mng_tab-empid,
          ls_key   TYPE /iwbep/s_mgw_name_value_pair.

    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'Empid'.
    IF sy-subrc = 0.
      lv_empid = ls_key-value.
    ENDIF.

    " Delete cascading leave records first
    DELETE FROM zemply_leave_tab WHERE empid = lv_empid.

    " Delete employee master record
    DELETE FROM zemply_mng_tab WHERE empid = lv_empid.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.
  ENDMETHOD.


* ======================================================================
* 6. LEAVEREQUESTSET_GET_ENTITYSET: Read all leave requests
* ======================================================================
  METHOD leaverequestset_get_entityset.
    DATA: lt_db_leave TYPE TABLE OF zemply_leave_tab,
          ls_db_leave TYPE zemply_leave_tab,
          ls_entity   TYPE zcl_zemployee_srv_mpc=>ts_leaverequest,
          lv_empid    TYPE zemply_leave_tab-empid,
          ls_key      TYPE /iwbep/s_mgw_name_value_pair.

    " Check if accessed via navigation from EmployeeSet('100101')/LeaveRequests
    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'Empid'.
    IF sy-subrc = 0.
      lv_empid = ls_key-value.
      SELECT * FROM zemply_leave_tab INTO TABLE lt_db_leave WHERE empid = lv_empid.
    ELSE.
      SELECT * FROM zemply_leave_tab INTO TABLE lt_db_leave.
    ENDIF.

    LOOP AT lt_db_leave INTO ls_db_leave.
      CLEAR ls_entity.
      ls_entity-leaveid   = ls_db_leave-leave_id.
      ls_entity-empid     = ls_db_leave-empid.
      ls_entity-leavetype = ls_db_leave-leave_type.
      ls_entity-startdate = ls_db_leave-start_date.
      ls_entity-enddate   = ls_db_leave-end_date.
      ls_entity-dayscount = ls_db_leave-days_count.
      ls_entity-reason    = ls_db_leave-reason.
      ls_entity-status    = ls_db_leave-status.
      ls_entity-appliedon = ls_db_leave-applied_on.
      APPEND ls_entity TO et_entityset.
    ENDLOOP.
  ENDMETHOD.


* ======================================================================
* 7. LEAVEREQUESTSET_GET_ENTITY: Read single leave request
* ======================================================================
  METHOD leaverequestset_get_entity.
    DATA: lv_leaveid  TYPE zemply_leave_tab-leave_id,
          ls_db_leave TYPE zemply_leave_tab,
          ls_key      TYPE /iwbep/s_mgw_name_value_pair.

    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'LeaveId'.
    IF sy-subrc = 0.
      lv_leaveid = ls_key-value.
    ENDIF.

    SELECT SINGLE * FROM zemply_leave_tab INTO ls_db_leave WHERE leave_id = lv_leaveid.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.

    er_entity-leaveid   = ls_db_leave-leave_id.
    er_entity-empid     = ls_db_leave-empid.
    er_entity-leavetype = ls_db_leave-leave_type.
    er_entity-startdate = ls_db_leave-start_date.
    er_entity-enddate   = ls_db_leave-end_date.
    er_entity-dayscount = ls_db_leave-days_count.
    er_entity-reason    = ls_db_leave-reason.
    er_entity-status    = ls_db_leave-status.
    er_entity-appliedon = ls_db_leave-applied_on.
  ENDMETHOD.


* ======================================================================
* 8. LEAVEREQUESTSET_CREATE_ENTITY: Submit new leave request
* ======================================================================
  METHOD leaverequestset_create_entity.
    DATA: ls_payload  TYPE zcl_zemployee_srv_mpc=>ts_leaverequest,
          ls_db_leave TYPE zemply_leave_tab,
          lv_days     TYPE i.

    io_data_provider->read_entry_data( IMPORTING es_data = ls_payload ).

    " Calculate leave days: EndDate - StartDate + 1
    IF ls_payload-enddate >= ls_payload-startdate.
      lv_days = ls_payload-enddate - ls_payload-startdate + 1.
    ELSE.
      lv_days = 1.
    ENDIF.

    " Generate ID if missing
    IF ls_payload-leaveid IS INITIAL.
      ls_payload-leaveid = |L-{ sy-uzeit }|.
    ENDIF.

    ls_db_leave-mandt      = sy-mandt.
    ls_db_leave-leave_id   = ls_payload-leaveid.
    ls_db_leave-empid      = ls_payload-empid.
    ls_db_leave-leave_type = ls_payload-leavetype.
    ls_db_leave-start_date = ls_payload-startdate.
    ls_db_leave-end_date   = ls_payload-enddate.
    ls_db_leave-days_count = lv_days.
    ls_db_leave-reason     = ls_payload-reason.
    ls_db_leave-status     = 'PENDING'.
    ls_db_leave-applied_on = sy-datum.

    INSERT zemply_leave_tab FROM ls_db_leave.

    er_entity = ls_payload.
    er_entity-dayscount = lv_days.
    er_entity-status    = 'PENDING'.
    er_entity-appliedon = sy-datum.
  ENDMETHOD.


* ======================================================================
* 9. LEAVEREQUESTSET_UPDATE_ENTITY: Update leave status
* ======================================================================
  METHOD leaverequestset_update_entity.
    DATA: ls_payload  TYPE zcl_zemployee_srv_mpc=>ts_leaverequest,
          lv_leaveid  TYPE zemply_leave_tab-leave_id,
          ls_key      TYPE /iwbep/s_mgw_name_value_pair,
          ls_db_leave TYPE zemply_leave_tab.

    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'LeaveId'.
    IF sy-subrc = 0.
      lv_leaveid = ls_key-value.
    ENDIF.

    io_data_provider->read_entry_data( IMPORTING es_data = ls_payload ).

    SELECT SINGLE * FROM zemply_leave_tab INTO ls_db_leave WHERE leave_id = lv_leaveid.
    IF sy-subrc = 0.
      IF ls_payload-status IS NOT INITIAL.
        ls_db_leave-status = ls_payload-status.
      ENDIF.
      UPDATE zemply_leave_tab FROM ls_db_leave.
    ENDIF.

    er_entity = ls_payload.
    er_entity-leaveid = lv_leaveid.
  ENDMETHOD.


* ======================================================================
* 10. LEAVEREQUESTSET_DELETE_ENTITY: Delete leave request
* ======================================================================
  METHOD leaverequestset_delete_entity.
    DATA: lv_leaveid TYPE zemply_leave_tab-leave_id,
          ls_key     TYPE /iwbep/s_mgw_name_value_pair.

    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'LeaveId'.
    IF sy-subrc = 0.
      lv_leaveid = ls_key-value.
    ENDIF.

    DELETE FROM zemply_leave_tab WHERE leave_id = lv_leaveid.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid = /iwbep/cx_mgw_busi_exception=>resource_not_found.
    ENDIF.
  ENDMETHOD.


* ======================================================================
* 11. EXECUTE_ACTION: Custom Function Imports (GiveRaise & ApproveLeave)
* ======================================================================
  METHOD /iwbep/if_mgw_appl_srv_runtime~execute_action.
    DATA: lv_action_name TYPE string,
          ls_parameter   TYPE /iwbep/s_mgw_name_value_pair.

    lv_action_name = iv_action_name.

    " ------------------------------------------------------------------
    " Action 1: GiveRaise(Empid, PercentageRaise)
    " ------------------------------------------------------------------
    IF lv_action_name = 'GiveRaise'.
      DATA: lv_empid TYPE zemply_mng_tab-empid,
            lv_pct   TYPE p DECIMALS 2,
            ls_emp   TYPE zemply_mng_tab,
            ls_res   TYPE zcl_zemployee_srv_mpc=>ts_employee.

      READ TABLE it_parameter INTO ls_parameter WITH KEY name = 'Empid'.
      IF sy-subrc = 0. lv_empid = ls_parameter-value. ENDIF.

      READ TABLE it_parameter INTO ls_parameter WITH KEY name = 'PercentageRaise'.
      IF sy-subrc = 0. lv_pct = ls_parameter-value. ENDIF.

      SELECT SINGLE * FROM zemply_mng_tab INTO ls_emp WHERE empid = lv_empid.
      IF sy-subrc = 0.
        " Calculate new compensation: Salary + (Salary * Pct / 100)
        ls_emp-salary = ls_emp-salary * ( 1 + ( lv_pct / 100 ) ).
        UPDATE zemply_mng_tab FROM ls_emp.

        " Prepare return entity
        ls_res-empid       = ls_emp-empid.
        ls_res-firstname   = ls_emp-first_name.
        ls_res-lastname    = ls_emp-last_name.
        ls_res-email       = ls_emp-email.
        ls_res-department  = ls_emp-department.
        ls_res-designation = ls_emp-designation.
        ls_res-salary      = ls_emp-salary.
        ls_res-currency    = ls_emp-currency.
        ls_res-status      = ls_emp-status.
        ls_res-hiredate    = ls_emp-hire_date.

        copy_data_to_ref( EXPORTING is_data = ls_res CHANGING cr_data = er_data ).
      ENDIF.

    " ------------------------------------------------------------------
    " Action 2: ApproveLeave(LeaveId, Empid)
    " ------------------------------------------------------------------
    ELSEIF lv_action_name = 'ApproveLeave'.
      DATA: lv_leaveid  TYPE zemply_leave_tab-leave_id,
            ls_leave    TYPE zemply_leave_tab,
            ls_leave_res TYPE zcl_zemployee_srv_mpc=>ts_leaverequest.

      READ TABLE it_parameter INTO ls_parameter WITH KEY name = 'LeaveId'.
      IF sy-subrc = 0. lv_leaveid = ls_parameter-value. ENDIF.

      SELECT SINGLE * FROM zemply_leave_tab INTO ls_leave WHERE leave_id = lv_leaveid.
      IF sy-subrc = 0.
        ls_leave-status = 'APPROVED'.
        UPDATE zemply_leave_tab FROM ls_leave.

        ls_leave_res-leaveid   = ls_leave-leave_id.
        ls_leave_res-empid     = ls_leave-empid.
        ls_leave_res-leavetype = ls_leave-leave_type.
        ls_leave_res-startdate = ls_leave-start_date.
        ls_leave_res-enddate   = ls_leave-end_date.
        ls_leave_res-dayscount = ls_leave-days_count.
        ls_leave_res-reason    = ls_leave-reason.
        ls_leave_res-status    = ls_leave-status.
        ls_leave_res-appliedon = ls_leave-applied_on.

        copy_data_to_ref( EXPORTING is_data = ls_leave_res CHANGING cr_data = er_data ).
      ENDIF.
    ENDIF.

  ENDMETHOD.

ENDCLASS.
