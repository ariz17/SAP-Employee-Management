CLASS lhc_ZI_EMPLOYEE_DETAILS DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.

    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR zi_employee_details RESULT result.

    " Determination: Auto-sets Status = ACTIVE when employee is created
    METHODS setDefaultStatus FOR DETERMINE ON MODIFY
      IMPORTING keys FOR zi_employee_details~setDefaultStatus.

    " Validation: Salary must be greater than 0 and less than 9,999,999
    METHODS validateSalary FOR VALIDATE ON SAVE
      IMPORTING keys FOR zi_employee_details~validateSalary.

ENDCLASS.

CLASS lhc_ZI_EMPLOYEE_DETAILS IMPLEMENTATION.

  METHOD get_instance_authorizations.
    LOOP AT keys INTO DATA(ls_key).
      APPEND VALUE #(
        %tky    = ls_key-%tky
        %update = if_abap_behv=>auth-allowed
        %delete = if_abap_behv=>auth-allowed
      ) TO result.
    ENDLOOP.
  ENDMETHOD.


  METHOD setDefaultStatus.
    " Read current employee data
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        FIELDS ( Status )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    " Set Status = 'ACTIVE' for all newly created employees
    MODIFY ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        UPDATE FIELDS ( Status )
        WITH VALUE #( FOR ls_emp IN lt_employees
          ( %tky   = ls_emp-%tky
            Status = 'ACTIVE' ) ).
  ENDMETHOD.


  METHOD validateSalary.
    " Read salary of employees being saved
    READ ENTITIES OF zi_employee_details IN LOCAL MODE
      ENTITY zi_employee_details
        FIELDS ( Salary )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_employees).

    LOOP AT lt_employees INTO DATA(ls_emp).

      " Check: Salary must be greater than 0
      IF ls_emp-Salary <= 0.
        APPEND VALUE #(
          %tky = ls_emp-%tky
          %msg = new_message_with_text(
                   severity = if_abap_behv_message=>severity-error
                   text     = 'Salary must be greater than 0' )
        ) TO reported-zi_employee_details.

        APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-zi_employee_details.

      " Check: Salary must not exceed 9,999,999
      ELSEIF ls_emp-Salary > 9999999.
        APPEND VALUE #(
          %tky = ls_emp-%tky
          %msg = new_message_with_text(
                   severity = if_abap_behv_message=>severity-error
                   text     = 'Salary cannot exceed 9,999,999' )
        ) TO reported-zi_employee_details.

        APPEND VALUE #( %tky = ls_emp-%tky ) TO failed-zi_employee_details.

      ENDIF.
    ENDLOOP.
  ENDMETHOD.

ENDCLASS.
