import {Load, LoadImpl} from "@/engine/domain/Load";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";

export interface Vehicle extends hasId{
  name: string;
  fixedCost: number
  distanceCost: number;
  serviceTimeCost: number;
  idleTimeCost: number;
  capacity: Load;
}

export class VehicleImpl implements Vehicle{
  name: string;
  fixedCost: number
  distanceCost: number;
  serviceTimeCost: number;
  idleTimeCost: number;
  capacity: Load;
  uid: string;

  constructor(name: string, fixedCost: number, distanceCost: number, serviceTimeCost: number, idleTimeCost: number, size: Array<number>){
    this.uid = genUID();
    this.name = name;
    this.fixedCost = fixedCost;
    this.distanceCost = distanceCost;
    this.serviceTimeCost = serviceTimeCost;
    this.idleTimeCost = idleTimeCost;
    this.capacity = new LoadImpl(size);
  }
}

export class VehicleWrapper{
  private vehicle: Vehicle;
  fixedCost: number
  distanceCost: number;
  serviceTimeCost: number;
  idleTimeCost: number;
  capacity: Load;

  constructor(vehicle: Vehicle){
    this.vehicle = vehicle;
    this.fixedCost = vehicle.fixedCost;
    this.distanceCost = vehicle.distanceCost;
    this.serviceTimeCost = vehicle.serviceTimeCost;
    this.idleTimeCost = vehicle.idleTimeCost;

    this.capacity = this.vehicle.capacity.clone();
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

  createVehicle(name: string, fixedCost: number, distanceCost: number, serviceTimeCost: number, idleTimeCost: number, size: Array<number>): Vehicle{
    let vehicle = new VehicleImpl(name, fixedCost, distanceCost, serviceTimeCost, idleTimeCost, size);
    this.vehicles.push(vehicle);

    return vehicle;
  }
}
