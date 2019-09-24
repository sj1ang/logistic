export class Constants{
  static DELAY_THRESHOLD: number = 5;
  static DELAY_PENALTY_PER_MIN: number = 4;
  static DELAY_PENALTY_TIMES: number = 5;
  // static CAPACITY_SIZE: number = 2;
  static LOAD_TITLE: Array<string> = ['框箱数','体积'];
  static OVERLOAD_THRESHOLD: Array<number> = [0.1, 0.1];
  static OVERLOAD_PENALTY_PER_UNIT: Array<number> = [4, 4];
  static OVERLOAD_PENALTY_TIMES: Array<number> = [5, 5]


  static DRIVER_ASSIGNMENT_ERROR_CODE: number = 3011;
  static DELAY_CAUTION_CODE: number = 4001;
  static DELAY_ERROR_CODE: number = 4011;
  static OVERLOAD_CAUTION_CODE: number = 5001;
  static OVERLOAD_ERROR_CODE: number = 5011;

  static WORK_START_TIME: string = "05:00";

  static ADDITIONAL_DELIVERY_REASONS = ['客户加单','退换货品','二次补货'];
  static FIRST_TIME_PICKUP_OPERATION_TIME = 30;
  static REPICKUP_OPERATION_TIME = 15;

  static DEPOT_ACTIVITY_TYPE = 'dta';
  static SHIPMENT_ACTIVITY_TYPE = 'sta';
  static ADDITIONAL_SHIPMENT_ACTIVITY_TYPE = 'asta';

  static FETCH_ORDER_TASKS = 0;
  static FETCH_DELIVERY_TASKS = 1;
  static FETCH_MOCK_TASKS = 2;
  static IMPORT_SCENARIO = 3;

  static ORDER_SCENARIO = 0;
  static DELIVERY_SCENARIO = 1;
}
