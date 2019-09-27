import {ScenarioFile} from "@/engine/domain/Scenario";

export class ScenarioFileStatus{
  status: number;
  file: ScenarioFile | undefined;

  constructor(status: number, file: ScenarioFile | undefined){
    this.status = status;
    this.file = file;
  }
}
