import {ContentItem} from "@/engine/domain/ContentItem";

export interface Box {
  type: string;
  items: Array<ContentItem>;
  addItem(item: ContentItem): void;
}

export class BoxImpl implements Box{
  items: Array<ContentItem>;
  type: string;

  constructor(type: string){
    this.items = new Array<ContentItem>();
    this.type = type;
  }

  addItem(item: ContentItem){
    this.items.push(item);
  }
}
