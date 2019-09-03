import {Product} from "@/engine/domain/Product";

export interface ContentItem {
  product: Product;
  quantity: number;
}

export class ContentItemImpl implements ContentItem{
  product: Product;
  quantity: number;

  constructor(product: Product, quantity: number){
    this.product = product;
    this.quantity = quantity;
  }
}


