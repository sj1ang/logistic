import {DepotTourActivity, TourActivity} from "@/engine/domain/Activity";
import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {ActivityNoticeUpdater, RouteInitUpdater, RouteTimeUpdater, UpdaterManager} from "@/engine/domain/Updater";
import {RouteCaution, RouteNoticeManager} from "@/engine/domain/Notice";
import {ConstraintManager, TimeWindowConstraint} from "@/engine/domain/Constraint";

export interface Route extends hasId{
  activities: Array<TourActivity>;
  noticeManager: RouteNoticeManager;
  constraintManager: ConstraintManager;

  updateRoute(): void;
}

export class RouteImpl implements Route{

  activities: Array<TourActivity>;
  noticeManager: RouteNoticeManager;
  uid: string;
  updaterManager: UpdaterManager;
  constraintManager: ConstraintManager;

  constructor(){
    this.uid = genUID();
    this.activities = new Array<TourActivity>();
    this.updaterManager = new UpdaterManager();
    this.noticeManager = new RouteNoticeManager();
    this.constraintManager = new ConstraintManager();
    this.init();
  }

  init(){
    this.activities.push(new DepotTourActivity(0, 0, Number.MAX_VALUE));
    this.updaterManager.addUpdater(new RouteInitUpdater());
    this.updaterManager.addUpdater(new RouteTimeUpdater());
    this.updaterManager.addUpdater(new ActivityNoticeUpdater());
    this.constraintManager.addConstraint(new TimeWindowConstraint());

    this.updateRoute();
  }

  updateRoute(): void {
    console.log('updating...');
    this.updaterManager.update(this);
  }

  addDepotTourActivity(index: number): void{
    this.activities.splice(index, 0, new DepotTourActivity(0, 0, Number.MAX_VALUE));
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
