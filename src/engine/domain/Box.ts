import {OrderItem} from "@/engine/domain/OrderItem";

export interface Box {
  type: string;
  items: Array<OrderItem>;
}

export class BoxImpl implements Box{
  items: Array<OrderItem>;
  type: string;

  constructor(type: string){
    this.items = new Array<OrderItem>();
    this.type = type;
  }

  addItem(item: OrderItem){
    this.items.push(item);
  }
}
