import {
  ActivityFactory4Scenario,
  ActivityFactory4Template,
  ShipmentTourActivity,
  TourActivity
} from "@/engine/domain/Activity";
import {MyLocationPool} from "@/engine/domain/MyLocation";
import {TaskPool} from "@/engine/domain/Task";
import {Load, LoadImpl} from "@/engine/domain/Load";
import {genUID} from "@/utils/common";

// export interface ShipmentPool {
//   shipments: Array<TourActivity>;
//   addShipmentTourActivity(tourActivity: TourActivity): void;
//   update(): void;
// }

export class ShipmentPool{
  static instance: ShipmentPool;
  shipments: Array<TourActivity>;

  constructor() {
    this.shipments = new Array<TourActivity>();
  }

  static getInstance(){
    if(!this.instance){
      this.instance = new ShipmentPool();
    }

    return this.instance;
  }

  addShipmentTourActivity(tourActivity: TourActivity): void {
    this.shipments.push(tourActivity);
  }

  update(): void{
    this.shipments = this.shipments.filter(x=>{
      if(x instanceof ShipmentTourActivity) return true;
    })

    for(let i in this.shipments){
      this.shipments[i].unassign();
    }
  }

  static cleanPool(){
    this.instance = new ShipmentPool();
  }

  initializeShipments(){
    let tasks = TaskPool.getInstance().tasks;
    for(let i in tasks){
      let task = tasks[i];
      if(task.location) {
        let load: Load = task.load;
        let activity = ShipmentTourActivity.createShipmentTourActivity(task.name, task.location, task.serviceTime, task.startTime, task.endTime, load.size, task, genUID());

        ShipmentPool.getInstance().addShipmentTourActivity(activity);
      }
    }
  }

  assembleShipmentsFromScenario(scenario: any){
    ShipmentPool.cleanPool();

    let tmps = scenario.shipments;
    for(let i in tmps){
      let tmp = tmps[i];
      let activity = ActivityFactory4Scenario.generateActivity(tmp);
      if(activity)
        ShipmentPool.getInstance().addShipmentTourActivity(activity);
    }
  }

  initializeRestShipments(){
    let map = TaskPool.getInstance().taskShipmentMap;
    map.forEach((v, k, m)=>{
      if(v.length == 0){
        let task = TaskPool.getInstance().getTask(k);
        if(task){
          if(task.location){
            let activity = ShipmentTourActivity.createShipmentTourActivity(task.name, task.location, task.serviceTime, task.startTime, task.endTime, task.load.size, task, genUID());
            ShipmentPool.getInstance().addShipmentTourActivity(activity);
          }
        }
      }
    })
  }

  // use initializeRestShipments instead
  assembleShipmentsFromTemplate(template: any){
    ShipmentPool.cleanPool();

    let tmps = template.shipments;
    for(let i in tmps){
      let tmp = tmps[i];
      let activity = ActivityFactory4Template.generateActivity(tmp);
      if(activity)
        ShipmentPool.getInstance().addShipmentTourActivity(activity);
    }
  }
}


