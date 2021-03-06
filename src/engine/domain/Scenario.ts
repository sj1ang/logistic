import {Route, RoutePool} from "@/engine/domain/Route";
import {MyLocation, MyLocationPool} from "@/engine/domain/MyLocation";
import {Vehicle, VehiclePool} from "@/engine/domain/Vehicle";
import {Driver, DriverPool} from "@/engine/domain/Driver";
import {Task, TaskPool} from "@/engine/domain/Task";
import {
  DepotTourActivity,
  TourActivity,
  ShipmentTourActivity,
  AdditionalShipmentTourActivity
} from "@/engine/domain/Activity";
import {ShipmentPool} from "@/engine/domain/ShipmentPool";
import {ActivityNoticeManager, RouteNoticeManager} from "@/engine/domain/Notice";
import {Load} from "@/engine/domain/Load";
import {UpdaterManager} from "@/engine/domain/Updater";
import {ConstraintManager} from "@/engine/domain/Constraint";
import {TransportCostCell, TransportCostMatrixManager} from "@/engine/domain/TransportCostMatrix";

export interface MyFile {
  id: number | undefined;
  name: string;
  lastModificationTime: Date;
}

export class ScenarioFile implements MyFile{
  id: number | undefined;
  name: string;
  type: number;
  targetDate: Date;
  createTime: Date;
  lastModificationTime: Date;
  scenarioId: number | undefined;
  isOfficial: number;
  creator: string;
  productVersion: string;
  geoVersion: string;

  constructor(id: number | undefined, name: string, type: number, targetDate: Date, createTime: Date, lastModificationTime: Date, scenarioId: number | undefined, isOfficial: number, creator: string, productVersion: string, geoVersion: string){
    this.id = id;
    this.name = name;
    this.type = type;
    this.targetDate = targetDate;
    this.createTime = createTime;
    this.lastModificationTime = lastModificationTime;
    this.scenarioId = scenarioId;
    this.isOfficial = isOfficial;
    this.creator = creator;
    this.productVersion = productVersion;
    this.geoVersion = geoVersion;
  }
}

export class TemplateFile implements MyFile{
  id: number | undefined;
  name: string;
  createTime: Date;
  lastModificationTime: Date;
  templateId: number | undefined;
  creator: string;
  productVersion: string;
  geoVersion: string;

  constructor(id: number | undefined, name: string, createTime: Date, lastModificationTime: Date, templateId: number | undefined, creator: string, productVersion: string, geoVersion: string){
    this.id = id;
    this.name = name;
    this.createTime = createTime;
    this.lastModificationTime = lastModificationTime;
    this.templateId = templateId;
    this.creator = creator;
    this.productVersion = productVersion;
    this.geoVersion = geoVersion;
  }
}

export interface Scenario {
  locations: Map<number, MyLocation>;
  vehicles: Array<Vehicle>;
  drivers: Array<Driver>;
  tasks: Array<Task>;
  routes: Array<Route>;
  shipments: Array<TourActivity>;
  taskShipmentMap: Map<string, Array<string>>;
  taskAdditionalShipmentMap: Map<string, Array<string>>;
  matrix: TransportCostMatrixManager;
}

export class ScenarioImpl implements Scenario{
  drivers: Array<Driver>;
  locations: Map<number, MyLocation>;
  routes: Array<Route>;
  shipments: Array<TourActivity>;
  tasks: Array<Task>;
  vehicles: Array<Vehicle>;
  taskShipmentMap: Map<string, Array<string>>;
  taskAdditionalShipmentMap: Map<string, Array<string>>;
  matrix: TransportCostMatrixManager;

  constructor(){
    this.locations = MyLocationPool.getInstance().locationMap;
    this.drivers = DriverPool.getInstance().drivers;
    this.routes = RoutePool.getInstance().routes;
    this.shipments = ShipmentPool.getInstance().shipments;
    this.tasks = TaskPool.getInstance().tasks;
    this.vehicles = VehiclePool.getInstance().vehicles;
    this.taskShipmentMap = TaskPool.getInstance().taskShipmentMap;
    this.taskAdditionalShipmentMap = TaskPool.getInstance().taskAdditionalShipmentMap;
    this.matrix = TransportCostMatrixManager.getInstance();
  }
}

