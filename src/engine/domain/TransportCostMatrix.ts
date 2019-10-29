import {getTransportCosts} from "@/api";

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

  static cleanManager(): void{
    this.instance = new TransportCostMatrixManager();
  }

  fetchTransportCostMatrix(){
    let params = {};
    return getTransportCosts(params).then(res=>{
      TransportCostMatrixManager.cleanManager();
      for(let i in res){
        let row = res[i];
        TransportCostMatrixManager.getInstance().putDuration(row.fromId, row.toId, Math.ceil(row.duration));
        TransportCostMatrixManager.getInstance().putDistance(row.fromId, row.toId, parseFloat(row.distance));
      }

      return Promise.resolve(res);
    })
  }

  generateDistanceCostArray(){
    let distances: Array<TransportCostCell> = new Array<TransportCostCell>();
    this.distanceTransportCostMatrix.forEach((value, key) => {
      let tmps = key.split("-");
      distances.push(new TransportCostCell(parseInt(tmps[0]), parseInt(tmps[1]), value));
    })
    return distances;
  }

  generateDurationCostArray(){
    let durations: Array<TransportCostCell> = new Array<TransportCostCell>();
    this.durationTransportCostMatrix.forEach((value, key) => {
      let tmps = key.split("-");
      durations.push(new TransportCostCell(parseInt(tmps[0]), parseInt(tmps[1]), value));
    })
    return durations;
  }

  static cleanMatrix(){
    this.instance = new TransportCostMatrixManager();
  }

  assembleTransportCostMatrixFromScenario(scenario: any){
    TransportCostMatrixManager.cleanMatrix();

    for(let i in scenario.distances){
      TransportCostMatrixManager.getInstance().putDistance(scenario.distances[i].from, scenario.distances[i].to, scenario.distances[i].value);
    }

    for(let i in scenario.durations){
      TransportCostMatrixManager.getInstance().putDuration(scenario.durations[i].from, scenario.durations[i].to, scenario.durations[i].value);
    }
  }
}

export class TransportCostCell{
  from: number;
  to: number;
  value: number;

  constructor(from: number, to: number, value: number){
    this.from = from;
    this.to = to;
    this.value = value;
  }
}
