import {getScenarioRecordByDate} from "@/api";
import {Constants} from "@/engine/Constant/Constants";
import {MyFile, ScenarioFile} from "@/engine/domain/Scenario";
import {Vue} from "vue-property-decorator";

export class FileManager{
  fileMap: Map<string, number>;

  currentFileName: string = '';
  currentFileStatus: number = -1;
  currentKey: string = '';

  constructor(){
    this.fileMap = new Map();
  }

  fetchStatus(targetDate: Date, type: number): void{
    // @ts-ignore
    let dateStr = targetDate.Format("yyyy-MM-dd")
    let params = {params: {date: dateStr, type: type}};
    let key = dateStr + "-" + type;

    this.updateStatus(key, Constants.IS_CHECKING);

    getScenarioRecordByDate(params).then(res=>{
      if(res){
        let scenarioFile = new ScenarioFile(res.id, res.name, res.type, new Date(res.targetDate), new Date(res.createTime), new Date(res.lastModificationTime), res.scenarioId, res.isOfficial, res.creator, res.productVersion, res.geoVersion);
        setTimeout(()=>{this.updateStatus(key, Constants.SCENARIO_EXISTING)}, 500)
      }else{
        setTimeout(()=>{this.updateStatus(key, Constants.SCENARIO_NOT_EXISTING)}, 500)
      }
    })
  }

  checkStatus(targetDate: Date, type: number){
    // @ts-ignore
    let key = targetDate.Format("yyyy-MM-dd");
    if(type == Constants.ORDER_SCENARIO){
      this.currentFileName = key + "物流计划单"
      key += "-" + type;
    }else if(type == Constants.DELIVERY_SCENARIO){
      this.currentFileName = key +  "物流结单";
      key += "-" + type;
    }else{
      this.cleanFileProperties();
      return
    }

    if(key != this.currentKey){
      this.currentFileStatus = Constants.NOT_CHECKED;
      this.currentKey = key;
    }

    let status = this.fileMap.get(key);

    if(!status){
      this.fetchStatus(targetDate, type);
    }else{
      //javascript is single thread? right? T-T
      this.currentFileStatus = status;
    }
  }

  updateStatus(key: string, status: number){
    this.fileMap.set(key, status);

    if(key == this.currentKey){
      this.currentFileStatus = status;
      console.log(this.currentFileStatus);
    }
  }

  cleanFileProperties(){
    this.currentFileName = "";
    this.currentFileStatus = -1;
    this.currentKey = "";
  }

  static fetchScenarioRecordByDate(targetDate: Date, type: number){
    // @ts-ignore
    let dateStr = targetDate.Format("yyyy-MM-dd")
    let params = {params: {date: dateStr, type: type}};

    return getScenarioRecordByDate(params);
  }
}

export class FileManagerFactory{

  static instance: FileManager

  static getInstance(){
    if(!this.instance)
      this.instance = new FileManager()
    return this.instance;
  }
}
