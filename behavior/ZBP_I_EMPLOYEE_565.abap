CLASS zbp_i_employee_details DEFINITION PUBLIC ABSTRACT FINAL FOR BEHAVIOR OF zi_employee_details.
ENDCLASS.

CLASS zbp_i_employee_details IMPLEMENTATION.
ENDCLASS.

/* ==========================================================================
   Local Handler for Employee Root Entity
   ========================================================================== */
CLASS lhc_employee DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.

    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR zi_employee_details RESULT result.

    METHODS setDefaultStatus FOR DETERMINE ON MODIFY
      IMPORTING keys FOR zi_employee_details~setDefaultStatus.

    METHODS validateSalary FOR VALIDATE ON SAVE
      IMPORTING keys FOR zi_employee_details~validateSalary.

    METHODS giveRaise FOR MODIFY
      IMPORTING keys FOR ACTION zi_employee_details~giveRaise RESULT result.

    METHODS changeStatus FOR MODIFY
      IMPORTING keys FOR ACTION zi_employee_details~changeStatus RESULT result.

ENDCLASS.

CLASS lhc_employee IMPLEMENTATION.

  METHOD get_instance_authorizations.
    " Authorization check (Open for demo/development)
  ENDMETHOD.

  " --------------------------------------------------------------------------
  " Determination: Set Default Status = 'ACTIVE' on new employee creation
  " --------------------------------------------------------------------------
  METHOD setDefaultStatus.
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        FIELDS ( Status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        UPDATE FIELDS ( Status )
        WITH VALUE #( FOR emp IN lt_employees WHERE ( Status IS INITIAL )
                      ( %tky   = emp-%tky
                        Status = 'ACTIVE' ) ).
  ENDMETHOD.

  " --------------------------------------------------------------------------
  " Validation: Validate Salary is positive and within reasonable bounds
  " --------------------------------------------------------------------------
  METHOD validateSalary.
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        FIELDS ( Salary ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_employee).
      IF ls_employee-Salary <= 0 OR ls_employee-Salary > 9999999.
        APPEND VALUE #( %tky = ls_employee-%tky ) TO failed-zi_employee_details.
        APPEND VALUE #( %tky = ls_employee-%tky
                        %msg = new_message_with_text(
                                 severity = if_abap_behv_message=>severity-error
                                 text     = 'Salary must be greater than 0 and less than 10,000,000' )
                      ) TO reported-zi_employee_details.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  " --------------------------------------------------------------------------
  " Custom Action: Give Salary Raise (Calculates new salary dynamically)
  " --------------------------------------------------------------------------
  METHOD giveRaise.
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        FIELDS ( Salary ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_emp).
      DATA(ls_key) = keys[ %tky = ls_emp-%tky ].
      DATA(lv_pct) = ls_key-%param-percentage_raise.

      IF lv_pct > 0 AND lv_pct <= 100.
        DATA(lv_new_salary) = ls_emp-Salary * ( 1 + ( lv_pct / 100 ) ).

        MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE
          ENTITY zi_employee_details
            UPDATE FIELDS ( Salary )
            WITH VALUE #( ( %tky   = ls_emp-%tky
                            Salary = lv_new_salary ) ).
      ENDIF.
    ENDLOOP.

    " Return updated entity instances
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(lt_updated).

    result = VALUE #( FOR emp IN lt_updated ( %tky   = emp-%tky
                                              %param = emp ) ).
  ENDMETHOD.

  " --------------------------------------------------------------------------
  " Custom Action: Toggle Lifecycle Status (ACTIVE -> ON_LEAVE -> INACTIVE)
  " --------------------------------------------------------------------------
  METHOD changeStatus.
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        FIELDS ( Status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_emp).
      DATA(lv_next_status) = COND #( WHEN ls_emp-Status = 'ACTIVE'   THEN 'ON_LEAVE'
                                     WHEN ls_emp-Status = 'ON_LEAVE' THEN 'INACTIVE'
                                     ELSE 'ACTIVE' ).

      MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE
        ENTITY zi_employee_details
          UPDATE FIELDS ( Status )
          WITH VALUE #( ( %tky   = ls_emp-%tky
                          Status = lv_next_status ) ).
    ENDLOOP.

    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(lt_updated).

    result = VALUE #( FOR emp IN lt_updated ( %tky   = emp-%tky
                                              %param = emp ) ).
  ENDMETHOD.

ENDCLASS.


/* ==========================================================================
   Local Handler for Child Entity: Leave Request
   ========================================================================== */
CLASS lhc_leave DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.

    METHODS approveLeave FOR MODIFY
      IMPORTING keys FOR ACTION zi_employee_leave~approveLeave RESULT result.

    METHODS calculateLeaveDays FOR DETERMINE ON MODIFY
      IMPORTING keys FOR zi_employee_leave~calculateLeaveDays.

    METHODS validateDates FOR VALIDATE ON SAVE
      IMPORTING keys FOR zi_employee_leave~validateDates.

ENDCLASS.

CLASS lhc_leave IMPLEMENTATION.

  " --------------------------------------------------------------------------
  " Custom Action: Manager approves pending leave
  " --------------------------------------------------------------------------
  METHOD approveLeave.
    MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_leave
        UPDATE FIELDS ( Status )
        WITH VALUE #( FOR key IN keys ( %tky   = key-%tky
                                        Status = 'APPROVED' ) ).

    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_leave
        ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(lt_updated).

    result = VALUE #( FOR leave IN lt_updated ( %tky   = leave-%tky
                                                %param = leave ) ).
  ENDMETHOD.

  " --------------------------------------------------------------------------
  " Determination: Calculate leave duration in days automatically
  " --------------------------------------------------------------------------
  METHOD calculateLeaveDays.
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_leave
        FIELDS ( StartDate EndDate ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_leaves).

    LOOP AT lt_leaves INTO DATA(ls_leave).
      IF ls_leave-StartDate IS NOT INITIAL AND ls_leave-EndDate IS NOT INITIAL.
        DATA(lv_days) = ls_leave-EndDate - ls_leave-StartDate + 1.
        IF lv_days > 0.
          MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE
            ENTITY zi_employee_leave
              UPDATE FIELDS ( DaysCount )
              WITH VALUE #( ( %tky      = ls_leave-%tky
                              DaysCount = lv_days ) ).
        ENDIF.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  " --------------------------------------------------------------------------
  " Validation: Start date must be on or before end date
  " --------------------------------------------------------------------------
  METHOD validateDates.
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_leave
        FIELDS ( StartDate EndDate ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_leaves).

    LOOP AT lt_leaves INTO DATA(ls_leave).
      IF ls_leave-StartDate > ls_leave-EndDate.
        APPEND VALUE #( %tky = ls_leave-%tky ) TO failed-zi_employee_leave.
        APPEND VALUE #( %tky = ls_leave-%tky
                        %msg = new_message_with_text(
                                 severity = if_abap_behv_message=>severity-error
                                 text     = 'Leave start date cannot be after end date' )
                      ) TO reported-zi_employee_leave.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

ENDCLASS.
