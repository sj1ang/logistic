import {Load, LoadImpl} from "@/engine/domain/Load";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";

export interface Vehicle extends hasId{
  name: string;
  capacity: Load;
}

export class VehicleImpl implements Vehicle{
  name: string;
  capacity: Load;
  uid: string;

  constructor(name: string, size: Array<number>){
    this.uid = genUID();
    this.name = name;
    this.capacity = new LoadImpl(size);
  }
}

export class VehiclePool{
  static instance: VehiclePool;
  vehicles: Array<Vehicle>;

  constructor(){
    this.vehicles = new Array<Vehicle>();
  }

  static getInstance(): VehiclePool{
    if(!this.instance){
      this.instance = new VehiclePool();
    }
    return this.instance;
  }

  createVehicle(name: string, size: Array<number>): Vehicle{
    let vehicle = new VehicleImpl(name, size);
    this.vehicles.push(vehicle);

    return vehicle;
  }
}
