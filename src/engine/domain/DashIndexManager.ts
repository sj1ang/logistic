import {Route, RoutePool} from "@/engine/domain/Route";
import {Task, TaskPool} from "@/engine/domain/Task";

export interface DashIndexUpdater {
  update(manager: DashIndexManager): void;
}

export class FeeIndexUpdater implements DashIndexUpdater{
  update(manager: DashIndexManager): void {
    let routes: Array<Route> = RoutePool.getInstance().routes;
    let totalFee = 0;
    let totalAdditionalFee = 0;
    for(let i in routes){
      totalFee += Number.parseInt(String(routes[i].fee));
      totalAdditionalFee += Number.parseInt(String(routes[i].additionalFee));
    }

    manager.totalFee = totalFee;
    manager.totalAdditionalFee = totalAdditionalFee;
  }

}

export class TaskIndexUpdater implements DashIndexUpdater{
  update(manager: DashIndexManager){
    let tasks: Array<Task> = TaskPool.getInstance().tasks;
    let taskShipmentMap: Map<string, Array<string>> = TaskPool.getInstance().taskShipmentMap;
    let taskAdditionalShipmentMap: Map<string, Array<string>> = TaskPool.getInstance().taskAdditionalShipmentMap;

    let taskNo = tasks.length;
    let shipmentNo = 0;
    let additionalShipmentNo = 0;

    taskShipmentMap.forEach((value, key, map)=>{
      shipmentNo += value.length;
    })

    taskAdditionalShipmentMap.forEach((value, key, map)=>{
      additionalShipmentNo += value.length;
    })

    manager.taskNo = taskNo;
    manager.shipmentNo = shipmentNo;
    manager.additionalShipmentNo = additionalShipmentNo;
  }

}

export class RouteIndexUpdater implements DashIndexUpdater{
  update(manager: DashIndexManager): void {
    let routeNo = RoutePool.getInstance().routes.length;
    console.log(routeNo);
    manager.routeNo = routeNo;
  }
}

export class DashIndexManager{
  totalFee: number = 0;
  totalAdditionalFee: number = 0;
  taskNo: number = 0;
  shipmentNo: number = 0;
  additionalShipmentNo: number = 0;
  routeNo: number = 0;

  updaters: Array<DashIndexUpdater> = new Array<DashIndexUpdater>();

  static instance: DashIndexManager;

  static getInstance(): DashIndexManager{
    if (!this.instance){
      this.instance = new DashIndexManager();
    }
    return this.instance;
  }

  constructor(){
    this.updaters.push(new FeeIndexUpdater());
    this.updaters.push(new TaskIndexUpdater());
    this.updaters.push(new RouteIndexUpdater());
  }

  update(): void{
    for(let i in this.updaters){
      this.updaters[i].update(this);
    }
  }

  updateFeeIndex(){
    for(let i in this.updaters){
      if(this.updaters[i] instanceof FeeIndexUpdater){
        this.updaters[i].update(this);
      }
    }
  }

  updateTaskIndex(){
    for(let i in this.updaters){
      if(this.updaters[i] instanceof TaskIndexUpdater){
        this.updaters[i].update(this);
      }
    }
  }

  updateRouteIndex(){
    for(let i in this.updaters){
      if(this.updaters[i] instanceof RouteIndexUpdater){
        this.updaters[i].update(this);
      }
    }
  }
}
