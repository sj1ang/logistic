import {VirtualBill} from "@/engine/domain/VirtualBill";

export interface SubTask {
  bill: VirtualBill;
}

export class SubTaskImpl implements SubTask{
  bill: VirtualBill;

  constructor(bill: VirtualBill){
    this.bill = bill;
  }
}