export class ScenarioDTO{
  drivers: Array<Driver>;
  routes: Array<RouteDTO>;
  shipments: Array<TourActivityDTO>;
  tasks: Array<Task>;
  vehicles: Array<Vehicle>;
  taskShipmentMap: Object;
  taskAdditionalShipmentMap: Object;

  locations: Array<MyLocation>;
  distances: Array<TransportCostCell>;
  durations: Array<TransportCostCell>;
  // matrix: Object;

  constructor(scenario: Scenario){
    this.drivers = scenario.drivers;
    this.tasks = scenario.tasks;
    this.vehicles = scenario.vehicles;

    this.routes = new Array<RouteDTO>();
    this.shipments = new Array<TourActivityDTO>();

    let rs = scenario.routes;
    for(let i in rs){
      this.routes.push(new RouteDTO(rs[i]));
    }

    let ss = scenario.shipments;

    for(let j in ss){
      this.shipments.push(ActivityHandler.convert(ss[j]));
    }

    this.taskShipmentMap = this._strMapToObj(scenario.taskShipmentMap);
    this.taskAdditionalShipmentMap = this._strMapToObj(scenario.taskAdditionalShipmentMap);

    this.locations = new Array<MyLocation>();
    scenario.locations.forEach((value, key, map)=>{
      this.locations.push(value);
    })

    this.distances = scenario.matrix.generateDistanceCostArray();
    this.durations = scenario.matrix.generateDurationCostArray();

    console.log(this.distances);
    console.log(this.durations);
  }

  _strMapToObj(strMap: Map<any, any>){
    let obj= Object.create(null);
    for (let[k,v] of strMap) {
      obj[k] = v;
    }

    console.log(obj);
    return obj;
  }
}

export interface TourActivityDTO{
  uid: string;
  activityType: string;
  theoreticalEarliestOperationStartTime: number;
  theoreticalLatestOperationEndTime: number;
  name: string;
  operationTime: number;
  arriveTime: number;
  startTime: number;
  endTime: number;
  twStart: number;
  twEnd: number;
  locationId: number;

  arriveTimeStr: string;
  startTimeStr: string;
  endTimeStr: string;

  routeUid: string | undefined;
  load: Load;
}

export class DepotTourActivityDTO implements TourActivityDTO{
  arriveTime: number;
  activityType: string;
  arriveTimeStr: string;
  endTime: number;
  endTimeStr: string;
  load: Load;
  locationId: number;
  name: string;
  operationTime: number;
  routeUid: string | undefined;
  startTime: number;
  startTimeStr: string;
  theoreticalEarliestOperationStartTime: number;
  theoreticalLatestOperationEndTime: number;
  twEnd: number;
  twStart: number;
  uid: string;
  isOrigin: boolean;

  constructor(activity: DepotTourActivity){
    this.activityType = "dta";

    this.arriveTime = activity.arriveTime;
    this.arriveTimeStr = activity.arriveTimeStr;
    this.endTime = activity.endTime;
    this.endTimeStr = activity.endTimeStr;
    this.load = activity.load;
    this.locationId = activity.locationId;
    this.name = activity.name;
    this.operationTime = activity.operationTime;
    this.startTime = activity.startTime;
    this.startTimeStr = activity.startTimeStr;
    this.theoreticalEarliestOperationStartTime = activity.theoreticalEarliestOperationStartTime;
    this.theoreticalLatestOperationEndTime  = activity.theoreticalLatestOperationEndTime;
    this.twEnd = activity.twEnd;
    this.twStart = activity.twStart;
    this.uid = activity.uid;
    this.isOrigin = activity.isOrigin;
  }
}

export class ShipmentTourActivityDTO implements TourActivityDTO{
  activityType: string;
  arriveTime: number;
  arriveTimeStr: string;
  endTime: number;
  endTimeStr: string;
  load: Load;
  locationId: number;
  name: string;
  operationTime: number;
  routeUid: string | undefined;
  startTime: number;
  startTimeStr: string;
  theoreticalEarliestOperationStartTime: number;
  theoreticalLatestOperationEndTime: number;
  twEnd: number;
  twStart: number;
  uid: string;

