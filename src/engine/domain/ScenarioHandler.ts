import {getScenario} from "@/api";

export class ScenarioHandler {
  fetchScenario(params: any){

    return getScenario(params).then(res=>{
      console.log(res);
      return Promise.resolve('scenario fetched successfully...');
    })
  }
}
