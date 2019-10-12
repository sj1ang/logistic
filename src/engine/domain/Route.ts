import {
  ActivityFactory4Scenario,
  ActivityFactory4Template,
  DepotTourActivity,
  TourActivity
} from "@/engine/domain/Activity";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {
  ActivityNoticeUpdater, CostUpdater,
  RouteInitUpdater,
  RouteLoadUpdater, RouteNoticeLevelUpdater, RouteNoticeUpdater,
  RouteTimeUpdater,
  UpdaterManager
} from "@/engine/domain/Updater";
import {RouteCaution, RouteNoticeManager} from "@/engine/domain/Notice";
import {
  ConstraintManager,
  DriverAssignmentConstraint,
  LoadConstraint,
  TimeWindowConstraint
} from "@/engine/domain/Constraint";
import {Load, LoadImpl} from "@/engine/domain/Load";
import {Driver, DriverPool} from "@/engine/domain/Driver";
import {Task, TaskPool} from "@/engine/domain/Task";
import {Constants} from "@/engine/Constant/Constants";
import {ShipmentPool} from "@/engine/domain/ShipmentPool";
import {Watch} from "vue-property-decorator";
import {DashIndexManager} from "@/engine/domain/DashIndexManager";

export interface Route extends hasId{
  activities: Array<TourActivity>;
  noticeManager: RouteNoticeManager;
  // route & activities
  noticeLevel: number;
  constraintManager: ConstraintManager;
  load: Load;
  driver: Driver | undefined;
  showDetail: boolean;
  isLocked: boolean;
  isFrozen: boolean;
  duration: number;
  distance: number;
  idleTime: number;
  serviceTime: number;
  cost: number;
  fee: number;
  score: number;
  tasks: Array<Task>;
  additionalFee: number;
  deleteTourActivity(activity: TourActivity): number;
  assignDriver(driver: Driver): void;
  cancelDriver(): void;
  updateRoute(): void;
}

export class RouteImpl implements Route{

  activities: Array<TourActivity>;
  noticeManager: RouteNoticeManager;
  noticeLevel: number;
  uid: string;
  updaterManager: UpdaterManager;
  constraintManager: ConstraintManager;
  load: Load;
  driver: Driver | undefined;
  showDetail: boolean = false;
  isLocked: boolean = false;
  isFrozen: boolean = false;
  duration: number = 0;
  distance: number = 0;
  idleTime: number = 0;
  serviceTime: number = 0;
  cost: number = 0;
  fee: number = 0;
  score: number = 0;
  tasks: Array<Task>;
  additionalFee: number = 0;

  constructor(uid: string){
    // this.uid = genUID();
    this.uid = uid;
    this.activities = new Array<TourActivity>();
    this.tasks = new Array<Task>();
    this.updaterManager = new UpdaterManager();
    this.noticeManager = new RouteNoticeManager();
    this.noticeLevel = 0;
    this.constraintManager = new ConstraintManager();
    this.load = new LoadImpl([0]);
    this.init();
  }

  init(){
    // this.activities.push(new DepotTourActivity(0, 0, Number.MAX_VALUE, genUID()));
    this.addDepotTourActivity(0, Constants.FIRST_TIME_PICKUP_OPERATION_TIME);
    this.updaterManager.addUpdater(new RouteInitUpdater());
    this.updaterManager.addUpdater(new RouteTimeUpdater());
    this.updaterManager.addUpdater(new RouteLoadUpdater());
    this.updaterManager.addUpdater(new CostUpdater());
    this.updaterManager.addUpdater(new ActivityNoticeUpdater());
    this.updaterManager.addUpdater(new RouteNoticeUpdater());
    this.updaterManager.addUpdater(new RouteNoticeLevelUpdater());
    this.constraintManager.addConstraint(new TimeWindowConstraint());
    this.constraintManager.addConstraint(new LoadConstraint());
    this.constraintManager.addConstraint(new DriverAssignmentConstraint());

    this.updateRoute();
  }

