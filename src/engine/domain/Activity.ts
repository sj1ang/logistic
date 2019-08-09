import {convertMin2Time, genUID} from "@/utils/common";
import {hasId} from "@/engine/domain/Id";
import {MyLocation, MyLocationFactory} from "@/engine/domain/MyLocation";
import {ActivityCaution, ActivityNoticeManager} from "@/engine/domain/Notice";
import {Load, LoadImpl} from "@/engine/domain/Load";
import {Task} from "@/engine/domain/Task";

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

  constructor(name: string, location: MyLocation, operationTime: number, twStart: number, twEnd: number, size: Array<number>, task: Task) {
    this.uid = genUID();
    this.name = name;
    this.location = location;
    this.locationId = this.location.id;
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

  constructor(operationTime: number, twStart: number, twEnd: number) {
    this.uid = genUID();
    this.name = "加工中心";
    this.location = MyLocationFactory.getInstance().getLocation(0);
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
  twStartStr: string;
  twEndStr: string;
  operationTime: number;
  load: Load;

  constructor(activity: TourActivity){
    this.tourActivity = activity;
    this.twStartStr = convertMin2Time(activity.twStart);
    this.twEndStr = convertMin2Time(activity.twEnd);
    this.operationTime = activity.operationTime;
    this.load = new LoadImpl([0]);

    if(activity instanceof ShipmentTourActivity) {
      for (let i = 0; i < activity.load.size.length; i++) {
        this.load.size[i] = -activity.load.size[i];
      }
    }else if(activity instanceof DepotTourActivity){
      for (let i = 0; i < activity.load.size.length; i++) {
        this.load.size[i] = activity.load.size[i];
      }
    }
  }



}
