import {BillEntry} from "@/engine/domain/BillEntry";

export interface VirtualBill{
  delidate: Date,
  name: string,
  entries: Array<BillEntry>,
}

export class VirtualBillImpl implements VirtualBill{
  delidate: Date;
  entries: Array<BillEntry>;
  name: string;

  constructor(delidate: Date, name: string){
    this.delidate = delidate;
    this.name = name;
    this.entries = new Array<BillEntry>();
  }

  addBillEntry(entry: BillEntry){
    this.entries.push(entry);
  }
}
