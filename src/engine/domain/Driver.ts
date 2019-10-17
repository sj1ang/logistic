import {Vehicle, VehiclePool} from "@/engine/domain/Vehicle";
import {Route, RoutePool} from "@/engine/domain/Route";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {Message} from 'element-ui';
import {getDrivers} from "@/api";
import {Constants} from "@/engine/Constant/Constants";
import {ScenarioHandler} from "@/engine/domain/ScenarioHandler";
import {Punishment, PunishmentImpl} from "@/engine/domain/Punishment";

export interface Driver extends hasId{
  routeUids: Set<string>;
  workStart: number;
  workEnd: number;
  vehicle: Vehicle | undefined;
  availableVehicles: Array<Vehicle>;
  isAvailable: boolean;

  workdays: Array<boolean>;
  workdayNo: number;
  punishment: Punishment;

  assign2Route(route: Route): void;
  cancel(route: Route): void;
  assignVehicle(vehicle: Vehicle): void;
  addAvailableVehicle(vehicle: Vehicle): void;
  emptyVehicles(): void;
  addRouteUids(uid: string): void;
}

export class DriverImpl implements Driver{
  routeUids: Set<string>;
  workStart: number;
  workEnd: number;
  uid: string;
  name: string;
  vehicle: Vehicle | undefined;
  availableVehicles: Array<Vehicle>;
  isAvailable: boolean;

  workdays: Array<boolean>;
  workdayNo: number;
  punishment: Punishment;

  constructor(name: string, uid: string){
    this.uid = uid;
    this.workStart = 0;
    this.workEnd = 60 * 12;
    this.name = name;
    this.availableVehicles = new Array<Vehicle>();
    this.routeUids = new Set<string>();
    this.isAvailable = true;
    this.workdays = new Array<boolean>();
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdays.push(false);
    this.workdayNo = 0;

    this.punishment = new PunishmentImpl();
  }

  assign2Route(route: Route): void {
    this.routeUids.add(route.uid);
    if(this.routeUids.size > 1){
      Message.warning('同一位司机分配在不同的线路！');

      // for(let uid of this.routeUids.values()){
      //   let routePool = RoutePool.getInstance();
      //   let tmpRoute = routePool.getRouteByUid(uid);
      //
      //   if(tmpRoute) {
      //     tmpRoute.noticeManager.addNotice(new RouteError(tmpRoute, "线路司机重复", Constants.DRIVER_ASSIGNMENT_ERROR_CODE));
      //   }
      //
      // }
    }
    let dayOfWeek = ScenarioHandler.getInstance().dayOfWeek;

    if(dayOfWeek)
      this.workdays[Constants.DRIVER_REVIEW_WEEKS * 7 - 7 + dayOfWeek] = true;

  }

  cancel(route: Route): void {
    // this.routeUids = this.routeUids.filter(x=>{
    //   if(x == route.uid)
    //     return false;
    //
    //   return true;
    // })

    this.routeUids.delete(route.uid);
    let dayOfWeek = ScenarioHandler.getInstance().dayOfWeek;

    if(dayOfWeek && this.routeUids.size == 0){
      this.workdays[Constants.DRIVER_REVIEW_WEEKS * 7 - 7 + dayOfWeek] = false;
      this.punishment.reasons = new Array<string>();
      this.punishment.penaltyFee = 0;
    }
  }

  emptyVehicles(){
    this.availableVehicles = new Array<Vehicle>();
  }

  addAvailableVehicle(vehicle: Vehicle): void {
    if(this.availableVehicles.length == 0){
      this.vehicle = vehicle;
    }
    this.availableVehicles.push(vehicle);
  }

  addRouteUids(uid: string){
    this.routeUids.add(uid);
  }

  // caution!
  // assign new vehicle to driver may affect the route properties!
  // plz update the corresponding route!
  // route.update()
  assignVehicle(vehicle: Vehicle): void {
    this.vehicle = vehicle;
  }

  rest(){
    this.isAvailable = false;
    for(let routeUid of this.routeUids){
      let route = RoutePool.getInstance().getRouteByUid(routeUid);
      if(route) {
        route.cancelDriver();
      }
    }
  }

  work(){
    this.isAvailable = true;
  }
}

export class Complaint{

}

export class DriverPool{
  drivers: Array<Driver>;

  static instance: DriverPool;

  constructor(){
    this.drivers = new Array<Driver>();
  }

  static getInstance(){
    if(!this.instance){
      this.instance = new DriverPool();
    }
    return this.instance;
  }

  createDriver(name: string, uid: string): Driver{
    let driver = new DriverImpl(name, uid);
    this.drivers.push(driver);
    return driver;
  }

  addDriver(driver: Driver){
    this.drivers.push(driver);
  }

  getDriver(uid: string): Driver | undefined{
    return this.drivers.find(x=>{
      return x.uid == uid;
    })
  }

  static cleanPool(): void{
    this.instance = new DriverPool();
  }

  fetchDrivers(targetDate: Date){
    // @ts-ignore
    let dateStr = targetDate.Format("yyyy-MM-dd");

    let params = { params: {targetDateStr: dateStr} };
    return getDrivers(params).then(res=>{
      DriverPool.cleanPool();

      for(let i in res){
        let row = res[i];
        let driver = DriverPool.getInstance().createDriver(row.name, row.uid);
        driver.workdays = row.workdays;
        for(let j in row.vehicleUidList){
          let vehicleUid = row.vehicleUidList[j];
          let vehicle = VehiclePool.getInstance().getVehicle(vehicleUid);
          if(vehicle) {
            driver.addAvailableVehicle(vehicle);
          }
        }
      }

      return Promise.resolve('drivers fetched successfully')
    });
  }

  assembleDriversFromScenario(scenario: any){
    DriverPool.cleanPool();

    let tmps = scenario.drivers;
    for(let i in tmps){
      let tmp = tmps[i];

      let driver = DriverPool.getInstance().createDriver(tmp.name, tmp.uid);
      driver.workdays = tmp.workdays;
      for(let i in tmp.punishment.reasons){
        driver.punishment.reasons.push(tmp.punishment.reasons[i])
      }
      driver.punishment.penaltyFee = tmp.punishment.penaltyFee;
      let tmpVehicles = tmp.availableVehicles;
      for(let j in tmpVehicles){
        let vehicleUid = tmpVehicles[j].uid;
        let vehicle = VehiclePool.getInstance().getVehicle(vehicleUid);
        if(vehicle){
          driver.addAvailableVehicle(vehicle);
        }
      }
      driver.isAvailable = tmp.isAvailable;

      // ----------assign in route !!!----------
      // for(let k in tmp.routeUids){
      //   driver.addRouteUids(tmp.routeUids[k]);
      // }

      let assignedVehicle = VehiclePool.getInstance().getVehicle(tmp.vehicle.uid);
      if(assignedVehicle)
        driver.assignVehicle(assignedVehicle);

      driver.workStart = tmp.workStart;
      driver.workEnd = tmp.workEnd;
    }
  }
}
