import {Driver} from "@/engine/domain/Driver";

export class DriverPaymentRow{
  driver: Driver;
  fee: number = 0;
  additionalFee: number = 0;
  penaltyFee: number = 0;
  totalFee: number = 0;
  reasonsStr: string = "无";
  routeStr: string = "无";
  remark: string= "无";


  constructor(driver: Driver){
    this.driver = driver;
  }
}
