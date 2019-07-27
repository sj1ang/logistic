export interface TransportCostMatrix {

}

export interface DistanceTransportCostMatrix extends TransportCostMatrix{
  getDistance(from: number, to: number): number;
}

export interface DurationTransportCostMatrix extends TransportCostMatrix{
  getDuration(from: number, to: number): number;
}

export class TransportCostMatrixManager implements DistanceTransportCostMatrix, DurationTransportCostMatrix{
  static instance: TransportCostMatrixManager;

  static getInstance(): TransportCostMatrixManager{
    if(!this.instance){
      this.instance = new TransportCostMatrixManager();
    }
    return this.instance;
  }

  distanceTransportCostMatrix: Map<string, number>;
  durationTransportCostMatrix: Map<string, number>;

  constructor(){
    this.distanceTransportCostMatrix = new Map();
    this.durationTransportCostMatrix = new Map();
    for(let i = 0; i < 100; i++){
      for(let j = 0; j < 100; j++){
        if(i != j) {
          this.putDistance(i, j, j + 0.1);
          this.putDuration(i, j, j);
        }
      }
    }
  }

  putDistance(from: number, to: number, distance: number): void{
    let key = from + "-" + to;
    this.distanceTransportCostMatrix.set(key, distance);
  }

  putDuration(from:number, to: number, duration: number): void{
    let key = from + "-" + to;
    this.durationTransportCostMatrix.set(key, duration);
  }


  getDistance(from: number, to: number): number {
    let key = from + "-" + to;
    let distance = this.distanceTransportCostMatrix.get(key);
    distance = distance ? distance : 0;
    return distance;
  }


  getDuration(from: number, to: number): number {
    let key = from + "-" + to;
    let duration = this.durationTransportCostMatrix.get(key);
    duration = duration ? duration : 0;
    return duration;
  }

}
