import {getProducts} from "@/api";

export interface Product {
  code: string;
  name: string;
  unit: string;
}

export class ProductImpl implements Product{
  code: string;
  name: string;
  unit: string;

  constructor(code: string, name: string, unit: string){
    this.code = code;
    this.name = name;
    this.unit = unit;
  }
}

export class ProductPool{
  static instance: ProductPool;
  map: Map<string, Product>;

  static getInstance(): ProductPool{
    if(!this.instance){
      this.instance = new ProductPool();
    }
    return this.instance;
  }

  constructor(){
    this.map = new Map();
  }

  addProduct(product: Product): void{
    this.map.set(product.code, product);
  }

  fetchProduct(){
    let params = {};

    return getProducts(params).then(res => {
      for(let p in res){
        let product : Product = new ProductImpl(res[p].prodCode, res[p].prodName, res[p].unit);
        ProductPool.getInstance().addProduct(product);
      }

      return Promise.resolve("fetch product success");
    });
  }


}

