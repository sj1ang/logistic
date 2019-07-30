import {DepotTourActivity, TourActivity} from "@/engine/domain/Activity";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {
  ActivityNoticeUpdater,
  RouteInitUpdater,
  RouteLoadUpdater, RouteNoticeUpdater,
  RouteTimeUpdater,
  UpdaterManager
} from "@/engine/domain/Updater";
import {RouteCaution, RouteNoticeManager} from "@/engine/domain/Notice";
import {ConstraintManager, LoadConstraint, TimeWindowConstraint} from "@/engine/domain/Constraint";
import {Load, LoadImpl} from "@/engine/domain/Load";
import {Driver} from "@/engine/domain/Driver";

export interface Route extends hasId{
  activities: Array<TourActivity>;
  noticeManager: RouteNoticeManager;
  constraintManager: ConstraintManager;
  load: Load;
  driver: Driver | undefined;
  showDetail: boolean;

  assignDriver(driver: Driver): void;
  cancelDriver(): void;

  updateRoute(): void;
}

export class RouteImpl implements Route{

  activities: Array<TourActivity>;
  noticeManager: RouteNoticeManager;
  uid: string;
  updaterManager: UpdaterManager;
  constraintManager: ConstraintManager;
  load: Load;
  driver: Driver | undefined;

  showDetail: boolean = false;

  constructor(){
    this.uid = genUID();
    this.activities = new Array<TourActivity>();
    this.updaterManager = new UpdaterManager();
    this.noticeManager = new RouteNoticeManager();
    this.constraintManager = new ConstraintManager();
    this.load = new LoadImpl([0]);
    this.init();
  }

  init(){
    this.activities.push(new DepotTourActivity(0, 0, Number.MAX_VALUE));
    this.updaterManager.addUpdater(new RouteInitUpdater());
    this.updaterManager.addUpdater(new RouteTimeUpdater());
    this.updaterManager.addUpdater(new RouteLoadUpdater());
    this.updaterManager.addUpdater(new ActivityNoticeUpdater());
    this.updaterManager.addUpdater(new RouteNoticeUpdater());
    this.constraintManager.addConstraint(new TimeWindowConstraint());
    this.constraintManager.addConstraint(new LoadConstraint());

    this.updateRoute();
  }

  updateRoute(): void {
    console.log('updating...');
    this.updaterManager.update(this);
  }

  addDepotTourActivity(index: number): void{
    this.activities.splice(index, 0, new DepotTourActivity(0, 0, Number.MAX_VALUE));
  }

  assignDriver(driver: Driver){
    this.cancelDriver();
    driver.assign2Route(this);
    this.driver = driver;

    this.updateRoute();
  }

  cancelDriver(){
    if(this.driver) {
      this.driver.cancel();
    }
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

  addRoute(): Route{
    let route: Route = new RouteImpl();
    this.routes.push(route);

    return route;
  }

  getRoute(index: number){
    return this.routes[index];
  }
}
