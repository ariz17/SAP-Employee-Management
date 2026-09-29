CLASS zcl_insert_employee_data DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun .
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.



CLASS zcl_insert_employee_data IMPLEMENTATION.

  METHOD if_oo_adt_classrun~main.
    DATA: lt_emp TYPE TABLE OF zemply_mng_dbtab.

    " Clear old data
    DELETE FROM zemply_mng_dbtab.

    " Prepare sample employee records
    lt_emp = VALUE #(
      ( client = sy-mandt empid = '100101' name = 'Sarah Connor'  email = 'sarah.connor@acme.com'  dept = 'Engineering' salary = '145000.00' joindate = '20210315' status = 'ACTIVE' )
      ( client = sy-mandt empid = '100102' name = 'Marcus Vance'   email = 'marcus.vance@acme.com'   dept = 'DevOps'      salary = '128000.00' joindate = '20210801' status = 'ACTIVE' )
      ( client = sy-mandt empid = '100103' name = 'Elena Rostova'  email = 'elena.rostova@acme.com'  dept = 'Security'    salary = '132000.00' joindate = '20220110' status = 'ON_LEAVE' )
      ( client = sy-mandt empid = '100104' name = 'David Kim'      email = 'david.kim@acme.com'      dept = 'Engineering' salary = '112000.00' joindate = '20220620' status = 'ACTIVE' )
      ( client = sy-mandt empid = '100105' name = 'Amina Diallo'   email = 'amina.diallo@acme.com'   dept = 'Data & AI'   salary = '138000.00' joindate = '20230214' status = 'ACTIVE' )
    ).

    " Insert into table
    INSERT zemply_mng_dbtab FROM TABLE @lt_emp.

    IF sy-subrc = 0.
      out->write( |SUCCESS: Inserted { lines( lt_emp ) } employees into ZEMPLY_MNG_DBTAB!| ).
    ELSE.
      out->write( 'ERROR: Failed to insert data.' ).
    ENDIF.

  ENDMETHOD.

ENDCLASS.
