import {ScenarioHandler} from "@/engine/domain/ScenarioHandler";
import {TaskPool} from "@/engine/domain/Task";
import {Constants} from "@/engine/Constant/Constants";

export interface TaskFetcher {
  fetchTasks(): Promise<any>;
}

export class OrderTaskFetcher implements TaskFetcher{
  from: Date;
  to: Date;

  constructor(from: Date, to:Date){
    this.from = from;
    this.to = to;
  }

  fetchTasks() {
    return ScenarioHandler.getInstance().fetchAllEssentials().then(res=>{
      console.log('all essentials received...');
      // @ts-ignore
      return TaskPool.getInstance().fetchTasks(true, Constants.FETCH_ORDER_TASKS, this.from.Format("yyyy-MM-dd"), this.to.Format("yyyy-MM-dd"));
    });
  }
}

export class DeliveryTaskFetcher implements TaskFetcher{
  from: Date;
  to: Date;

  constructor(from: Date, to:Date){
    this.from = from;
    this.to = to;
  }

  fetchTasks() {
    return ScenarioHandler.getInstance().fetchAllEssentials().then(res=>{
      console.log('all essentials received...');
      // @ts-ignore
      return TaskPool.getInstance().fetchTasks(true, Constants.FETCH_DELIVERY_TASKS, this.from.Format("yyyy-MM-dd"), this.to.Format("yyyy-MM-dd"));
    });
  }
}

export class MockTaskFetcher implements TaskFetcher{
  fetchTasks() {
    return ScenarioHandler.getInstance().fetchAllEssentials().then(res=>{
      console.log('all essentials received...');
      return TaskPool.getInstance().fetchTasks(false, Constants.FETCH_MOCK_TASKS, undefined, undefined);
    });
  }
}


