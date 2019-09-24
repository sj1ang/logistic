import {ScenarioHandler} from "@/engine/domain/ScenarioHandler";
import {TaskPool} from "@/engine/domain/Task";

export interface TaskFetcher {
  fetchTasks(): Promise<any>;
}

export class OrderTaskFetcher implements TaskFetcher{
  fetchTasks() {
    return ScenarioHandler.getInstance().fetchAllEssentials().then(res=>{
      console.log('all essentials received...');
      return TaskPool.getInstance().fetchTasks(true);
    });
  }
}

export class DeliveryTaskFetcher implements TaskFetcher{
  fetchTasks() {
    return ScenarioHandler.getInstance().fetchAllEssentials().then(res=>{
      console.log('all essentials received...');
      return TaskPool.getInstance().fetchTasks(true);
    });
  }
}

export class MockTaskFetcher implements TaskFetcher{
  fetchTasks() {
    return ScenarioHandler.getInstance().fetchAllEssentials().then(res=>{
      console.log('all essentials received...');
      return TaskPool.getInstance().fetchTasks(false);
    });
  }
}


