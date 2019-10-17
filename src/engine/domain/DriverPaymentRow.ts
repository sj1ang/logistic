import {Driver} from "@/engine/domain/Driver";

export class DriverPaymentRow{
  driver: Driver;
  fee: number = 0;
  additionalFee: number = 0;
  penaltyFee: number = 0;
  totalFee: number = 0;
  reasonsStr: string = "";
  routeStr: string = "";
  remark: string= "";


  constructor(driver: Driver){
    this.driver = driver;
  }
}
