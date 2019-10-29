import {getLocations} from "@/api";
import {TaskPool} from "@/engine/domain/Task";

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
    MyLocationPool.cleanPool();
    return getLocations(params).then(res=>{
      for(let i in res){
        let location = new MyLocationImpl(res[i].id, res[i].name, res[i].address, res[i].alias, res[i].latitude, res[i].longitude);
        MyLocationPool.getInstance().addLocation(location);
      }
      return Promise.resolve("fetch location success");
    })
  }

  static cleanPool(){
      this.instance = new MyLocationPool();
  }

  assembleMyLocationsFromScenario(scenario: any){
    MyLocationPool.cleanPool();

    for(let i in scenario.locations){
      let location = new MyLocationImpl(
        parseInt(scenario.locations[i].id),
        scenario.locations[i].name,
        scenario.locations[i].address,
        scenario.locations[i].alias,
        parseFloat(scenario.locations[i].latitude),
        parseFloat(scenario.locations[i].longitude));

      MyLocationPool.getInstance().addLocation(location);
    }
  }
}

