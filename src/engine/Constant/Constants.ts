export class Constants{
  static DELAY_THRESHOLD: number = 5;
  static DELAY_PENALTY_PER_MIN: number = 4;
  static DELAY_PENALTY_TIMES: number = 5;
  // static CAPACITY_SIZE: number = 2;
  static LOAD_TITLE: Array<string> = ['框箱数','体积'];
  static OVERLOAD_THRESHOLD: Array<number> = [0.1, 0.1];
  static OVERLOAD_PENALTY_PER_UNIT: Array<number> = [4, 4];
  static OVERLOAD_PENALTY_TIMES: Array<number> = [5, 5]
}
