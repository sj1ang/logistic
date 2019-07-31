import {ShipmentTourActivity, TourActivity} from "@/engine/domain/Activity";
import {MyLocationFactory} from "@/engine/domain/MyLocation";

// export interface ShipmentPool {
//   shipments: Array<TourActivity>;
//   addShipmentTourActivity(tourActivity: TourActivity): void;
//   update(): void;
// }

export class ShipmentPool{
  static instance: ShipmentPool;
  shipments: Array<TourActivity>;

  constructor() {
    this.shipments = new Array<TourActivity>();
  }

  static getInstance(){
    if(!this.instance){
      this.instance = new ShipmentPool();
    }

    return this.instance;
  }

  addShipmentTourActivity(tourActivity: TourActivity): void {
    this.shipments.push(tourActivity);
  }

  update(): void{
    this.shipments = this.shipments.filter(x=>{
      if(x instanceof ShipmentTourActivity) return true;
    })

    for(let i in this.shipments){
      this.shipments[i].unassign();
    }
  }

}


