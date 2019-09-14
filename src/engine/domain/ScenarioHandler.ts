import {getRecords, getScenario, postScenario} from "@/api";
import { MyLocationPool } from "@/engine/domain/MyLocation";
import { TransportCostMatrixManager } from "@/engine/domain/TransportCostMatrix";
import { TaskPool } from "@/engine/domain/Task";
import { ProductPool } from "@/engine/domain/Product";
import {ScenarioDTO, ScenarioFile, ScenarioImpl} from "@/engine/domain/Scenario";
import {IgnorePluginOptions} from "webpack/declarations/plugins/IgnorePlugin";

export class ScenarioHandler {
  static instance: ScenarioHandler;

  files: Array<ScenarioFile>;
  file: ScenarioFile |undefined;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ScenarioHandler();
    }
    return this.instance;
  }

  constructor() {
    this.files = new Array<ScenarioFile>();
  }

  setSelectedScenarioFile(file: ScenarioFile){
    this.file = file;
    console.log(this.file);
  }

  fetchScenario(params: any) {
    return getScenario(params);
  }

  fetchEssentials() {
    return MyLocationPool.getInstance()
      .fetchLocations()
      .then(TransportCostMatrixManager.getInstance().fetchTransportCostMatrix)
      .then(ProductPool.getInstance().fetchProduct);
  }

  fetchEssentialsAndScenario(params: any) {
    return this.fetchEssentials().then(res => {
      return this.fetchScenario(params);
    });
  }

  // constructor(id: number, name: string, targetDate: Date, createTime: Date, lastModificationTime: Date, scenarioId: number,
  //             isOfficial: number, creator: string, productVersion: string, geoVersion: string){
  fetchScenarioFileList() {
    let params = {};
    this.files = new Array<ScenarioFile>();
    return getRecords(params).then(res => {
      for(let i in res){
        let row = res[i];
        this.files.push(new ScenarioFile(row.id, row.name, row.type, new Date(row.targetDate), new Date(row.createTime),
          new Date(row.lastModificationTime), row.scenarioId, row.isOfficial, row.creator, row.productVersion, row.geoVersion));
      }
      return Promise.resolve('files received successfully');
    });
  }

  saveScenario(){
    let scenario = new ScenarioImpl();
    let scenarioDTO = new ScenarioDTO(scenario);

    if(this.file) {
      this.file.lastModificationTime = new Date();
    }else{
      //TODO
      // this.file = new ScenarioFile();
    }

    let transData = {...this.file, content: scenarioDTO};

    if(this.file) {
      // @ts-ignore
      transData.createTime = this.file.createTime.Format('yyyy-MM-dd hh:mm:ss');
      // @ts-ignore
      transData.lastModificationTime = this.file.lastModificationTime.Format('yyyy-MM-dd hh:mm:ss');
      // @ts-ignore
      transData.targetDate = this.file.targetDate.Format('yyyy-MM-dd hh:mm:ss');
    }
    console.log(transData);
    let params = JSON.stringify(transData);
    return postScenario(params);
  }
}


// @ts-ignore
Date.prototype.Format = function(fmt: any)
{
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
      // @ts-ignore
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
}
