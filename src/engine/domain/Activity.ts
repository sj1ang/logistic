import {convertMin2Time, convertTime2Min, genUID} from "@/utils/common";
import {hasId} from "@/engine/domain/Id";
import {MyLocation, MyLocationPool} from "@/engine/domain/MyLocation";
import {ActivityCaution, ActivityNoticeManager} from "@/engine/domain/Notice";
import {Load, LoadImpl} from "@/engine/domain/Load";
import {Task, TaskPool} from "@/engine/domain/Task";
import {ShipmentPool} from "@/engine/domain/ShipmentPool";
import {Route, RoutePool} from "@/engine/domain/Route";
import {Constants} from "@/engine/Constant/Constants";

export interface TourActivity extends hasId{
  uid: string;
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
  location: MyLocation | undefined;

  arriveTimeStr: string;
  startTimeStr: string;
  endTimeStr: string;

  routeUid: string | undefined;

  noticeManager: ActivityNoticeManager;
  load: Load;

  unassign(): void;

  removeSelf(): void;
}

export class ShipmentTourActivity implements TourActivity{
  uid: string;
  arriveTime: number = 0;
  endTime: number = 0;
  name: string = "";
  operationTime: number = 0;
  startTime: number = 0;
  theoreticalEarliestOperationStartTime: number = 0;
  theoreticalLatestOperationEndTime: number = 0;
  locationId: number = -1;
  location: MyLocation | undefined;
  twStart: number = 0;
  twEnd: number = 0;

  arriveTimeStr: string;
  endTimeStr: string;
  startTimeStr: string;

  routeUid: string | undefined = undefined;

  noticeManager: ActivityNoticeManager;
  load: Load;

  task: Task | undefined;
  hasFish: boolean= false;

  constructor(name: string, location: MyLocation | undefined, operationTime: number, twStart: number, twEnd: number, size: Array<number>, task: Task | undefined, uid: string) {
    // this.uid = genUID();
    this.uid = uid;
    this.name = name;
    this.location = location;
    this.locationId = this.location ? this.location.id : -1;
    this.operationTime = operationTime;
    this.twStart = twStart;
    this.twEnd = twEnd;

    this.arriveTimeStr = convertMin2Time(this.arriveTime);
    this.startTimeStr = convertMin2Time(this.startTime);
    this.endTimeStr = convertMin2Time(this.endTime);

    this.noticeManager = new ActivityNoticeManager();

    this.load =  new LoadImpl(size);

    this.task = task;
  }

  static createShipmentTourActivity(name: string, location: MyLocation | undefined, operationTime: number, twStart: number, twEnd: number, size: Array<number>, task: Task | undefined, uid: string): ShipmentTourActivity{
    let activity = new ShipmentTourActivity(name, location, operationTime, twStart, twEnd, size, task, uid);
    TaskPool.getInstance().shipmentTourActivityAdded(activity);
    return activity;
  }

  unassign():void{
    this.arriveTime = 0;
    this.startTime = 0;
    this.endTime = 0;

    this.arriveTimeStr = convertMin2Time(this.arriveTime);
    this.endTimeStr = convertMin2Time(this.startTime);
    this.startTimeStr = convertMin2Time(this.endTime);

    this.routeUid = undefined;
    this.noticeManager = new ActivityNoticeManager();
  }

  split(load1: Load, load2: Load){
    this.load = load1;
    if(this.routeUid) {
      let route = RoutePool.getInstance().findRouteByUid(this.routeUid);
      if(route)
        route.updateRoute();
    }

    let newAct = ShipmentTourActivity.createShipmentTourActivity(this.name, this.location, this.operationTime, this.twStart, this.twEnd, load2.size, this.task, genUID());
    ShipmentPool.getInstance().addShipmentTourActivity(newAct);
  }

  removeSelf(){
    let routeUid = this.routeUid;

    if(routeUid){
      let route = RoutePool.getInstance().getRouteByUid(routeUid);
      if(route)
        route.deleteTourActivity(this);
    }else {
      let shipmentPool = ShipmentPool.getInstance();
      shipmentPool.shipments = shipmentPool.shipments.filter(x => {
        if (x.uid == this.uid) return false;
        return true;
      })
    }

    TaskPool.getInstance().shipmentTourActivityRemoved(this);
  }

