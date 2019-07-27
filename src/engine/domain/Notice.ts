import {Route} from "@/engine/domain/Route";
import {TourActivity} from "@/engine/domain/Activity";

export interface Notice {
  icon: string;
  hint: string;
  color: string;
}

export interface RouteNotice extends Notice{
  route: Route;
}

export class RouteCaution implements RouteNotice{
  hint: string;
  icon: string;
  color: string;
  route: Route;

  constructor(route: Route, hint: string){
    this.route = route;
    this.hint = hint;
    this.icon = 'el-icon-warning-outline';
    this.color = '#E6A23C'
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
    }

    return this.noticeLevel;
  }

  addNotice(notice: RouteNotice){
    this.notices.push(notice);
    this.checkNoticeLevel();
  }

  clear(){
    this.notices = new Array<RouteNotice>();
  }
}





// ----------------activity----------------

export interface ActivityNotice extends Notice{

}

export class ActivityCaution implements ActivityNotice{
  hint: string;
  icon: string;
  color: string;
  activity: TourActivity;

  constructor(activity: TourActivity, hint: string){
    this.hint = hint;
    this.icon = 'el-icon-warning-outline';
    this.color = '#E6A23C'
    this.activity = activity;
  }
}

export class ActivityError implements ActivityNotice{
  hint: string;
  icon: string;
  color: string;
  activity: TourActivity;

  constructor(activity: TourActivity, hint: string){
    this.hint = hint;
    this.icon = 'el-icon-circle-close';
    this.color = '#E6A23C'
    this.activity = activity;
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
