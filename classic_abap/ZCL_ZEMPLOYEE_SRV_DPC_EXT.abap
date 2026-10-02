CLASS zcl_zemployee_srv_dpc_ext DEFINITION
  PUBLIC
  INHERITING FROM zcl_zemployee_srv_dpc
  CREATE PUBLIC.

  PUBLIC SECTION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~get_entityset REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~create_entity REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~update_entity REDEFINITION.
    METHODS /iwbep/if_mgw_appl_srv_runtime~delete_entity REDEFINITION.

  PROTECTED SECTION.
    METHODS zemply_mng_dbtab_get_entityset REDEFINITION.

ENDCLASS.



CLASS zcl_zemployee_srv_dpc_ext IMPLEMENTATION.

  METHOD zemply_mng_dbtab_get_entityset.
    SELECT * FROM zemply_mng_dbtab INTO CORRESPONDING FIELDS OF TABLE et_entityset.
  ENDMETHOD.


  METHOD /iwbep/if_mgw_appl_srv_runtime~get_entityset.
    IF iv_entity_set_name = 'LeaveRequestCollection'.
      DATA lt_leave TYPE TABLE OF zemply_leave_tab.

      SELECT * FROM zemply_leave_tab INTO TABLE lt_leave.

      copy_data_to_ref(
        EXPORTING
          is_data = lt_leave
        CHANGING
          cr_data = er_entityset
      ).
    ELSE.
      CALL METHOD super->/iwbep/if_mgw_appl_srv_runtime~get_entityset
        EXPORTING
          iv_entity_name           = iv_entity_name
          iv_entity_set_name       = iv_entity_set_name
          iv_source_name           = iv_source_name
          it_filter_select_options = it_filter_select_options
          it_order                 = it_order
          is_paging                = is_paging
          it_navigation_path       = it_navigation_path
          it_key_tab               = it_key_tab
          iv_filter_string         = iv_filter_string
          iv_search_string         = iv_search_string
          io_tech_request_context  = io_tech_request_context
        IMPORTING
          er_entityset             = er_entityset
          es_response_context      = es_response_context.
    ENDIF.
  ENDMETHOD.


  METHOD /iwbep/if_mgw_appl_srv_runtime~create_entity.
    IF iv_entity_set_name = 'LeaveRequestCollection'.
      DATA ls_leave TYPE zemply_leave_tab.

      io_data_provider->read_entry_data( IMPORTING es_data = ls_leave ).
      ls_leave-mandt = sy-mandt.
      IF ls_leave-status IS INITIAL.
        ls_leave-status = 'PENDING'.
      ENDIF.

      INSERT zemply_leave_tab FROM ls_leave.
      COMMIT WORK.

      copy_data_to_ref(
        EXPORTING
          is_data = ls_leave
        CHANGING
          cr_data = er_entity
      ).

    ELSEIF iv_entity_set_name = 'ZEMPLY_MNG_DBTABSet'.
      DATA ls_emp TYPE zemply_mng_dbtab.

      io_data_provider->read_entry_data( IMPORTING es_data = ls_emp ).
      ls_emp-mandt = sy-mandt.

      INSERT zemply_mng_dbtab FROM ls_emp.
      COMMIT WORK.

      copy_data_to_ref(
        EXPORTING
          is_data = ls_emp
        CHANGING
          cr_data = er_entity
      ).
    ENDIF.
  ENDMETHOD.


  METHOD /iwbep/if_mgw_appl_srv_runtime~update_entity.
    IF iv_entity_set_name = 'LeaveRequestCollection'.
      DATA: ls_leave_upd TYPE zemply_leave_tab,
            lv_leave_id  TYPE zemply_leave_tab-leave_id,
            ls_key       LIKE LINE OF it_key_tab.

      READ TABLE it_key_tab INTO ls_key WITH KEY name = 'LeaveId'.
      IF sy-subrc = 0.
        lv_leave_id = ls_key-value.
      ENDIF.

      io_data_provider->read_entry_data( IMPORTING es_data = ls_leave_upd ).

      IF lv_leave_id IS NOT INITIAL.
        ls_leave_upd-leave_id = lv_leave_id.
      ENDIF.
      ls_leave_upd-mandt = sy-mandt.

      UPDATE zemply_leave_tab FROM ls_leave_upd.
      COMMIT WORK.

      copy_data_to_ref(
        EXPORTING
          is_data = ls_leave_upd
        CHANGING
          cr_data = er_entity
      ).

    ELSEIF iv_entity_set_name = 'ZEMPLY_MNG_DBTABSet'.
      DATA: ls_emp_upd TYPE zemply_mng_dbtab,
            lv_empid   TYPE zemply_mng_dbtab-empid,
            ls_emp_key LIKE LINE OF it_key_tab.

      READ TABLE it_key_tab INTO ls_emp_key WITH KEY name = 'Empid'.
      IF sy-subrc = 0.
        lv_empid = ls_emp_key-value.
      ENDIF.

      io_data_provider->read_entry_data( IMPORTING es_data = ls_emp_upd ).

      IF lv_empid IS NOT INITIAL.
        ls_emp_upd-empid = lv_empid.
      ENDIF.
      ls_emp_upd-mandt = sy-mandt.

      UPDATE zemply_mng_dbtab FROM ls_emp_upd.
      COMMIT WORK.

      copy_data_to_ref(
        EXPORTING
          is_data = ls_emp_upd
        CHANGING
          cr_data = er_entity
      ).
    ENDIF.
  ENDMETHOD.


  METHOD /iwbep/if_mgw_appl_srv_runtime~delete_entity.
    IF iv_entity_set_name = 'ZEMPLY_MNG_DBTABSet'.
      DATA: lv_empid TYPE zemply_mng_dbtab-empid,
            ls_key   LIKE LINE OF it_key_tab.

      READ TABLE it_key_tab INTO ls_key WITH KEY name = 'Empid'.
      IF sy-subrc = 0.
        lv_empid = ls_key-value.
        DELETE FROM zemply_mng_dbtab WHERE empid = lv_empid.
        COMMIT WORK.
      ENDIF.
    ENDIF.
  ENDMETHOD.

ENDCLASS.