  changeTask(task: Task){
    TaskPool.getInstance().shipmentTourActivityRemoved(this);
    this.task = task;
    TaskPool.getInstance().shipmentTourActivityAdded(this);
    console.log(TaskPool.getInstance().taskAdditionalShipmentMap);
  }

}

export class AdditionalShipmentTourActivity extends ShipmentTourActivity{
  additionalFee: number = 0;
  reason: number = 0;

  constructor(name: string, location: MyLocation | undefined, operationTime: number, twStart: number, twEnd: number, size: Array<number>, task: Task | undefined, uid: string){
    super(name, location, operationTime, twStart, twEnd, size, task, uid);
  }

  static createAdditionalShipmentTourActivity(name: string, location: MyLocation | undefined, operationTime: number, twStart: number, twEnd: number, size: Array<number>, task: Task | undefined, uid: string): AdditionalShipmentTourActivity{
    let activity = new AdditionalShipmentTourActivity(name, location, operationTime, twStart, twEnd, size, task, uid);
    TaskPool.getInstance().shipmentTourActivityAdded(activity);
    return activity;
  }

  changeTask(task: Task){
    TaskPool.getInstance().shipmentTourActivityRemoved(this);
    this.task = task;
    TaskPool.getInstance().shipmentTourActivityAdded(this);
    console.log(TaskPool.getInstance().taskAdditionalShipmentMap);
  }
}

export class DepotTourActivity implements TourActivity{
  uid: string;

  arriveTime: number = 0;
  endTime: number = 0;
  name: string = "";
  operationTime: number = 0;
  startTime: number = 0;
  theoreticalEarliestOperationStartTime: number = 0;
  theoreticalLatestOperationEndTime: number = 0;
  locationId: number = -1;
  location: MyLocation | undefined;
  twStart: number = 0;
  twEnd: number = 0;

  arriveTimeStr: string;
  endTimeStr: string;
  startTimeStr: string;

  routeUid: string | undefined = undefined;

  noticeManager: ActivityNoticeManager;
  load: Load;
  isOrigin: boolean;

  constructor(operationTime: number, twStart: number, twEnd: number, uid: string) {
    // this.uid = genUID();
    this.uid = uid;
    this.name = "加工中心";
    this.location = MyLocationPool.getInstance().getLocation(0);
    if(this.location) {
      this.locationId = this.location.id;
    }
    this.operationTime = operationTime;
    this.twStart = twStart;
    this.twEnd = twEnd;

    this.arriveTimeStr = convertMin2Time(this.arriveTime);
    this.startTimeStr = convertMin2Time(this.startTime);
    this.endTimeStr = convertMin2Time(this.endTime);

    this.noticeManager = new ActivityNoticeManager();

    this.load = new LoadImpl([0]);

    this.isOrigin = false;
  }

  unassign(): void{
    this.arriveTime = 0;
    this.startTime = 0;
    this.endTime = 0;

    this.arriveTimeStr = convertMin2Time(this.arriveTime);
    this.endTimeStr = convertMin2Time(this.startTime);
    this.startTimeStr = convertMin2Time(this.endTime);

    this.routeUid = undefined;

    this.noticeManager = new ActivityNoticeManager();
  }

  removeSelf(){
    let routeUid = this.routeUid;

    if(routeUid){
      let route = RoutePool.getInstance().getRouteByUid(routeUid);
      if(route)
        route.deleteTourActivity(this);
    }else {
      let shipmentPool = ShipmentPool.getInstance();
      shipmentPool.shipments = shipmentPool.shipments.filter(x => {
        if (x.uid == this.uid) return false;
        return true;
      })
    }
  }
}

export class ActivityFactory4Scenario{
  static generateActivity(source: any): TourActivity | undefined{
    let activity = undefined;
    let type = source.activityType;

    if(type == Constants.DEPOT_ACTIVITY_TYPE){
      activity = new DepotTourActivity(source.operationTime, source.twStart, source.twEnd, source.uid);
    }else if(type == Constants.SHIPMENT_ACTIVITY_TYPE){
      let location = MyLocationPool.getInstance().getLocation(source.locationId);
      let task = undefined;
      if(location)
        task = TaskPool.getInstance().getTaskByLocationId(location.id);
      activity = ShipmentTourActivity.createShipmentTourActivity(source.name, location, source.operationTime, source.twStart, source.twEnd, source.load.size, task, source.uid);
      activity.hasFish = source.hasFish;
    }else if(type == Constants.ADDITIONAL_SHIPMENT_ACTIVITY_TYPE){
      let location = MyLocationPool.getInstance().getLocation(source.locationId);
      let task = undefined;
      if(location)
        task = TaskPool.getInstance().getTaskByLocationId(location.id);
      activity = AdditionalShipmentTourActivity.createAdditionalShipmentTourActivity(source.name, location, source.operationTime, source.twStart, source.twEnd, source.load.size, task, source.uid);
      activity.hasFish = source.hasFish;
      activity.additionalFee = source.additionalFee;
      activity.reason = source.reason;
    }

    return activity;
  }
}

