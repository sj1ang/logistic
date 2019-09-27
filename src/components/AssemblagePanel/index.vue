<template>
  <div class="assemblage-container">
    <div class="option-wrapper">
      <el-radio v-model="type" :label="FETCH_ORDER_TASKS"
        >按配送日订单装框（创建物流计划单）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" :label="FETCH_DELIVERY_TASKS"
        >按配送日发货单装框（创建物流结单）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" :label="FETCH_MOCK_TASKS"
        >生成模拟装框（创建模板）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" :label="IMPORT_SCENARIO"
        >导入Scenario（修改已有的物流单）</el-radio
      >
      <div style="margin-left: 24px">
        <el-date-picker
          v-if="type == FETCH_ORDER_TASKS || type == FETCH_DELIVERY_TASKS"
          size="mini"
          v-model="selectedDate"
          :picker-options="pickerOptions"
          @blur="checkStatus"
        >
        </el-date-picker>
        <el-select
          size="mini"
          v-model="scenarioIndex"
          placeholder="选择scenario"
          v-if="type == IMPORT_SCENARIO && scenarioFiles.length > 0"
        >
          <el-option
            v-for="(item, index) in scenarioFiles"
            :key="index"
            :label="item.name"
            :value="index"
            value-key="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <div
        style="margin-left: 24px"
        v-if="type == IMPORT_SCENARIO && scenarioFiles.length == 0"
      >
        <span style="font-size: 12px; color: #E65D6E">暂无scenario</span>
      </div>
    </div>
    <div class="option-wrapper" style="text-align: right; margin-top: 40px;">
      <div style="margin-left: 24px">
        <el-button
          size="mini"
          style="width: 100%"
          type="primary"
          @click="conduct"
          >执行</el-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ProductPool } from "../../engine/domain/Product";
import { MyLocationPool } from "../../engine/domain/MyLocation";
import { TransportCostMatrixManager } from "../../engine/domain/TransportCostMatrix";
import { VehiclePool } from "../../engine/domain/Vehicle";
import { Driver, DriverPool } from "../../engine/domain/Driver";
import { TaskPool } from "../../engine/domain/Task";
import { getScenario } from "../../api";
import { Scenario, ScenarioFile } from "../../engine/domain/Scenario";
import { ScenarioHandler } from "../../engine/domain/ScenarioHandler";
import { genUID } from "../../utils/common";
import { RoutePool } from "../../engine/domain/Route";
import { ShipmentPool } from "../../engine/domain/ShipmentPool";
import {Constants} from "../../engine/Constant/Constants"
import {FileManager, FileCheckerFactory, FileManagerFactory} from "../../engine/domain/FileManager"

@Component({
  name: "AssemblagePanel"
})
export default class extends Vue {
  productPool: ProductPool;
  locationPool: MyLocationPool;
  date: Date;
  type: number = 0;
  scenarioFiles: Array<ScenarioFile>;
  scenarioIndex: number = 0;
  selectedDate: Date;

  FETCH_ORDER_TASKS = Constants.FETCH_ORDER_TASKS;
  FETCH_DELIVERY_TASKS = Constants.FETCH_DELIVERY_TASKS;
  FETCH_MOCK_TASKS = Constants.FETCH_MOCK_TASKS;
  IMPORT_SCENARIO = Constants.IMPORT_SCENARIO;

  pickerOptions: Object = {
    disabledDate(time): boolean {
      let dateTime = new Date();
      dateTime.setDate(dateTime.getDate() + 1);
      return time.getTime() > dateTime;
    }
  };

  constructor() {
    super();
    this.date = new Date();
    this.type = this.FETCH_ORDER_TASKS;
    this.scenarioFiles = new Array<ScenarioFile>();

    let dateTime = new Date();
    dateTime.setDate(dateTime.getDate() + 1);
    this.selectedDate = dateTime;
  }

  @Watch("type")
  onTypeChanged() {
    if (this.type == this.FETCH_ORDER_TASKS) {
      let dateTime = new Date();
      dateTime.setDate(dateTime.getDate() + 1);
      this.selectedDate = dateTime;
    } else if (this.type == this.FETCH_DELIVERY_TASKS) {
      this.selectedDate = new Date();
    }

    this.checkStatus();
  }

  created() {
    const loading = this.$loading({
      lock: true,
      text: "Loading",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });

    ScenarioHandler.getInstance()
      .fetchScenarioFileList()
      .then(res => {
        this.scenarioFiles = ScenarioHandler.getInstance().files;
        console.log(this.scenarioFiles);
        console.log(res);
        loading.close();
      });

    this.checkStatus();
  }

  conduct() {
    const loading = this.$loading({
      lock: true,
      text: "Loading",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });

    let promise: Promise;

    ScenarioHandler.getInstance().selectedType = this.type;

    if(this.type == Constants.FETCH_ORDER_TASKS || this.type == Constants.FETCH_DELIVERY_TASKS || this.type == Constants.FETCH_MOCK_TASKS){
      promise = ScenarioHandler.getInstance().fetchTasks(this.type, this.selectedDate);
    }else if(this.type == Constants.IMPORT_SCENARIO){
      promise = ScenarioHandler.getInstance().importScenario(this.scenarioFiles[this.scenarioIndex]);
    }

    if (promise) {
      promise.then(res => {
        loading.close();
        if (this.type == Constants.IMPORT_SCENARIO) {
          this.$parent.moveTwoSteps();
        } else {
          this.$parent.moveForward();
        }
      });
    } else {
      this.$message.error("ERROR!");
      loading.close();
    }
  }

  checkStatus(){
    console.log('checking...');
    FileManagerFactory.getInstance().checkStatus(this.selectedDate, this.type);
    console.log(FileManagerFactory.getInstance().currentKey)
    console.log(FileManagerFactory.getInstance().currentFileName)
    console.log(FileManagerFactory.getInstance().currentFileStatus)
  }
}
</script>

<style lang="scss" scoped>
.assemblage-container {
  padding-top: 80px;
}
.option-wrapper {
  min-height: 40px;
  line-height: 40px;
  width: 200px;
  margin: auto;
}
</style>