  taskId: string | undefined;
  hasFish: boolean= false;

  constructor(activity: ShipmentTourActivity){
    this.activityType = "sta";
    this.arriveTime = activity.arriveTime;
    this.arriveTimeStr = activity.arriveTimeStr;
    this.endTime = activity.endTime;
    this.endTimeStr = activity.endTimeStr;
    this.load = activity.load;
    this.locationId = activity.locationId;
    this.name = activity.name;
    this.operationTime = activity.operationTime;
    this.startTime = activity.startTime;
    this.startTimeStr = activity.startTimeStr;
    this.theoreticalEarliestOperationStartTime = activity.theoreticalEarliestOperationStartTime;
    this.theoreticalLatestOperationEndTime  = activity.theoreticalLatestOperationEndTime;
    this.twEnd = activity.twEnd;
    this.twStart = activity.twStart;
    this.uid = activity.uid;
    this.hasFish = activity.hasFish;
    this.taskId = activity.task ? activity.task.uid : undefined;
  }
}

export class AdditionalShipmentTourActivityDTO implements TourActivityDTO{
  activityType: string;
  arriveTime: number;
  arriveTimeStr: string;
  endTime: number;
  endTimeStr: string;
  load: Load;
  locationId: number;
  name: string;
  operationTime: number;
  routeUid: string | undefined;
  startTime: number;
  startTimeStr: string;
  theoreticalEarliestOperationStartTime: number;
  theoreticalLatestOperationEndTime: number;
  twEnd: number;
  twStart: number;
  uid: string;
  hasFish: boolean= false;
  taskId: string | undefined;
  additionalFee: number;
  reason: number;

  constructor(activity: AdditionalShipmentTourActivity){
    this.activityType = "asta";
    this.arriveTime = activity.arriveTime;
    this.arriveTimeStr = activity.arriveTimeStr;
    this.endTime = activity.endTime;
    this.endTimeStr = activity.endTimeStr;
    this.load = activity.load;
    this.locationId = activity.locationId;
    this.name = activity.name;
    this.operationTime = activity.operationTime;
    this.startTime = activity.startTime;
    this.startTimeStr = activity.startTimeStr;
    this.theoreticalEarliestOperationStartTime = activity.theoreticalEarliestOperationStartTime;
    this.theoreticalLatestOperationEndTime  = activity.theoreticalLatestOperationEndTime;
    this.twEnd = activity.twEnd;
    this.twStart = activity.twStart;
    this.uid = activity.uid;
    this.hasFish = activity.hasFish;
    this.taskId = activity.task ? activity.task.uid : undefined;
    this.additionalFee = activity.additionalFee;
    this.reason = activity.reason;
  }
}

export class ActivityHandler{
  static convert(activity: TourActivity): TourActivityDTO{
    if(activity instanceof DepotTourActivity){
      return new DepotTourActivityDTO(<DepotTourActivity>activity);
    }else{
      if(activity instanceof AdditionalShipmentTourActivity){
        return new AdditionalShipmentTourActivityDTO(<AdditionalShipmentTourActivity>activity);
      }
      return new ShipmentTourActivityDTO(<ShipmentTourActivity>activity);
    }
  }
}

export class RouteDTO{
  activities: Array<TourActivityDTO>;
  uid: string;
  driver: Driver | undefined;
  isLocked: boolean;
  isFrozen: boolean;
  fee: number;
  additionalFee: number;

  constructor(route: Route){
    this.uid = route.uid;
    this.driver = route.driver;
    this.isLocked = route.isLocked;
    this.isFrozen = route.isFrozen;
    this.fee = route.fee;
    this.additionalFee = route.additionalFee;

    this.activities = new Array<TourActivityDTO>();

    let acts = route.activities;
    for(let i in acts){
      this.activities.push(ActivityHandler.convert(acts[i]));
    }
  }
}
