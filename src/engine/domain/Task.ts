import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";

export interface Task extends hasId{
  name: string;
}

export class TaskImpl implements Task{
  name: string;
  uid: string;

  constructor(name: string){
    this.uid = genUID();
    this.name = name;
  }
}

export class TaskPool{
  static instance: TaskPool;
  tasks: Array<Task>;

  constructor(){
    this.tasks = new Array<Task>();
  }

  static getInstance(): TaskPool{
    if(!this.instance){
      this.instance = new TaskPool();
    }

    return this.instance;
  }

  addTask(task: Task){
    this.tasks.push(task);
  }

  createTask(name: string): Task{
    let task = new TaskImpl(name);
    this.addTask(task);

    return task;
  }

}
