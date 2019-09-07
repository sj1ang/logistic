import {convertMin2Time, genUID} from "@/utils/common";
import {hasId} from "@/engine/domain/Id";
import {MyLocation, MyLocationPool} from "@/engine/domain/MyLocation";
import {ActivityCaution, ActivityNoticeManager} from "@/engine/domain/Notice";
import {Load, LoadImpl} from "@/engine/domain/Load";
import {Task} from "@/engine/domain/Task";
import {ShipmentPool} from "@/engine/domain/ShipmentPool";
import {RoutePool} from "@/engine/domain/Route";

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

  constructor(name: string, location: MyLocation | undefined, operationTime: number, twStart: number, twEnd: number, size: Array<number>, task: Task | undefined) {
    this.uid = genUID();
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

    let newAct = new ShipmentTourActivity(this.name, this.location, this.operationTime, this.twStart, this.twEnd, load2.size, this.task);
    ShipmentPool.getInstance().addShipmentTourActivity(newAct);
  }

}

export class AdditionalShipmentTourActivity extends ShipmentTourActivity{
  additionalFee: number = 0;
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

  constructor(operationTime: number, twStart: number, twEnd: number) {
    this.uid = genUID();
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
