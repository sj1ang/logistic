import {Route, RouteImpl} from "@/engine/domain/Route";
import {DepotTourActivity, ShipmentTourActivity, TourActivity} from "@/engine/domain/Activity";
import {convertMin2Time} from "@/utils/common";
import {TransportCostMatrixManager} from "@/engine/domain/TransportCostMatrix";
import {ActivityNotice} from "@/engine/domain/Notice";

export interface Updater {
  update(route: Route): void;
}

export class RouteInitUpdater implements Updater{
  update(route: Route): void {
    if(route instanceof RouteImpl) {
      let r = <RouteImpl>route;
      let acts = r.activities;
      if(acts.length == 0) r.addDepotTourActivity(0);

      if (acts.length > 0) {
        if (!(acts[0] instanceof DepotTourActivity)) {
          r.addDepotTourActivity(0);
        }

        if (!(acts[acts.length - 1] instanceof DepotTourActivity)) {
          r.addDepotTourActivity(acts.length);
        }
      }

      let ids2Remove: Array<String> = new Array<String>();
      let flag: boolean = false;
      for (let i in acts) {
        if (acts[i] instanceof DepotTourActivity) {
          if (flag) {
            ids2Remove.push(acts[i].uid);
          }
          flag = true;
        }
        if (acts[i] instanceof ShipmentTourActivity) {
          flag = false;
        }
        acts[i].routeUid = route.uid;
      }

      r.activities = r.activities.filter(x=>{
        if(ids2Remove.indexOf(x.uid) == -1) return true;
      })
    }

  }
}

export class RouteTimeUpdater implements Updater{
  update(route: Route): void {
    let prevLocationId = -1;
    let currentLocationId = -1;
    let acts = route.activities;
    for(let i = 0; i < acts.length; i++){
      prevLocationId = currentLocationId;
      currentLocationId = acts[i].locationId;
      if(i == 0) {
        acts[i].arriveTime = acts[i].twStart;
        acts[i].startTime = acts[i].twStart;
        acts[i].endTime = acts[i].startTime + acts[i].operationTime;

        this.convertTime2Str(acts[i]);
        continue;
      }

      let duration: number = TransportCostMatrixManager.getInstance().getDuration(prevLocationId, currentLocationId);
      acts[i].arriveTime = acts[i - 1].endTime + duration;
      acts[i].startTime = acts[i].arriveTime > acts[i].twStart ? acts[i].arriveTime : acts[i].twStart;

      if(i == 1){
        if(acts[i].arriveTime < acts[i].startTime) {
          acts[i].arriveTime = acts[i].startTime;
          acts[i - 1].endTime = acts[i].arriveTime - duration;
          acts[i - 1].startTime = acts[i - 1].endTime - acts[i - 1].operationTime;
          acts[i - 1].arriveTime = acts[i - 1].startTime;

          this.convertTime2Str(acts[i - 1]);
        }
      }

      acts[i].endTime = acts[i].startTime + acts[i].operationTime;
      this.convertTime2Str(acts[i]);
    }
  }

  convertTime2Str(act: TourActivity){
    act.arriveTimeStr = convertMin2Time(act.arriveTime);
    act.startTimeStr = convertMin2Time(act.startTime);
    act.endTimeStr = convertMin2Time(act.endTime);
  }
}

export class ActivityNoticeUpdater implements Updater{
  update(route: Route): void {
    let constraintManager = route.constraintManager;
    for(let i in route.activities){
      let act = route.activities[i];
      act.noticeManager.clear();

      let results = constraintManager.calculatePenalty(act);

      for(let i in results){
        if(results[i].notice) {
          act.noticeManager.addNotice(<ActivityNotice>results[i].notice);
        }
      }

      console.log(act);
    }
  }
}

export class UpdaterManager implements Updater{
  updaters: Array<Updater>;

  constructor(){
    this.updaters = new Array<Updater>();
  }

  addUpdater(updater: Updater){
    this.updaters.push(updater);
  }

  update(route: Route): void {
    for(let i in this.updaters){
      this.updaters[i].update(route);
    }
  }
}
