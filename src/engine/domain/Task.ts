import {hasId} from "@/engine/domain/Id";
import {convertTime2Min, genUID} from "@/utils/common";
import {getTasks} from "@/api";
import {SubTask, SubTaskImpl} from "@/engine/domain/SubTask";
import {MyLocation, MyLocationPool} from "@/engine/domain/MyLocation";
import {BillEntryImpl} from "@/engine/domain/BillEntry";
import {VirtualBillImpl} from "@/engine/domain/VirtualBill";

export interface Task extends hasId{
  name: string;
  location: MyLocation | undefined;
  subTasks: Array<SubTask>;
  serviceTime: number;
  startTime: number;
  endTime: number;
}

export class TaskImpl implements Task{
  uid: string;
  name: string;
  location: MyLocation | undefined;
  subTasks: Array<SubTask>;
  serviceTime: number;
  startTime: number;
  endTime: number;

  constructor(locationId: number, serviceTime: number, startTime: number, endTime: number){
    this.uid = genUID();
    this.location = MyLocationPool.getInstance().getLocation(locationId);
    this.name = this.location ? this.location.alias : "no-name";
    this.subTasks = new Array<SubTask>();
    this.serviceTime = serviceTime;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  addSubTask(subTask: SubTask){
    this.subTasks.push(subTask);
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

  createTask(locationId: number): Task{
    let task = new TaskImpl(locationId, 0, 0, 0);
    this.addTask(task);

    return task;
  }

  fetchTasks() {
    console.log("start fetching tasks...")
    let params: any = {};

    return getTasks(params).then(res=>{
      for(let i in res){
        let tmp = res[i];
        let tmpSubTasks = res[i].subTasks;

        let serviceTime = tmp.requirement.serviceTime;
        let startTime = convertTime2Min(tmp.requirement.startTime);
        let endTime = convertTime2Min(tmp.requirement.endTime);

        let task = new TaskImpl(tmp.locationId, serviceTime, startTime, endTime);
        for(let j in tmpSubTasks){
          let tmpSubTask = tmpSubTasks[j];
          let tmpBill = tmpSubTask.bill;
          let tmpEntries = tmpBill.entries;

          let bill = new VirtualBillImpl(new Date(), tmpBill.name);
          for(let k in tmpEntries){
            let rawEntry = tmpEntries[k];
            let entry = new BillEntryImpl(rawEntry.billNo, rawEntry.prodCode, rawEntry.prodName, rawEntry.unit, rawEntry.qty, rawEntry.price, rawEntry.amount, rawEntry.remark);
            bill.addBillEntry(entry);
          }

          let subTask = new SubTaskImpl(bill);
          task.addSubTask(subTask);
        }
        TaskPool.getInstance().addTask(task);
      }

      return Promise.resolve("tasks fetched successfully!");
    });
  }
}
