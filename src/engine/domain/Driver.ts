import {Vehicle} from "@/engine/domain/Vehicle";
import {Route, RoutePool} from "@/engine/domain/Route";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {Message} from 'element-ui';
import {RouteError} from "@/engine/domain/Notice";
import {Constants} from "@/engine/Constant/Constants";

export interface Driver extends hasId{
  routeUids: Set<string>;
  workStart: number;
  workEnd: number;
  vehicle: Vehicle | undefined;
  availableVehicles: Array<Vehicle>;

  assign2Route(route: Route): void;
  cancel(route: Route): void;
  assignVehicle(vehicle: Vehicle): void;
  addAvailableVehicle(vehicle: Vehicle): void;
}

export class DriverImpl implements Driver{
  routeUids: Set<string>;
  workStart: number;
  workEnd: number;
  uid: string;
  name: string;

  vehicle: Vehicle | undefined;
  availableVehicles: Array<Vehicle>;

  constructor(name: string){
    this.uid = genUID();
    this.workStart = 0;
    this.workEnd = 60 * 12;
    this.name = name;
    this.availableVehicles = new Array<Vehicle>();
    this.routeUids = new Set<string>();
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

  addAvailableVehicle(vehicle: Vehicle): void {
    if(this.availableVehicles.length == 0){
      this.vehicle = vehicle;
    }
    this.availableVehicles.push(vehicle);
  }

  // caution!
  // assign new vehicle to driver may affect the route properties!
  // plz update the corresponding route!
  assignVehicle(vehicle: Vehicle): void {
    this.vehicle = vehicle;
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

  createDriver(name: string): Driver{
    let driver = new DriverImpl(name);
    this.drivers.push(driver);
    return driver;
  }

}
