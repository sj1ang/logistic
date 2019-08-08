import {Route} from "@/engine/domain/Route";
import {TourActivity} from "@/engine/domain/Activity";
import {Constants} from "@/engine/Constant/Constants";

export interface Notice {
  icon: string;
  hint: string;
  color: string;
  noticeLevel: number;
  code: number;
}

export interface RouteNotice extends Notice{
  route: Route;
}

export class RouteCaution implements RouteNotice{
  hint: string;
  icon: string;
  color: string;
  noticeLevel: number;
  route: Route;
  code: number;

  constructor(route: Route, hint: string, code: number){
    this.route = route;
    this.hint = hint;
    this.icon = 'el-icon-warning-outline';
    this.color = '#E6A23C';
    this.noticeLevel = 3;
    this.code = code;
  }
}

export class RouteError implements RouteNotice{
  hint: string;
  icon: string;
  color: string;
  noticeLevel: number;
  route: Route;
  code: number;

  constructor(route: Route, hint: string, code: number){
    this.route = route;
    this.hint = hint;
    this.icon = 'el-icon-error';
    this.color = '#E6A23C';
    this.noticeLevel = 5;
    this.code = code;
  }
}

export interface NoticeManager{
  noticeLevel: number;
  checkNoticeLevel(): number;
  clear(): void;
}


export class RouteNoticeManager implements NoticeManager{
  notices: Array<RouteNotice>;
  noticeLevel: number;

  constructor(){
    this.notices = new Array<RouteNotice>();
    this.noticeLevel = 0;
  }

  checkNoticeLevel(): number{
    for(let i in this.notices){
      if(this.notices[i] instanceof RouteCaution){
        this.noticeLevel = this.noticeLevel < 3 ? 3 : this.noticeLevel;
      }
      if(this.notices[i] instanceof RouteError){
        this.noticeLevel = this.noticeLevel < 5 ? 5 : this.noticeLevel;
      }
    }

    return this.noticeLevel;
  }

  addNotice(notice: RouteNotice){
    this.notices.push(notice);
    this.checkNoticeLevel();
  }

  clearDriverAssignmentNotice(){
    this.notices = this.notices.filter(x=>{
      if(x.code == Constants.DRIVER_ASSIGNMENT_ERROR_CODE) return false;
      return true;
    })
  }

  clear(){
    this.notices = new Array<RouteNotice>();
    this.noticeLevel = 0;
  }
}





// ----------------activity----------------

export interface ActivityNotice extends Notice{

}

export class ActivityCaution implements ActivityNotice{
  hint: string;
  icon: string;
  color: string;
  noticeLevel: number;
  activity: TourActivity;
  code: number;

  constructor(activity: TourActivity, hint: string, code: number){
    this.hint = hint;
    this.icon = 'el-icon-warning-outline';
    this.color = '#E6A23C'
    this.activity = activity;
    this.noticeLevel = 3;
    this.code = code;
  }
}

export class ActivityError implements ActivityNotice{
  hint: string;
  icon: string;
  color: string;
  noticeLevel: number;
  activity: TourActivity;
  code: number;

  constructor(activity: TourActivity, hint: string, code: number){
    this.hint = hint;
    this.icon = 'el-icon-circle-close';
    this.color = '#E6A23C'
    this.activity = activity;
    this.noticeLevel = 5;
    this.code = code;
  }
}

export class ActivityNoticeManager implements NoticeManager{
  notices: Array<ActivityNotice>;
  noticeLevel: number

  constructor(){
    this.notices = new Array<ActivityNotice>();
    this.noticeLevel = 0;
  }

  checkNoticeLevel(): number {
    for(let i in this.notices){
      if(this.notices[i] instanceof ActivityCaution){
        this.noticeLevel = this.noticeLevel < 3 ? 3 : this.noticeLevel;
      }
      if(this.notices[i] instanceof ActivityError){
        this.noticeLevel = this.noticeLevel < 5 ? 5 : this.noticeLevel;
      }
    }

    return this.noticeLevel;
  }

  addNotice(notice: ActivityNotice){
    this.notices.push(notice);
    this.checkNoticeLevel();
  }

  clear(): void {
    this.notices = new Array<ActivityNotice>();
    this.noticeLevel = 0;
  }

}