export class ActivityFactory4Template{
  static generateActivity(source: any): TourActivity | undefined{
    console.log(source);
    let activity = undefined;
    let type = source.activityType;

    if(type == Constants.DEPOT_ACTIVITY_TYPE){
      activity = new DepotTourActivity(0, 0, Number.MAX_VALUE, genUID());
    }else if(type == Constants.SHIPMENT_ACTIVITY_TYPE){
      let task = TaskPool.getInstance().getTaskByLocationId(source.locationId);
      if(task)
        activity = ShipmentTourActivity.createShipmentTourActivity(task.name, task.location, task.serviceTime, task.startTime, task.endTime, task.load.size, task, genUID());
      // activity.hasFish = source.hasFish;
    }

    console.log(activity);

    return activity;
  }
}

export class TourActivityWrapper{
  tourActivity: TourActivity;
  name: string;
  twStartStr: string;
  twEndStr: string;
  operationTime: number;
  load: Load;
  task: Task | undefined;

  constructor(activity: TourActivity){
    this.name = activity.name;
    this.tourActivity = activity;
    this.twStartStr = convertMin2Time(activity.twStart);
    this.twEndStr = convertMin2Time(activity.twEnd);
    this.operationTime = activity.operationTime;
    this.load = new LoadImpl([0]);

    if(activity instanceof ShipmentTourActivity){
      this.task = (<ShipmentTourActivity>activity).task;
    }

    this.setLoad();
  }

  setLoad(){
    if(this.tourActivity instanceof ShipmentTourActivity) {
      for (let i = 0; i < this.tourActivity.load.size.length; i++) {
        this.load.size[i] = -this.tourActivity.load.size[i];
      }
    }else if(this.tourActivity instanceof DepotTourActivity){
      for (let i = 0; i < this.tourActivity.load.size.length; i++) {
        this.load.size[i] = this.tourActivity.load.size[i];
      }
    }
  }
}

export interface MyTourActivityWrapper{
  tourActivity: TourActivity;
  name: string;
  twStartStr: string;
  twEndStr: string;
  operationTime: number;

  confirmModification(): void;
}

// export class TourActivityWrapperImpl implements MyTourActivityWrapper{
//   name: string;
//   operationTime: number;
//   tourActivity: TourActivity;
//   twEndStr: string;
//   twStartStr: string;
//
//   constructor(activity: TourActivity){
//     this.name = activity.name;
//     this.tourActivity = activity;
//     this.twStartStr = convertMin2Time(activity.twStart);
//     this.twEndStr = convertMin2Time(activity.twEnd);
//     this.operationTime = activity.operationTime;
//   }
//
//   confirmModification(): void {
//
//   }
// }

export class DepotTourActivityWrapper implements MyTourActivityWrapper{
  name: string;
  operationTime: number;
  tourActivity: TourActivity;
  twEndStr: string;
  twStartStr: string;

  load: Load;

  constructor(activity: DepotTourActivity){
    this.name = activity.name;
    this.twStartStr = convertMin2Time(activity.twStart);
    this.twEndStr = convertMin2Time(activity.twEnd);
    this.operationTime = activity.operationTime;
    this.tourActivity = activity;

    this.load = activity.load.clone();
  }

  confirmModification(): void {
    this.tourActivity.name = this.name;
    this.tourActivity.twStart = convertTime2Min(this.twStartStr);
    this.tourActivity.twEnd = convertTime2Min(this.twEndStr);

    //to solve vue bind-bug
    let tmpOperationTime: any = this.operationTime;
    this.tourActivity.operationTime = Number.parseInt(<string>tmpOperationTime);
    this.tourActivity.load = this.load.clone();

    // update
    let route = RoutePool.getInstance().routes.find(x => {
      return x.uid == this.tourActivity.routeUid;
    })

    if (route) {
      route.updateRoute();
    }
  }
}

