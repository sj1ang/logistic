import {getScenario} from "@/api";
import {MyLocationPool} from "@/engine/domain/MyLocation";
import {TransportCostMatrixManager} from "@/engine/domain/TransportCostMatrix";
import {TaskPool} from "@/engine/domain/Task";
import {ProductPool} from "@/engine/domain/Product";

export class ScenarioHandler {
  fetchScenario(params: any){
    return getScenario(params);
  }

  fetchEssentials(){
    return MyLocationPool.getInstance().fetchLocations()
      .then(TransportCostMatrixManager.getInstance().fetchTransportCostMatrix)
      .then(ProductPool.getInstance().fetchProduct);
  }

  fetchEssentialsAndScenario(params: any){
    return this.fetchEssentials().then(res=>{
      return this.fetchScenario(params);
    })
  }
}
