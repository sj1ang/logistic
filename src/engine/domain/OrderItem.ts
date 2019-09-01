import {Product} from "@/engine/domain/Product";

export interface OrderItem {
  product: Product;
  quantity: number;
}

export class OrderItemImpl implements OrderItem{
  product: Product;
  quantity: number;

  constructor(product: Product, quantity: number){
    this.product = product;
    this.quantity = quantity;
  }
}


