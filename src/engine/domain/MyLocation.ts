import {getLocations} from "@/api";

export interface MyLocation{
  id: number;
  name: string;
  alias: string;
  address: string;
  longitude: number;
  latitude: number;
}

export class MyLocationImpl implements MyLocation{
  id: number;
  address: string;
  alias: string;
  latitude: number;
  longitude: number;
  name: string;

  constructor(id: number, name: string, address: string, alias: string, latitude: number, longitude: number){
    this.id = id;
    this.name = name;
    this.alias = alias;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

export class MyLocationPool{
  static instance: MyLocationPool;
  locationMap: Map<number, MyLocation>;

  private constructor(){
    this.locationMap = new Map();
  }

  static getInstance(): MyLocationPool{
    if(this.instance == null){
      this.instance = new MyLocationPool();
    }
    return this.instance;
  }

  addLocation(location: MyLocation): void{
    this.locationMap.set(location.id, location);
  }

  getLocation(locationId: number) : MyLocation | undefined{
    return this.locationMap.get(locationId);
  }

  fetchLocations(){
    let params = {};
    let that = this;
    return getLocations(params).then(res=>{
      for(let i in res){
        let location = new MyLocationImpl(res[i].id, res[i].name, res[i].address, res[i].alias, res[i].latitude, res[i].longitude);
        that.addLocation(location);
      }
      return Promise.resolve("fetch location success");
    })
  }

}

