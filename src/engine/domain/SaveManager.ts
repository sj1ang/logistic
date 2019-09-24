import {Constants} from "@/engine/Constant/Constants";
import {ScenarioDTO, ScenarioFile, ScenarioImpl, TemplateFile} from "@/engine/domain/Scenario";
import {postScenario, postTemplate} from "@/api";

export interface SaveManager {
  save(): Promise<any> | undefined;
}

export class TemplateSaveManager implements SaveManager{
  templateFile: TemplateFile | undefined;

  save() {
    if(!this.templateFile){
      return undefined;
    }else {
      let scenario = new ScenarioImpl();
      let scenarioDTO = new ScenarioDTO(scenario);

      let transData = {...this.templateFile, content: scenarioDTO};

      // @ts-ignore
      transData.createTime = this.templateFile.createTime.Format('yyyy-MM-dd hh:mm:ss');
      // @ts-ignore
      transData.lastModificationTime = this.templateFile.lastModificationTime.Format('yyyy-MM-dd hh:mm:ss');

      console.log(transData);

      let params = JSON.stringify(transData);
      return postTemplate(params);
    }
  }
}

export class ScenarioSaveManager implements SaveManager{
  scenarioFile: ScenarioFile | undefined;

  constructor(scenarioFile: ScenarioFile){
    this.scenarioFile = scenarioFile;
  }

  save() {
    if(!this.scenarioFile){
      return undefined;
    }else{
      let scenario = new ScenarioImpl();
      let scenarioDTO = new ScenarioDTO(scenario);
      this.scenarioFile.lastModificationTime = new Date();


      let transData = {...this.scenarioFile, content: scenarioDTO};

      if(this.scenarioFile) {
        // @ts-ignore
        transData.createTime = this.scenarioFile.createTime.Format('yyyy-MM-dd hh:mm:ss');
        // @ts-ignore
        transData.lastModificationTime = this.scenarioFile.lastModificationTime.Format('yyyy-MM-dd hh:mm:ss');
        // @ts-ignore
        transData.targetDate = this.scenarioFile.targetDate.Format('yyyy-MM-dd hh:mm:ss');
      }
      console.log(transData);
      let params = JSON.stringify(transData);
      return postScenario(params);
    }
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
