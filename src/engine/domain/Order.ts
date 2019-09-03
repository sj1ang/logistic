import {Box} from "@/engine/domain/Box";
import {ContentItem} from "@/engine/domain/ContentItem";

export interface Order {
  boxes: Array<Box>;
  items: Array<ContentItem>;

}

export class OrderImpl implements Order{
  boxes: Array<Box>;
  items: Array<ContentItem>;

  constructor(){
    this.boxes = new Array<Box>();
    this.items = new Array<ContentItem>();
  }

  addBox(box: Box){
    this.boxes.push(box);
  }

  addItem(item: ContentItem){
    this.items.push(item);
  }

}
