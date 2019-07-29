import {TourActivity} from "@/engine/domain/Activity";
import {Route} from "@/engine/domain/Route";
import {ActivityCaution, ActivityError, ActivityNotice, Notice} from "@/engine/domain/Notice";
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

export class TimeWindowConstraint implements SoftActivityConstraint{
  calculateActivityPenalty(activity: TourActivity): Array<SoftConstraintResult> {
    let penalty: number = 0;
    let timeDiff: number = activity.startTime - activity.twEnd;
    let notice: Notice | undefined;
    let results: Array<SoftConstraintResult> = new Array<SoftConstraintResult>();

    if(timeDiff > 0.0001 && timeDiff <= Constants.DELAY_THRESHOLD){
      penalty += timeDiff * Constants.DELAY_PENALTY_PER_MIN;
      notice = new ActivityCaution(activity, "delay " + timeDiff + " min(s)");
    }else if(timeDiff > Constants.DELAY_THRESHOLD){
      penalty += (timeDiff - Constants.DELAY_THRESHOLD) * Constants.DELAY_PENALTY_PER_MIN * Constants.DELAY_PENALTY_TIMES + timeDiff * Constants.DELAY_PENALTY_PER_MIN;
      notice = new ActivityError(activity, "delay " + timeDiff.toFixed(0) + " min(s)");
    }

    results.push(new SoftConstraintResult(penalty, notice));
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

export class LoadConstraint implements SoftRouteConstraint{
  calculateRoutePenalty(route: Route): Array<SoftConstraintResult> {
    let penalty: number = 0;
    let notice: Notice | undefined;
    let results: Array<SoftConstraintResult> = new Array<SoftConstraintResult>();

    if(route.driver && route.driver.vehicle) {
      let vehicle = route.driver.vehicle;
      console.log("calculating load penalty...");
    }

    results.push(new SoftConstraintResult(penalty, notice));
    return results;
  }

}

export class ConstraintManager implements SoftActivityConstraint, SoftRouteConstraint{
  softActivityConstraints: Array<SoftActivityConstraint>;
  softRouteConstraints: Array<SoftRouteConstraint>;

  constructor(){
    this.softActivityConstraints = new Array<SoftActivityConstraint>();
    this.softRouteConstraints = new Array<SoftRouteConstraint>();
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
    }
  }
}

function isSoftActivityConstraint(arg: Constraint): arg is SoftActivityConstraint {
  return (arg as SoftActivityConstraint).calculateActivityPenalty !== undefined;
}

function isSoftRouteConstraint(arg: Constraint): arg is SoftRouteConstraint {
  return (arg as SoftRouteConstraint).calculateRoutePenalty !== undefined;
}

