import {Constants} from "@/engine/Constant/Constants";

export interface Load {
  size: Array<number>;
  add(load: Load): Load;
  minus(load: Load): Load;
  max(load: Load): Load;
  // calOverload(capacity: Load): Load;
  reverse(): void;
}

export class LoadImpl implements Load{
  size: Array<number>;

  constructor(size: Array<number>){
    this.size = new Array<number>();
    for(let i = 0; i < Constants.LOAD_TITLE.length; i++){
      this.size[i] = 0;
    }

    for(let i = 0; i < size.length; i++){
      this.size[i] =size[i];
      if(i == Constants.LOAD_TITLE.length - 1) break;
    }

  }

  add(load: Load): Load {
    let resultLoad = new LoadImpl([0]);
    for(let i in resultLoad.size){
      resultLoad.size[i] = this.size[i] + load.size[i];
    }
    return resultLoad;
  }

  minus(load: Load): Load {
    let resultLoad = new LoadImpl([0]);
    for(let i in resultLoad.size){
      resultLoad.size[i] = this.size[i] - load.size[i];
    }
    return resultLoad;
  }

  reverse(): void {
    for(let i in this.size){
      this.size[i] = - this.size[i];
    }
  }

  max(load: Load): Load {
    let resultLoad = new LoadImpl([0]);
    for(let i in resultLoad.size){
      resultLoad.size[i] = this.size[i] < load.size[i] ? load.size[i] : this.size[i];
    }
    return resultLoad;
  }

  // calOverload(capacity: Load): Load{
  //   let overload: Load = new LoadImpl([0, 0]);
  //   for(let i in capacity.size){
  //     overload.size[i] = this.size[i] > capacity.size[i] ? this.size[i] - capacity.size[i] : 0;
  //   }
  //
  //   return overload;
  // }
}
