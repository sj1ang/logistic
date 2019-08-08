import {TourActivity} from "@/engine/domain/Activity";
import {Route} from "@/engine/domain/Route";
import {ActivityCaution, ActivityError, ActivityNotice, Notice, RouteCaution, RouteError} from "@/engine/domain/Notice";
import {Constants} from "@/engine/Constant/Constants";

export interface Constraint{

}

export interface SoftConstraint extends Constraint{

}

export interface HardConstraint extends Constraint{

}

export interface SoftActivityConstraint extends SoftConstraint{
  calculateActivityPenalty(activity: TourActivity): Array<SoftConstraintResult>;
}

export interface SoftRouteConstraint extends SoftConstraint{
  calculateRoutePenalty(route: Route): Array<SoftConstraintResult>;
}

export interface HardRouteConstraint extends HardConstraint{
  isFulfilled(route: Route): Array<HardConstraintResult>;
}

export class TimeWindowConstraint implements SoftActivityConstraint{
  calculateActivityPenalty(activity: TourActivity): Array<SoftConstraintResult> {
    let penalty: number = 0;
    let timeDiff: number = activity.startTime - activity.twEnd;
    let notice: Notice | undefined;
    let results: Array<SoftConstraintResult> = new Array<SoftConstraintResult>();

    if(timeDiff > 0.0001 && timeDiff <= Constants.DELAY_THRESHOLD){
      penalty += timeDiff * Constants.DELAY_PENALTY_PER_MIN;
      notice = new ActivityCaution(activity, "预计延误 " + timeDiff + " 分钟", Constants.DELAY_CAUTION_CODE);
      results.push(new SoftConstraintResult(penalty, notice));
    }else if(timeDiff > Constants.DELAY_THRESHOLD){
      penalty += (timeDiff - Constants.DELAY_THRESHOLD) * Constants.DELAY_PENALTY_PER_MIN * Constants.DELAY_PENALTY_TIMES + timeDiff * Constants.DELAY_PENALTY_PER_MIN;
      notice = new ActivityError(activity, "预计延误 " + timeDiff.toFixed(0) + " 分钟", Constants.DELAY_ERROR_CODE);
      results.push(new SoftConstraintResult(penalty, notice));
    }

    return results;
  }
}

export class SoftConstraintResult{
  penalty: number;
  notice: Notice | undefined;

  constructor(penalty: number, notice: Notice | undefined){
    this.penalty = penalty;
    this.notice = notice;
  }
}

export class HardConstraintResult{
  isFulfilled: boolean;
  notice: Notice | undefined;

  constructor(isFulfilled: boolean, notice: Notice | undefined){
    this.isFulfilled = isFulfilled;
    this.notice = notice;
  }

}

export class LoadConstraint implements SoftRouteConstraint{
  calculateRoutePenalty(route: Route): Array<SoftConstraintResult> {
    let penalty: number = 0;
    let notice: Notice | undefined;
    let results: Array<SoftConstraintResult> = new Array<SoftConstraintResult>();

    if(route.driver && route.driver.vehicle) {
      let vehicle = route.driver.vehicle;
      let overLoad = route.load.calOverload(vehicle.capacity);

      for(let i in Constants.OVERLOAD_THRESHOLD){
      //  add caution or error here!
        let overloadThreshold = vehicle.capacity.size[i] * Constants.OVERLOAD_THRESHOLD[i];
        if(overLoad.size[i] > 0 && overLoad.size[i] <= overloadThreshold){
          penalty = overLoad.size[i] * Constants.OVERLOAD_PENALTY_PER_UNIT[i];
          notice = new RouteCaution(route, Constants.LOAD_TITLE[i] + " 预计超载 " + overLoad.size[i] + " 单位", Constants.OVERLOAD_CAUTION_CODE);

          results.push(new SoftConstraintResult(penalty, notice));
        }else if(overLoad.size[i] > overloadThreshold){
          penalty = overLoad.size[i] * Constants.OVERLOAD_PENALTY_PER_UNIT[i] * Constants.OVERLOAD_PENALTY_TIMES[i];
          notice = new RouteError(route, Constants.LOAD_TITLE[i] + " 预计超载 " + overLoad.size[i] + " 单位", Constants.OVERLOAD_ERROR_CODE);

          results.push(new SoftConstraintResult(penalty, notice));
        }
      }
    }

    return results;
  }

}

export class DriverAssignmentConstraint implements HardRouteConstraint{
  isFulfilled(route: Route): Array<HardConstraintResult> {
    let isFulfilled: boolean = true;
    let notice: Notice | undefined;
    let results: Array<HardConstraintResult> = new Array<HardConstraintResult>();

    if(route.driver){
      if(route.driver.routeUids.size > 1){
        isFulfilled = false;
        notice = new RouteError(route, "司机被分配在了不同线路", Constants.DRIVER_ASSIGNMENT_ERROR_CODE);
      }
    }

    results.push(new HardConstraintResult(isFulfilled, notice));

    return results;
  }
}

export class ConstraintManager implements SoftActivityConstraint, SoftRouteConstraint, HardRouteConstraint{
  softActivityConstraints: Array<SoftActivityConstraint>;
  softRouteConstraints: Array<SoftRouteConstraint>;
  hardRouteConstraints: Array<HardRouteConstraint>;

  constructor(){
    this.softActivityConstraints = new Array<SoftActivityConstraint>();
    this.softRouteConstraints = new Array<SoftRouteConstraint>();
    this.hardRouteConstraints = new Array<HardRouteConstraint>();
  }

  calculateActivityPenalty(activity: TourActivity): Array<SoftConstraintResult> {
    let results: Array<SoftConstraintResult> = new Array<SoftConstraintResult>();
    for(let i in this.softActivityConstraints){
      let singleConstraintResult = this.softActivityConstraints[i].calculateActivityPenalty(activity);
      results = results.concat(singleConstraintResult);
    }

    return results;
  }

  calculateRoutePenalty(route: Route): Array<SoftConstraintResult> {
    let results: Array<SoftConstraintResult> = new Array<SoftConstraintResult>();
    for(let i in this.softRouteConstraints){
      let singleConstraintResult = this.softRouteConstraints[i].calculateRoutePenalty(route);
      results = results.concat(singleConstraintResult);
    }

    return results;
  }

  addConstraint(constraint: Constants){
    if(isSoftActivityConstraint(constraint)){
      this.softActivityConstraints.push(constraint);
    }else if(isSoftRouteConstraint(constraint)){
      this.softRouteConstraints.push(constraint);
    }else if(isHardRouteConstraint(constraint)){
      this.hardRouteConstraints.push(constraint);
    }
  }

  isFulfilled(route: Route): Array<HardConstraintResult> {
    let results: Array<HardConstraintResult> = new Array<HardConstraintResult>();
    for(let i in this.hardRouteConstraints){
      let singleConstraintResult = this.hardRouteConstraints[i].isFulfilled(route);
      results = results.concat(singleConstraintResult);
    }

    return results;
  }
}

function isSoftActivityConstraint(arg: Constraint): arg is SoftActivityConstraint {
  return (arg as SoftActivityConstraint).calculateActivityPenalty !== undefined;
}

function isSoftRouteConstraint(arg: Constraint): arg is SoftRouteConstraint {
  return (arg as SoftRouteConstraint).calculateRoutePenalty !== undefined;
}

function isHardRouteConstraint(arg: Constraint): arg is HardRouteConstraint{
  return (arg as HardRouteConstraint).isFulfilled !== undefined;
}

