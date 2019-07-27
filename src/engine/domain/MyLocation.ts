import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";

export interface MyLocation{
  id: number;
}

export class MyLocationImpl implements MyLocation{
  id: number;
  constructor(id: number){
    this.id = id;
  }
}

export class MyLocationFactory{
  static instance: MyLocationFactory;
  locationId: number;
  locationMap: Map<number, MyLocation>;

  private constructor(){
    this.locationId = 0;
    this.locationMap = new Map();
    this.createLocation();
  }

  static getInstance(): MyLocationFactory{
    if(this.instance == null){
      this.instance = new MyLocationFactory();
    }
    return this.instance;
  }

  createLocation(): MyLocation{
    let location: MyLocation = new MyLocationImpl(this.locationId);
    this.locationId ++;
    this.putLocation(location);
    return location;
  }

  putLocation(location: MyLocation): void{
    this.locationMap.set(location.id, location);
  }

  getLocation(locationId: number) : MyLocation | undefined{
    return this.locationMap.get(locationId);
  }

}

