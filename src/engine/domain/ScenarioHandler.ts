import {getScenario} from "@/api";
import {MyLocationPool} from "@/engine/domain/MyLocation";
import {TransportCostMatrixManager} from "@/engine/domain/TransportCostMatrix";
import {TaskPool} from "@/engine/domain/Task";

export class ScenarioHandler {
  fetchScenario(params: any){
    return getScenario(params);
  }

  fetchLocationAndTransportCostMatrix(){
    return MyLocationPool.getInstance().fetchLocations().then(TransportCostMatrixManager.getInstance().fetchTransportCostMatrix);
  }

  fetchEssentialsAndScenario(params: any){
    return this.fetchLocationAndTransportCostMatrix().then(res=>{
      return this.fetchScenario(params);
    })
  }
}
