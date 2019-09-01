import {hasId} from "@/engine/domain/Id";
import {genUID} from "@/utils/common";
import {Order} from "@/engine/domain/Order";
import {getTasks} from "@/api";
import {AxiosRequestConfig} from "axios";

export interface Task extends hasId{
  name: string;
  orders: Array<Order>;
}

export class TaskImpl implements Task{
  name: string;
  uid: string;
  orders: Array<Order>;

  constructor(name: string){
    this.uid = genUID();
    this.name = name;
    this.orders = new Array<Order>()
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

  fetchTasks() {
    let params: any = {};
    getTasks(params).then(res=>{
      console.log(res);
    });
  }
}
