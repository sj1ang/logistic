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
import {
  ScenarioDTO,
  ScenarioFile,
  ScenarioImpl,
  TemplateFile
} from "@/engine/domain/Scenario";
import { Vehicle, VehiclePool } from "@/engine/domain/Vehicle";
import { DriverPool } from "@/engine/domain/Driver";
import {
  DeliveryTaskFetcher,
  MockTaskFetcher,
  OrderTaskFetcher,
  TaskFetcher
} from "@/engine/domain/TaskFetcher";
import { TaskPool } from "@/engine/domain/Task";
import { ShipmentPool } from "@/engine/domain/ShipmentPool";
import { RoutePool } from "@/engine/domain/Route";
import { Constants } from "@/engine/Constant/Constants";
import {
  SaveManager,
  ScenarioSaveManager,
  TemplateSaveManager
} from "@/engine/domain/SaveManager";
import { genUID } from "@/utils/common";
import {FileManager, FileManagerFactory} from "@/engine/domain/FileManager";

export class ScenarioHandler {
  static instance: ScenarioHandler;

  files: Array<ScenarioFile>;
  templateFiles: Array<TemplateFile>;
  // file: ScenarioFile |undefined;

  selectedType: number | undefined;
  taskFetcher: TaskFetcher | undefined;
  saveManager: SaveManager | undefined;
  targetDate: Date | undefined;
  dayOfWeek: number | undefined;

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

  fetchTasks(type: number, targetDate: Date | undefined) {
    if(targetDate){
      this.targetDate = targetDate;
      this.dayOfWeek = this.targetDate.getDay() - 1;
      this.dayOfWeek = this.dayOfWeek < 0 ? 6 : this.dayOfWeek;
    }
    if (type == Constants.FETCH_ORDER_TASKS) {
      if (targetDate) {
        let date = new Date();
        date.setDate(targetDate.getDate() - 1);
        this.taskFetcher = new OrderTaskFetcher(date, date);
        this.saveManager = new ScenarioSaveManager(targetDate, Constants.ORDER_SCENARIO);
        if (this.taskFetcher) {
          return this.saveManager.init().then(res => {
            if (this.taskFetcher) return this.taskFetcher.fetchTasks();
            return Promise.reject("null task fetcher!");
          });
        } else {
          return Promise.reject("null task fetcher!");
        }
      }
    } else if (type == Constants.FETCH_DELIVERY_TASKS) {
      if (targetDate) {
        this.taskFetcher = new DeliveryTaskFetcher(targetDate, targetDate);
        this.saveManager = new ScenarioSaveManager(targetDate, Constants.DELIVERY_SCENARIO);
        if (this.taskFetcher) {
          return this.saveManager.init().then(res => {
            if (this.taskFetcher) return this.taskFetcher.fetchTasks();
            return Promise.reject("null task fetcher!");
          });
        } else {
          return Promise.reject("null task fetcher!");
        }
      }
      // return this.taskFetcher.fetchTasks();
    } else {
      this.taskFetcher = new MockTaskFetcher();
      this.saveManager = new TemplateSaveManager();

      return this.saveManager.init().then(res=>{
        if(this.taskFetcher)
          return this.taskFetcher.fetchTasks()
        else
          return Promise.resolve("null task fetcher!");
      });
    }
  }

  importScenario(file: ScenarioFile) {
    this.targetDate = file.targetDate;
    this.dayOfWeek = this.targetDate.getDay() - 1;
    this.dayOfWeek = this.dayOfWeek < 0 ? 6 : this.dayOfWeek;

    this.saveManager = new ScenarioSaveManager(file.targetDate, file.type);
    return this.saveManager.init().then(res => {
      let params = { params: { id: file.scenarioId } };
      return ScenarioHandler.getInstance()
        .fetchEssentialsAndScenario(params)
        .then(scenario => {
          TaskPool.getInstance().assembleTasksFromScenario(scenario);
          VehiclePool.getInstance().assembleVehiclesFromScenario(scenario);
          DriverPool.getInstance().assembleDriversFromScenario(scenario);
          RoutePool.getInstance().assembleRoutesFromScenario(scenario);
          ShipmentPool.getInstance().assembleShipmentsFromScenario(scenario);
          return Promise.resolve("assemble from scenario successfully");
        });
    });
  }

  assembleBaseOnTemplate(file: TemplateFile) {
    let params = { params: { id: file.templateId } };
    return ScenarioHandler.getInstance()
      .fetchTemplate(params)
      .then(template => {
        RoutePool.getInstance().assembleRoutesFromTemplate(template);
        ShipmentPool.getInstance().initializeRestShipments();
        return Promise.resolve("assemble base on template successfully");
      });
  }

  fetchPlanScenarioFile(): any{
    if(this.saveManager instanceof ScenarioSaveManager){
      if(this.saveManager.scenarioFile) {
        let targetDate = this.saveManager.scenarioFile.targetDate;
        console.log(targetDate);
        return FileManager.fetchScenarioRecordByDate(targetDate, Constants.ORDER_SCENARIO)
      }
    }else{
      return Promise.resolve(undefined);
    }
  }

  assembleBaseOnScenario(file: ScenarioFile) {
    let params = {params: {id: file.scenarioId}};
    return ScenarioHandler.getInstance().fetchScenario(params).then((scenario)=>{
      if(scenario){
        RoutePool.getInstance().assembleRoutesFromScenario(scenario);
        console.log(TaskPool.getInstance().taskShipmentMap)
        ShipmentPool.getInstance().initializeRestShipments();
        return Promise.resolve("assemble base on scenario successfully")
      }else{
        return Promise.resolve("null scenario!")
      }
    })
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

  fetchScenarioFileList() {
    let params = {};
    this.files = new Array<ScenarioFile>();
    return getRecords(params).then(res => {
      for (let i in res) {
        let row = res[i];
        this.files.push(
          new ScenarioFile(
            row.id,
            row.name,
            row.type,
            new Date(row.targetDate),
            new Date(row.createTime),
            new Date(row.lastModificationTime),
            row.scenarioId,
            row.isOfficial,
            row.creator,
            row.productVersion,
            row.geoVersion
          )
        );
      }
      return Promise.resolve("files received successfully");
    });
  }

  fetchTemplateFileList() {
    let params = {};
    this.templateFiles = new Array<TemplateFile>();
    return getTemplateRecords(params).then(res => {
      for (let i in res) {
        let row = res[i];
        this.templateFiles.push(
          new TemplateFile(
            row.id,
            row.name,
            new Date(row.createTime),
            new Date(row.lastModificationTime),
            row.templateId,
            row.creator,
            row.productVersion,
            row.geoVersion
          )
        );
      }

      return Promise.resolve("template files received successfully");
    });
  }

  fetchTemplate(params: any) {
    return getTemplate(params);
  }

  fetchAllEssentials() {
    return this.fetchEssentials()
      .then(VehiclePool.getInstance().fetchVehicles)
      .then(res=>{
        if(this.targetDate)
          return DriverPool.getInstance().fetchDrivers(this.targetDate);
        else
          return Promise.resolve("no target date");
      });
  }

  fetchAllEssentialsAndTemplate(params: any) {
    return this.fetchAllEssentials().then(res => {
      return this.fetchTemplate(params);
    });
  }

  save() {
    if (this.saveManager) return this.saveManager.save();
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
