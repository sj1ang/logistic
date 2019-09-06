import {Route, RouteImpl} from "@/engine/domain/Route";
import {
  AdditionalShipmentTourActivity,
  DepotTourActivity,
  ShipmentTourActivity,
  TourActivity
} from "@/engine/domain/Activity";
import {convertMin2Time} from "@/utils/common";
import {TransportCostMatrixManager} from "@/engine/domain/TransportCostMatrix";
import {ActivityNotice, RouteNotice} from "@/engine/domain/Notice";
import {LoadImpl} from "@/engine/domain/Load";
import {Task} from "@/engine/domain/Task";
import {Vehicle} from "@/engine/domain/Vehicle";

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

    route.tasks = new Array<Task>();

    for(let act of route.activities){
      if(act instanceof ShipmentTourActivity){
        let shipmentAct = <ShipmentTourActivity>act;
        if(shipmentAct.task)
          route.tasks.push(shipmentAct.task);
      }
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

export class RouteLoadUpdater implements Updater{
  update(route: Route): void {
    let acts = route.activities;
    let nearestDepotActIndex: number = 0;
    let load = new LoadImpl([0]);
    let maxLoad = new LoadImpl([0]);
    for(let i = 0; i < acts.length; i++){
      if(acts[i] instanceof DepotTourActivity){
        acts[nearestDepotActIndex].load = load;
        acts[nearestDepotActIndex].load.reverse();

        maxLoad = maxLoad.max(acts[nearestDepotActIndex].load);

        nearestDepotActIndex = i;
        acts[i].load = new LoadImpl([0]);
        load = acts[i].load;
        continue;
      }

      load = load.add(acts[i].load);
    }

    route.load = maxLoad;
  }
}

export class CostUpdater implements Updater{
  update(route: Route): void {
    let matrix = TransportCostMatrixManager.getInstance();


    //clear all cost properties
    let duration: number = 0;
    let idleTime: number = 0;
    let serviceTime: number = 0;
    let distance: number = 0;
    let cost: number = 0;
    let score: number = 0;
    let additionalFee: number = 0;

    let vehicle;

    let acts = route.activities;
    let prevAct;
    let currAct;
    for(let i = 0; i < acts.length; i++){
      prevAct = currAct;
      currAct = acts[i];

      idleTime += currAct.startTime - currAct.arriveTime;
      serviceTime += currAct.operationTime;

      if(prevAct && currAct){
        distance += matrix.getDistance(prevAct.locationId, currAct.locationId);
      }

      console.log(currAct);
      if(currAct instanceof AdditionalShipmentTourActivity){
        console.log('additional fee');
        additionalFee += (<AdditionalShipmentTourActivity>currAct).additionalFee;
      }
    }

    duration = acts[acts.length - 1].endTime - acts[0].startTime;

    if(route.driver){
      vehicle = route.driver.vehicle;
    }

    if(vehicle){
      cost = distance * vehicle.distanceCost + idleTime * vehicle.idleTimeCost + serviceTime * vehicle.serviceTimeCost + vehicle.fixedCost;
      score += cost;
    }

    route.duration = duration;
    route.idleTime = idleTime;
    route.serviceTime = serviceTime;
    route.distance = distance;
    route.cost = cost;
    route.score = score;
    route.additionalFee = additionalFee;
  }
}

export class ActivityNoticeUpdater implements Updater{
  update(route: Route): void {
    let score = route.score;
    let constraintManager = route.constraintManager;

    for(let i in route.activities){
      let act = route.activities[i];
      act.noticeManager.clear();

      let results = constraintManager.calculateActivityPenalty(act);

      for(let i in results){
        if(results[i].notice) {
          act.noticeManager.addNotice(<ActivityNotice>results[i].notice);
        }

        score += results[i].penalty;
      }
    }

    route.score = score;
  }
}

export class RouteNoticeUpdater implements Updater{
  update(route: Route): void {
    let score = route.score;
    route.noticeManager.clear();
    let constraintManager = route.constraintManager;
    let softResults = constraintManager.calculateRoutePenalty(route);

    for(let i in softResults){
      if(softResults[i].notice){
        route.noticeManager.addNotice(<RouteNotice>softResults[i].notice);
        score += softResults[i].penalty;
      }
    }

    // let hardResults = constraintManager.isFulfilled(route);
    //
    // for(let i in hardResults){
    //   if(hardResults[i].notice){
    //     route.noticeManager.addNotice(<RouteNotice>hardResults[i].notice);
    //   }
    // }
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
