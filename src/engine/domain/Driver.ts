import {Vehicle, VehiclePool} from "@/engine/domain/Vehicle";
import {Route, RoutePool} from "@/engine/domain/Route";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {Message} from 'element-ui';
import {getDrivers} from "@/api";

export interface Driver extends hasId{
  routeUids: Set<string>;
  workStart: number;
  workEnd: number;
  vehicle: Vehicle | undefined;
  availableVehicles: Array<Vehicle>;
  isAvailable: boolean;

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

  constructor(name: string, uid: string){
    this.uid = uid;
    this.workStart = 0;
    this.workEnd = 60 * 12;
    this.name = name;
    this.availableVehicles = new Array<Vehicle>();
    this.routeUids = new Set<string>();
    this.isAvailable = true;
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

  }

  cancel(route: Route): void {
    // this.routeUids = this.routeUids.filter(x=>{
    //   if(x == route.uid)
    //     return false;
    //
    //   return true;
    // })

    this.routeUids.delete(route.uid);
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

  static cleanPool(): void{
    this.instance = new DriverPool();
  }

  fetchDrivers(){
    let params = {};
    return getDrivers(params).then(res=>{
      DriverPool.cleanPool();

      for(let i in res){
        let row = res[i];
        let driver = DriverPool.getInstance().createDriver(row.name, row.uid);
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

    let drivers = scenario.drivers;
    for(let i in drivers){
      let tmp = drivers[i];

      let driver = DriverPool.getInstance().createDriver(tmp.name, tmp.uid);
      let tmpVehicles = tmp.availableVehicles;
      for(let j in tmpVehicles){
        let vehicleUid = tmpVehicles[j].uid;
        let vehicle = VehiclePool.getInstance().getVehicle(vehicleUid);
        if(vehicle){
          driver.addAvailableVehicle(vehicle);
        }
      }
      driver.isAvailable = tmp.isAvailable;
      for(let k in tmp.routeUids){
        driver.addRouteUids(tmp.routeUids[k]);
      }

      let assignedVehicle = VehiclePool.getInstance().getVehicle(tmp.vehicle.uid);
      if(assignedVehicle)
        driver.assignVehicle(assignedVehicle);

      driver.workStart = tmp.workStart;
      driver.workEnd = tmp.workEnd;
    }
  }
}