  updateRoute(): void {
    console.log('updating...');
    this.updaterManager.update(this);
    DashIndexManager.getInstance().updateFeeIndex();
  }

  addDepotTourActivity(index: number, operationTime: number): void{
    this.activities.splice(index, 0, new DepotTourActivity(operationTime, 0, Number.MAX_VALUE, genUID()));
  }

  deleteTourActivity(activity: TourActivity): number{
    let len = this.activities.length;
    this.activities = this.activities.filter(x=>{
      if(activity.uid == x.uid) return false;
      return true;
    })

    this.updateRoute();

    return len - this.activities.length;
  }

  assignDriver(driver: Driver){
    this.cancelDriver();
    driver.assign2Route(this);
    this.driver = driver;

    this.updateRoute();
  }

  cancelDriver(){
    if(this.driver) {
      this.driver.cancel(this);
      this.driver = undefined;
    }

    this.updateRoute();
  }

  changeFee(){
    DashIndexManager.getInstance().updateFeeIndex();
  }
}

export class RoutePool{
  static instance: RoutePool;

  static getInstance(){
    if(!this.instance){
      this.instance = new RoutePool();
    }
    return this.instance;
  }

  routes: Array<Route>;

  constructor(){
    this.routes = new Array<Route>();
  }

  addNewRoute(): Route{
    let route: Route = new RouteImpl(genUID());
    this.routes.push(route);
    DashIndexManager.getInstance().updateRouteIndex();

    return route;
  }

  addRoute(route: Route){
    this.routes.push(route);
    DashIndexManager.getInstance().updateRouteIndex();
  }

  removeRoute(route: Route){
    for(let i in route.activities){
      ShipmentPool.getInstance().addShipmentTourActivity(route.activities[i]);
      ShipmentPool.getInstance().update();
    }

    let tmpRoutes = this.routes.filter(x=>{
      return x.uid != route.uid;
    })

    this.routes = tmpRoutes;

    DashIndexManager.getInstance().updateRouteIndex();
  }

  static cleanPool(){
    this.instance = new RoutePool();
  }

  getRoute(index: number): Route{
    return this.routes[index];
  }

  findRouteByUid(uid: string): Route | undefined{
    let route = RoutePool.getInstance().routes.find(x => {
      return x.uid == uid;
    })
    return route;
  }

  getRouteByUid(uid: string): Route | undefined{
    return this.routes.find(x=>{
      if(x.uid == uid) return true;
    });
  }

  assembleRoutesFromScenario(scenario: any){
    RoutePool.cleanPool();

    let tmps = scenario.routes;

    for(let i in tmps){
      let tmp = tmps[i];
      let route = new RouteImpl(tmp.uid);

      let acts = tmp.activities;
      for(let j in acts){
        let activity = ActivityFactory4Scenario.generateActivity(acts[j]);
        if(activity)
          route.activities.push(activity);
      }

      route.additionalFee = tmp.additionalFee;
      route.fee = Number.parseInt(tmp.fee);
      route.isFrozen = tmp.isFrozen;
      route.isLocked = tmp.isLocked;

      if(tmp.driver){
        let driver = DriverPool.getInstance().getDriver(tmp.driver.uid);
        if(driver)
          route.assignDriver(driver);
      }

      route.updateRoute();

      RoutePool.getInstance().addRoute(route);
    }
  }

  assembleRoutesFromTemplate(template: any){
    RoutePool.cleanPool();

    let tmps = template.routes;

    for(let i in tmps){
      let tmp = tmps[i];
      let route = RoutePool.getInstance().addNewRoute();

      let acts = tmp.activities;
      for(let j in acts){
        let activity = ActivityFactory4Template.generateActivity(acts[j]);
        if(activity)
          route.activities.push(activity);
      }

      if(tmp.driver){
        let driver = DriverPool.getInstance().getDriver(tmp.driver.uid);
        if(driver)
          route.assignDriver(driver);
      }

      route.updateRoute();
    }
  }
}
