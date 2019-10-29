import {Constants} from "@/engine/Constant/Constants";

export class BoxCollection{
  boxTypes: Array<string>;
  boxSent: Array<number>;
  boxReturned: Array<number>;

  constructor(){
    this.boxTypes = Constants.BOX_COLLECTION_ARRAY;
    this.boxSent = new Array<number>(this.boxTypes.length);
    this.boxReturned = new Array<number>(this.boxTypes.length);

    this.boxSent.fill(0);
    this.boxReturned.fill(0);
  }
}
