import {hasId} from "@/engine/domain/Id";
import {convertTime2Min, genUID} from "@/utils/common";
import {getTasks} from "@/api";
import {SubTask, SubTaskImpl} from "@/engine/domain/SubTask";
import {MyLocation, MyLocationPool} from "@/engine/domain/MyLocation";
import {BillEntryImpl} from "@/engine/domain/BillEntry";
import {VirtualBillImpl} from "@/engine/domain/VirtualBill";
import {Box, BoxImpl} from "@/engine/domain/Box";
import {ProductPool} from "@/engine/domain/Product";
import {ContentItemImpl} from "@/engine/domain/ContentItem";
import {Load, LoadImpl} from "@/engine/domain/Load";

export interface Task extends hasId{
  name: string;
  location: MyLocation | undefined;
  subTasks: Array<SubTask>;
  serviceTime: number;
  startTime: number;
  endTime: number;
  load: Load;

  addSubTask(subTask: SubTask): void;
}

export class TaskImpl implements Task{
  uid: string;
  name: string;
  location: MyLocation | undefined;
  subTasks: Array<SubTask>;
  serviceTime: number;
  startTime: number;
  endTime: number;
  load: Load;

  constructor(locationId: number, serviceTime: number, startTime: number, endTime: number, uid: string){
    this.uid = uid;
    this.location = MyLocationPool.getInstance().getLocation(locationId);
    this.name = this.location ? this.location.alias : "no-name";
    this.subTasks = new Array<SubTask>();
    this.serviceTime = serviceTime;
    this.startTime = startTime;
    this.endTime = endTime;
    this.load = new LoadImpl([0]);
  }

  addSubTask(subTask: SubTask){
    this.subTasks.push(subTask);
    this.load = this.load.add(subTask.load);
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

  getTask(uid: string): Task | undefined{
    return this.tasks.find(x=>{
      return x.uid == uid;
    })
  }

  createTask(locationId: number): Task{
    let task = new TaskImpl(locationId, 0, 0, 0, genUID());
    this.addTask(task);

    return task;
  }

  static cleanPool(): void{
    this.instance = new TaskPool();
  }

  fetchTasks() {
    console.log("start fetching tasks...")
    let params: any = {};

    return getTasks(params).then(res=>{
      TaskPool.cleanPool();

      for(let i in res){
        let tmp = res[i];
        let tmpSubTasks = res[i].subTasks;
        let serviceTime = tmp.requirement.serviceTime;
        let startTime = convertTime2Min(tmp.requirement.startTime);
        let endTime = convertTime2Min(tmp.requirement.endTime);

        let task = new TaskImpl(tmp.locationId, serviceTime, startTime, endTime, genUID());
        for(let j in tmpSubTasks){
          let tmpSubTask = tmpSubTasks[j];
          let tmpBill = tmpSubTask.bill;
          let tmpEntries = tmpBill.entries;
          let tmpBoxes = tmpSubTask.packedBoxes;

          let bill = new VirtualBillImpl(new Date(), tmpBill.name);
          for(let k in tmpEntries){
            let rawEntry = tmpEntries[k];
            let entry = new BillEntryImpl(rawEntry.billNo, rawEntry.prodCode, rawEntry.prodName, rawEntry.unit, rawEntry.qty, rawEntry.price, rawEntry.amount, rawEntry.remark);
            bill.addBillEntry(entry);
          }

          let subTask = new SubTaskImpl(bill, new LoadImpl(tmpSubTasks[j].load.size));

          for(let p in tmpBoxes){
            let tmpBox = tmpBoxes[p];
            let box: Box = new BoxImpl(tmpBox.box);
            for(let q in tmpBox.contents){
              let tmpContent = tmpBox.contents[q];
              let product = ProductPool.getInstance().map.get(tmpContent.prodcode);
              let quantity = tmpContent.quantity;
              if(product) {
                let content = new ContentItemImpl(product, quantity);
                box.addItem(content);
              }
            }
            subTask.addBox(box);
          }

          task.addSubTask(subTask);
        }
        TaskPool.getInstance().addTask(task);
      }

      return Promise.resolve("tasks fetched successfully!");
    });
  }

  assembleTasksFromScenario(scenario: any){
    TaskPool.cleanPool();

    let tmps = scenario.tasks;
    for(let i in tmps){
      let tmp = tmps[i];

      let task = new TaskImpl(tmp.location.id, tmp.serviceTime, tmp.startTime, tmp.endTime, tmp.uid);
      let tmpSubTasks = tmp.subTasks;

      for(let j in tmpSubTasks){
        let tmpSubTask = tmpSubTasks[j];
        let tmpBill = tmpSubTask.bill;
        let tmpEntries = tmpBill.entries;
        let tmpBoxes = tmpSubTask.boxes;

        let bill = new VirtualBillImpl(tmpBill.delidate, tmpBill.name);
        for(let k in tmpEntries){
          let rawEntry = tmpEntries[k];
          let entry = new BillEntryImpl(rawEntry.billNo, rawEntry.prodCode, rawEntry.prodName, rawEntry.unit, rawEntry.qty, rawEntry.price, rawEntry.amount, rawEntry.remark);
          bill.addBillEntry(entry);
        }

        let subTask = new SubTaskImpl(bill, new LoadImpl(tmpSubTasks[j].load.size));

        for(let p in tmpBoxes){
          let tmpBox = tmpBoxes[p];
          let box = new BoxImpl(tmpBox.type);
          for(let q in tmpBox.items){
            let tmpItem = tmpBox.items[q];
            let product = ProductPool.getInstance().map.get(tmpItem.product.code);
            let quantity = tmpItem.quantity;
            if(product){
              let item = new ContentItemImpl(product, quantity);
              box.addItem(item);
            }
          }
          subTask.addBox(box);
        }
        task.addSubTask(subTask);
      }
      TaskPool.getInstance().addTask(task);
    }
  }
}
