import {Vehicle} from "@/engine/domain/Vehicle";
import {Route} from "@/engine/domain/Route";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";

export interface Driver extends hasId{
  routeUids: Array<string>;
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
  routeUids: Array<string>;
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
    this.routeUids = new Array<string>();
  }

  assign2Route(route: Route): void {
    this.routeUids.push(route.uid);
  }

  cancel(route: Route): void {
    this.routeUids = this.routeUids.filter(x=>{
      if(x == route.uid)
        return false;

      return true;
    })
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
