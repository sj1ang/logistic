import { getScenarioRecordByDate } from "@/api";
import { Constants } from "@/engine/Constant/Constants";
import { ScenarioFile } from "@/engine/domain/Scenario";
import {ScenarioFileStatus} from "@/engine/domain/FileStatus";

export class FileManager {
  fileStatusMap: Map<string, ScenarioFileStatus>;
  // fileStatusMap: Map<string, number>;

  currentFileName: string = "";
  currentFileStatus: ScenarioFileStatus = new ScenarioFileStatus(Constants.NOT_CHECKED, undefined);
  // currentFile: ScenarioFile | undefined;
  currentKey: string = "";

  constructor() {
    this.fileStatusMap = new Map();
  }

  fetchStatus(targetDate: Date, type: number): void {
    // @ts-ignore
    let dateStr = targetDate.Format("yyyy-MM-dd");
    let params = { params: { date: dateStr, type: type } };
    let key = dateStr + "-" + type;

    this.updateStatus(key, new ScenarioFileStatus(Constants.IS_CHECKING, undefined));

    getScenarioRecordByDate(params).then(res => {
      if (res) {
        let scenarioFile = new ScenarioFile(
          res.id,
          res.name,
          res.type,
          new Date(res.targetDate),
          new Date(res.createTime),
          new Date(res.lastModificationTime),
          res.scenarioId,
          res.isOfficial,
          res.creator,
          res.productVersion,
          res.geoVersion
        );
        setTimeout(() => {
          this.updateStatus(key, new ScenarioFileStatus(Constants.SCENARIO_EXISTING, scenarioFile));
        }, 500);
      } else {
        setTimeout(() => {
          this.updateStatus(key, new ScenarioFileStatus(Constants.SCENARIO_NOT_EXISTING, undefined));
        }, 500);
      }
    });
  }

  checkStatus(targetDate: Date, type: number) {
    let fileName = FileManager.generateFileName(targetDate, type);
    let key = this.generateKey(targetDate, type);

    if (fileName && key) {
      this.currentFileName = fileName;
    } else {
      this.cleanFileProperties();
      return;
    }

    if (key != this.currentKey) {
      this.currentFileStatus = new ScenarioFileStatus(Constants.NOT_CHECKED, undefined);
      this.currentKey = key;
    }

    let status = this.fileStatusMap.get(key);

    if (!status) {
      this.fetchStatus(targetDate, type);
    } else {
      //javascript is single thread? right? T-T
      this.currentFileStatus = status;
    }
  }

  updateStatus(key: string, status: ScenarioFileStatus) {
    this.fileStatusMap.set(key, status);

    if (key == this.currentKey) {
      this.currentFileStatus = status;
    }
  }

  cleanFileProperties() {
    this.currentFileName = "";
    this.currentFileStatus = new ScenarioFileStatus(Constants.NOT_CHECKED, undefined);
    this.currentKey = "";
  }

  static fetchScenarioRecordByDate(targetDate: Date, type: number) {
    // @ts-ignore
    let dateStr = targetDate.Format("yyyy-MM-dd");
    let params = { params: { date: dateStr, type: type } };

    return getScenarioRecordByDate(params);
  }

  static generateFileName(targetDate: Date, type: number): string | undefined {
    // @ts-ignore
    let dateStr = targetDate.Format("yyyy-MM-dd");

    if (type == Constants.ORDER_SCENARIO) {
      return dateStr + "日物流计划";
    } else if (type == Constants.DELIVERY_SCENARIO) {
      return dateStr + "日物流结单";
    } else {
      return undefined;
    }
  }

  generateKey(targetDate: Date, type: number) {
    // @ts-ignore
    let dateStr = targetDate.Format("yyyy-MM-dd");

    return dateStr + "-" + type;
  }
}

export class FileManagerFactory {
  static instance: FileManager;

  static getInstance() {
    if (!this.instance) this.instance = new FileManager();
    return this.instance;
  }
}
