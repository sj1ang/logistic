import {
  getRecords,
  getScenario,
  getScenarioRecordByDate,
  getTemplate,
  getTemplateRecords,
  postScenario,
  postTemplate
} from "@/api";
import { MyLocationPool } from "@/engine/domain/MyLocation";
import { TransportCostMatrixManager } from "@/engine/domain/TransportCostMatrix";
import { ProductPool } from "@/engine/domain/Product";
import {ScenarioDTO, ScenarioFile, ScenarioImpl, TemplateFile} from "@/engine/domain/Scenario";
import {Vehicle, VehiclePool} from "@/engine/domain/Vehicle";
import {DriverPool} from "@/engine/domain/Driver";
import {DeliveryTaskFetcher, MockTaskFetcher, OrderTaskFetcher, TaskFetcher} from "@/engine/domain/TaskFetcher";
import {TaskPool} from "@/engine/domain/Task";
import {ShipmentPool} from "@/engine/domain/ShipmentPool";
import {RoutePool} from "@/engine/domain/Route";
import {Constants} from "@/engine/Constant/Constants";
import {SaveManager, ScenarioSaveManager, TemplateSaveManager} from "@/engine/domain/SaveManager";
import {genUID} from "@/utils/common";

export class ScenarioHandler {
  static instance: ScenarioHandler;

  files: Array<ScenarioFile>;
  templateFiles: Array<TemplateFile>;
  // file: ScenarioFile |undefined;

