import {VirtualBill} from "@/engine/domain/VirtualBill";
import {Box} from "@/engine/domain/Box";
import {Load} from "@/engine/domain/Load";

export interface SubTask {
  bill: VirtualBill;
  boxes: Array<Box>;
  load: Load;
}

export class SubTaskImpl implements SubTask{
  bill: VirtualBill;
  boxes: Array<Box>;
  load: Load;

  constructor(bill: VirtualBill, load: Load){
    this.bill = bill;
    this.boxes = new Array<Box>();
    this.load = load;
  }

  addBox(box: Box){
    this.boxes.push(box);
  }
}
