import {Box} from "@/engine/domain/Box";
import {OrderItem} from "@/engine/domain/OrderItem";

export interface Order {
  boxes: Array<Box>;
  items: Array<OrderItem>;

}

export class OrderImpl implements Order{
  boxes: Array<Box>;
  items: Array<OrderItem>;

  constructor(){
    this.boxes = new Array<Box>();
    this.items = new Array<OrderItem>();
  }

  addBox(box: Box){
    this.boxes.push(box);
  }

  addItem(item: OrderItem){
    this.items.push(item);
  }

}
