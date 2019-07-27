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
  calculatePenalty(activity: TourActivity): Array<SoftConstraintResult>;
}

export interface RouteConstraint extends Constraint{

}

export class TimeWindowConstraint implements SoftActivityConstraint{
  calculatePenalty(activity: TourActivity): Array<SoftConstraintResult> {
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

export class ConstraintManager implements SoftActivityConstraint{
  softActivityConstraints: Array<SoftActivityConstraint>;

  constructor(){
    this.softActivityConstraints = new Array<SoftActivityConstraint>();
  }

  calculatePenalty(activity: TourActivity): Array<SoftConstraintResult> {
    let results: Array<SoftConstraintResult> = new Array<SoftConstraintResult>();

    for(let i in this.softActivityConstraints){
      let singleConstraintResult = this.softActivityConstraints[i].calculatePenalty(activity);
      results = results.concat(singleConstraintResult);
    }

    return results;
  }

  addConstraint(constraint: Constants){
    if(isSoftActivityConstraint(constraint)){
      this.softActivityConstraints.push(constraint);
    }
  }
}

function isSoftActivityConstraint(arg: Constraint): arg is SoftActivityConstraint {
  return (arg as SoftActivityConstraint).calculatePenalty !== undefined;
}

