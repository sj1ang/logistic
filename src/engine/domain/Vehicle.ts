import {Load, LoadImpl} from "@/engine/domain/Load";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {getVehicles} from "@/api";

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

  constructor(name: string, fixedCost: number, distanceCost: number, serviceTimeCost: number, idleTimeCost: number, size: Array<number>, uid: string){
    this.uid = uid;
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

  createVehicle(name: string, fixedCost: number, distanceCost: number, serviceTimeCost: number, idleTimeCost: number, size: Array<number>, uid: string): Vehicle{
    let vehicle = new VehicleImpl(name, fixedCost, distanceCost, serviceTimeCost, idleTimeCost, size, uid);
    this.vehicles.push(vehicle);

    return vehicle;
  }

  getVehicle(uid: string){
    let vehicle = this.vehicles.find(x=>{
      if(x.uid == uid)
        return true;
    })

    return vehicle;
  }

  fetchVehicles(){
    let params = {};
    return getVehicles(params).then(res=>{
      for(let i in res){
        let row = res[i];
        VehiclePool.getInstance().createVehicle(row.name, row.fixedCost, row.distanceCost, row.serviceCost, row.idleTimeCost, row.load.size, row.uid);
      }
      return Promise.resolve('vehicles fetched successfully...');
    })
  }
}