  type: string | undefined;
  taskFetcher: TaskFetcher | undefined;
  saveManager: SaveManager | undefined;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ScenarioHandler();
    }
    return this.instance;
  }

  constructor() {
    this.files = new Array<ScenarioFile>();
    this.templateFiles = new Array<TemplateFile>();
  }

  fetchTasks(type: number, targetDate: Date | undefined){
    let that = this;
    if(type == Constants.FETCH_ORDER_TASKS){
      this.taskFetcher = new OrderTaskFetcher();
      if(targetDate) {
        // @ts-ignore
        let params = {params: {date: targetDate.Format("yyyy-MM-dd"), type: 0}};
        return getScenarioRecordByDate(params).then(res=>{
          if(res) {
            let scenarioFile = new ScenarioFile(res.id, res.name, res.type, new Date(res.targetDate), new Date(res.createTime), new Date(res.lastModificationTime), res.scenarioId, res.isOfficial, res.creator, res.productVersion, res.geoVersion);
            this.saveManager = new ScenarioSaveManager(scenarioFile);
          }else {
            this.saveManager = new ScenarioSaveManager(new ScenarioFile(undefined,
              // @ts-ignore
              targetDate.Format("yyyy-MM-dd") + "物流计划", Constants.ORDER_SCENARIO, targetDate, new Date(),
              new Date(), undefined, 1, "蔡徐坤", genUID(), genUID()));
          }
          if(this.taskFetcher)
            return this.taskFetcher.fetchTasks();
          else
            return Promise.reject('task fetcher is null...');
        })
      }
    }else if(type == Constants.FETCH_DELIVERY_TASKS){
      this.taskFetcher = new DeliveryTaskFetcher();
      if(targetDate) {
        // @ts-ignore
        let params = {params: {date: targetDate.Format("yyyy-MM-dd"), type: 1}};
        return getScenarioRecordByDate(params).then(res=>{
          if(res){
            let scenarioFile = new ScenarioFile(res.id, res.name, res.type, new Date(res.targetDate), new Date(res.createTime), new Date(res.lastModificationTime), res.scenarioId, res.isOfficial, res.creator, res.productVersion, res.geoVersion);
            this.saveManager = new ScenarioSaveManager(scenarioFile);
          }else{
            this.saveManager = new ScenarioSaveManager(new ScenarioFile(undefined,
              // @ts-ignore
              targetDate.Format("yyyy-MM-dd") + " 物流结单", Constants.ORDER_SCENARIO, targetDate, new Date(),
              new Date(), undefined, 1, "蔡徐坤", genUID(), genUID()));
          }
          if(this.taskFetcher)
            return this.taskFetcher.fetchTasks();
          else
            return Promise.reject('task fetcher is null...');
        })
      }
      return this.taskFetcher.fetchTasks();
    }else{
      this.taskFetcher = new MockTaskFetcher();
      this.saveManager = new TemplateSaveManager();
      return this.taskFetcher.fetchTasks();
    }

  }

  importScenario(file: ScenarioFile){
    this.saveManager = new ScenarioSaveManager(file);
    let params = { params: { id: file.scenarioId } };
    return ScenarioHandler.getInstance()
      .fetchEssentialsAndScenario(params)
      .then(scenario => {
        console.log(scenario);
        TaskPool.getInstance().assembleTasksFromScenario(scenario);
        VehiclePool.getInstance().assembleVehiclesFromScenario(scenario);
        DriverPool.getInstance().assembleDriversFromScenario(scenario);
        RoutePool.getInstance().assembleRoutesFromScenario(scenario);
        ShipmentPool.getInstance().assembleShipmentsFromScenario(scenario);
        return Promise.resolve("assemble from scenario successfully...");
      });
  }

  assembleBaseOnTemplate(file: TemplateFile){
    let params = { params: { id: file.templateId } };
    return ScenarioHandler.getInstance().fetchTemplate(params).then(template=>{
      RoutePool.getInstance().assembleRoutesFromTemplate(template);
      ShipmentPool.getInstance().initializeRestShipments();
      return Promise.resolve('assemble base on template successfully...');
    })
  }

  // setSelectedScenarioFile(file: ScenarioFile){
  //   this.file = file;
  // }

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

  fetchTemplateFileList(){
    let params = {};
    this.templateFiles = new Array<TemplateFile>();
    return getTemplateRecords(params).then(res=>{
      for(let i in res){
        let row = res[i];
        this.templateFiles.push(new TemplateFile(row.id, row.name, new Date(row.createTime),
          new Date(row.lastModificationTime), row.templateId, row.creator, row.productVersion, row.geoVersion));
      }

      return Promise.resolve('template files received successfully');
    })
  }

  fetchTemplate(params: any){
    return getTemplate(params);
  }

  fetchAllEssentials(){
    return this.fetchEssentials()
      .then(VehiclePool.getInstance().fetchVehicles)
      .then(DriverPool.getInstance().fetchDrivers);
  }

  fetchAllEssentialsAndTemplate(params: any){
    return this.fetchAllEssentials().then(res=>{
      return this.fetchTemplate(params);
    });
  }

  save(){
    if(this.saveManager)
      return this.saveManager.save();
  }

  // saveScenario(){
  //   let scenario = new ScenarioImpl();
  //   let scenarioDTO = new ScenarioDTO(scenario);
  //
  //   if(this.file) {
  //     this.file.lastModificationTime = new Date();
  //   }else{
  //     //TODO
  //     // this.file = new ScenarioFile();
  //   }
  //
  //   let transData = {...this.file, content: scenarioDTO};
  //
  //   if(this.file) {
  //     // @ts-ignore
  //     transData.createTime = this.file.createTime.Format('yyyy-MM-dd hh:mm:ss');
  //     // @ts-ignore
  //     transData.lastModificationTime = this.file.lastModificationTime.Format('yyyy-MM-dd hh:mm:ss');
  //     // @ts-ignore
  //     transData.targetDate = this.file.targetDate.Format('yyyy-MM-dd hh:mm:ss');
  //   }
  //   console.log(transData);
  //   let params = JSON.stringify(transData);
  //   return postScenario(params);
  // }
  //
  // saveTemplate(file: TemplateFile){
  //   let scenario = new ScenarioImpl();
  //   let scenarioDTO = new ScenarioDTO(scenario);
  //
  //   let transData = {...file, content: scenarioDTO};
  //
  //   // @ts-ignore
  //   transData.createTime = file.createTime.Format('yyyy-MM-dd hh:mm:ss');
  //   // @ts-ignore
  //   transData.lastModificationTime = file.lastModificationTime.Format('yyyy-MM-dd hh:mm:ss');
  //
  //   console.log(transData);
  //
  //   let params = JSON.stringify(transData);
  //   return postTemplate(params);
  // }
}


// // @ts-ignore
// Date.prototype.Format = function(fmt: any)
// {
//   var o = {
//     "M+" : this.getMonth()+1,                 //月份
//     "d+" : this.getDate(),                    //日
//     "h+" : this.getHours(),                   //小时
//     "m+" : this.getMinutes(),                 //分
//     "s+" : this.getSeconds(),                 //秒
//     "q+" : Math.floor((this.getMonth()+3)/3), //季度
//     "S"  : this.getMilliseconds()             //毫秒
//   };
//   if(/(y+)/.test(fmt))
//     fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
//   for(var k in o)
//     if(new RegExp("("+ k +")").test(fmt))
//       // @ts-ignore
//       fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
//   return fmt;
// }