export class ShipmentTourActivityWrapper implements MyTourActivityWrapper{
  name: string;
  operationTime: number;
  tourActivity: ShipmentTourActivity;
  twEndStr: string;
  twStartStr: string;

  load: Load;
  task: Task | undefined;

  hasFish: boolean;

  constructor(activity: ShipmentTourActivity){
    this.name = activity.name;
    this.twStartStr = convertMin2Time(activity.twStart);
    this.twEndStr = convertMin2Time(activity.twEnd);
    this.operationTime = activity.operationTime;
    this.tourActivity = activity;

    this.load = activity.load.cloneAndReverse();
    this.task = activity.task;
    this.hasFish = activity.hasFish;
  }

  confirmModification(): void {
    this.tourActivity.name = this.name;
    this.tourActivity.twStart = convertTime2Min(this.twStartStr);
    this.tourActivity.twEnd = convertTime2Min(this.twEndStr);

    //to solve vue bind-bug
    let tmpOperationTime: any = this.operationTime;
    this.tourActivity.operationTime = Number.parseInt(<string>tmpOperationTime);

    this.tourActivity.load = this.load.cloneAndReverse();
    // this.tourActivity.task = this.task;

    if(this.task)
      this.tourActivity.changeTask(this.task);

    this.tourActivity.hasFish = this.hasFish;

    // update
    let route = RoutePool.getInstance().routes.find(x => {
      return x.uid == this.tourActivity.routeUid;
    })

    if (route) {
      route.updateRoute();
    }
  }

}

// should modify three times (depot! shipment! additionalShipment!)
export class AdditionalShipmentTourActivityWrapper implements MyTourActivityWrapper{
  name: string;
  operationTime: number;
  tourActivity: AdditionalShipmentTourActivity;
  twEndStr: string;
  twStartStr: string;

  load: Load;
  task: Task | undefined;

  hasFish: boolean;
  reason: number;
  additionalFee: number;

  constructor(activity: AdditionalShipmentTourActivity){
    this.name = activity.name;
    this.twStartStr = convertMin2Time(activity.twStart);
    this.twEndStr = convertMin2Time(activity.twEnd);
    this.operationTime = activity.operationTime;
    this.tourActivity = activity;

    this.load = activity.load.cloneAndReverse();
    this.task = activity.task;

    this.hasFish = activity.hasFish;
    this.reason = activity.reason;
    this.additionalFee = activity.additionalFee;
  }

  confirmModification(): void {
    this.tourActivity.name = this.name;
    this.tourActivity.twStart = convertTime2Min(this.twStartStr);
    this.tourActivity.twEnd = convertTime2Min(this.twEndStr);

    //to solve vue bind-bug
    let tmpOperationTime: any = this.operationTime;
    this.tourActivity.operationTime = Number.parseInt(tmpOperationTime);

    this.tourActivity.load = this.load.cloneAndReverse();
    // this.tourActivity.task = this.task;

    if(this.task)
      this.tourActivity.changeTask(this.task);

    this.tourActivity.hasFish = this.hasFish;

    //to solve vue bind-bug
    let tmpReason: any = this.reason;
    this.tourActivity.reason = Number.parseInt(tmpReason);
    //to solve vue bind-bug
    let tmpAdditionalFee:any = this.additionalFee;
    this.tourActivity.additionalFee = Number.parseFloat(tmpAdditionalFee);

    // update
    let route = RoutePool.getInstance().routes.find(x => {
      return x.uid == this.tourActivity.routeUid;
    })

    if (route) {
      route.updateRoute();
    }
  }

  insert(): void{
    this.confirmModification();
    console.log(this.tourActivity);
    ShipmentPool.getInstance().shipments.push(this.tourActivity);
  }
}

export class TourActivityWrapperFactory{

  static createWrapper(activity: TourActivity): MyTourActivityWrapper{
    if(activity instanceof DepotTourActivity){
      return new DepotTourActivityWrapper(<DepotTourActivity>activity);
    }else if(activity instanceof AdditionalShipmentTourActivity){
      return new AdditionalShipmentTourActivityWrapper(<AdditionalShipmentTourActivity>activity);
    }else
      return new ShipmentTourActivityWrapper(<ShipmentTourActivity>activity);
  }

}
