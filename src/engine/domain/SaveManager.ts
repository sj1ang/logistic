import {Constants} from "@/engine/Constant/Constants";
import {MyFile, ScenarioDTO, ScenarioFile, ScenarioImpl, TemplateFile} from "@/engine/domain/Scenario";
import {postScenario, postTemplate} from "@/api";
import {FileManager, FileManagerFactory} from "@/engine/domain/FileManager";
import {genUID} from "@/utils/common";

export interface SaveManager {
  init(): Promise<any>;
  save(): Promise<any> | undefined;
  getFile(): MyFile | undefined;
}

export class TemplateSaveManager implements SaveManager{
  templateFile: TemplateFile | undefined;

  init(){
    return new Promise((resolve, reject)=>{
      this.templateFile = new TemplateFile(undefined, "新建模板", new Date(), new Date(), undefined, "蔡徐坤", genUID(), genUID());
      resolve('saved successfully')
    });
  }

  save(){
    if(!this.templateFile){
      this.templateFile = new TemplateFile(undefined, "新建模板", new Date(), new Date(), undefined, "蔡徐坤", genUID(), genUID());
    }
    return this.saveTemplate();
  }

  saveTemplate() {
    if(!this.templateFile){
      return undefined;
    }else {
      let scenario = new ScenarioImpl();
      let scenarioDTO = new ScenarioDTO(scenario);

      let transData = {...this.templateFile, content: scenarioDTO};

      // @ts-ignore
      transData.createTime = this.templateFile.createTime.Format('yyyy-MM-dd hh:mm:ss');
      // @ts-ignore
      transData.lastModificationTime = new Date().Format('yyyy-MM-dd hh:mm:ss');

      let params = JSON.stringify(transData);
      return postTemplate(params).then(res=>{
        if(this.templateFile) {
          this.templateFile.id = res.id;
          this.templateFile.templateId = res.templateId;
          this.templateFile.lastModificationTime = new Date(res.lastModificationTime);
        }

        return Promise.resolve('saved successfully')
      })
    }
  }

  getFile(): MyFile | undefined{
    return this.templateFile;
  }

  // changeFile(file: TemplateFile){
  //   this.templateFile = file;
  //   let fileManager = FileManagerFactory.getInstance();
  //   fileManager.currentFileName = file.name;
  // }
}

export class ScenarioSaveManager implements SaveManager{
  targetDate: Date;
  type: number;
  scenarioFile: ScenarioFile | undefined;

  constructor(targetDate: Date, type: number){
    this.targetDate = targetDate;
    this.type = type;
  }

  init(){
    return this.generateScenarioFile();
  }

  save(){
    if(this.scenarioFile)
      return this.saveScenario();
    else{
      return this.generateScenarioFile().then(res=>{
        this.saveScenario()
      });
    }
  }

  saveScenario() {
    let that = this;
    if(!that.scenarioFile){
      return Promise.reject('null scenario file!');
    }else{
      let scenario = new ScenarioImpl();
      let scenarioDTO = new ScenarioDTO(scenario);
      that.scenarioFile.lastModificationTime = new Date();


      let transData = {...that.scenarioFile, content: scenarioDTO};

      if(this.scenarioFile) {
        // @ts-ignore
        transData.createTime = that.scenarioFile.createTime.Format('yyyy-MM-dd hh:mm:ss');
        // @ts-ignore
        transData.lastModificationTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
        // @ts-ignore
        transData.targetDate = that.scenarioFile.targetDate.Format('yyyy-MM-dd hh:mm:ss');
      }

      let params = JSON.stringify(transData);
      return postScenario(params).then(res=>{
        // this.scenarioFile = new ScenarioFile(res.id, res.name, res.type, new Date(res.targetDate), new Date(res.createTime), new Date(res.lastModificationTime), res.scenarioId, res.isOfficial, res.creator, res.productVersion, res.geoVersion);

        if(this.scenarioFile){
          this.scenarioFile.id = res.id;
          this.scenarioFile.scenarioId = res.scenarioId;
          this.scenarioFile.lastModificationTime = new Date(res.lastModificationTime);
        }

        return Promise.resolve('saved successfully')
      })
    }
  }

  generateScenarioFile(): Promise<any>{
    return FileManager.fetchScenarioRecordByDate(this.targetDate, this.type).then(res=>{
      if(res){
        this.scenarioFile = new ScenarioFile(res.id, res.name, res.type, new Date(res.targetDate), new Date(res.createTime), new Date(res.lastModificationTime), res.scenarioId, res.isOfficial, res.creator, res.productVersion, res.geoVersion);
      }else{
        if(this.type == Constants.ORDER_SCENARIO) {
          // @ts-ignore
          this.scenarioFile = new ScenarioFile(undefined, FileManager.generateFileName(this.targetDate, this.type), Constants.ORDER_SCENARIO, this.targetDate, new Date(), new Date(), undefined, 1, "蔡徐坤", genUID(), genUID());
        }else if(this.type == Constants.DELIVERY_SCENARIO) {
          // @ts-ignore
          this.scenarioFile = new ScenarioFile(undefined, FileManager.generateFileName(this.targetDate, this.type), Constants.DELIVERY_SCENARIO, this.targetDate, new Date(), new Date(), undefined, 1, "蔡徐坤", genUID(), genUID());
        }
      }

      return Promise.resolve('scenario file generated successfully')
    })
  }

  getFile(): MyFile | undefined {
    return this.scenarioFile;
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
