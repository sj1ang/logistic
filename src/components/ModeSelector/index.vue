<template>
  <div class="mode-selector-container">
    <div class="option">
      <div class="upper-wrapper">
        <span style="line-height: 20px"
          >根据已有的订单自动生成配送任务<br />但不会分配线路</span
        >
      </div>
      <div class="bottom-wrapper">
        <el-button type="primary" size="mini" @click="generateBlankPlan"
          >生成空白计划</el-button
        >
      </div>
    </div>
    <div class="option">
      <div class="upper-wrapper">
        <span style="line-height: 20px">依据模板自动生成配送任务和线路</span>
        <div style="position: absolute; bottom: 8px; left: 0; right: 0">
          <el-select
            size="mini"
            v-model="templateIndex"
            placeholder="选择template"
            v-if="isReady && templateFiles.length > 0"
          >
            <el-option
              v-for="(item, index) in templateFiles"
              :key="index"
              :label="item.name"
              :value="index"
              value-key="item.id"
            >
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="bottom-wrapper">
        <el-button
          type="primary"
          size="mini"
          @click="assembleFromTemplate"
          v-if="templateFiles.length > 0"
          >依据模板生成</el-button
        >
        <div style="color: #606266; font-size: 14px" v-else>暂无模板</div>
      </div>
    </div>
    <div class="option" v-if="showImportMode">
      <div class="upper-wrapper">
        <span style="line-height: 20px"
          >在任务计划上进行修改<br />保存为配送记录</span
        >
        <div style="position: absolute; bottom: 16px; left: 0; right: 0; font-size: 12px" v-if="planScenarioFile.name">
          {{planScenarioFile.name}} <br>
        </div>
      </div>
      <div class="bottom-wrapper">
        <el-button
          type="primary"
          size="mini"
          @click="assembleFromPlanScenario"
          v-if="planScenarioFile.name"
          >导入已有计划</el-button
        >
        <div style="color: #606266; font-size: 14px" v-else>无已保存的计划</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ShipmentPool } from "../../engine/domain/ShipmentPool";
import {ScenarioFile, TemplateFile} from "../../engine/domain/Scenario";
import { ScenarioHandler } from "../../engine/domain/ScenarioHandler";
import { RoutePool } from "../../engine/domain/Route";
import { Constants } from "../../engine/Constant/Constants";

@Component({
  name: "ModeSelector"
})
export default class extends Vue {
  private templateFiles: Array<TemplateFile>;
  private templateIndex: number = 0;
  private isReady: boolean = false;
  private selectedType: number;
  private showImportMode: boolean = true;
  private planScenarioFile: any = {};


  constructor() {
    super();
    this.templateFiles = new Array<TemplateFile>();
    this.selectedType = ScenarioHandler.getInstance().selectedType;
    if (this.selectedType == Constants.FETCH_MOCK_TASKS) {
      this.showImportMode = false;
    }
  }

  created() {
    const loading = this.$loading({
      lock: true,
      text: "Loading",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });

    ScenarioHandler.getInstance()
      .fetchTemplateFileList()
      .then(res => {
        this.templateFiles = ScenarioHandler.getInstance().templateFiles;
        return ScenarioHandler.getInstance().fetchPlanScenarioFile();
      })
      .then(res => {
        if(res){
          console.log(typeof res)
          this.planScenarioFile = new ScenarioFile(
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
          )
        }
        this.isReady = true;
        loading.close();
      });
  }

  generateBlankPlan() {
    ShipmentPool.getInstance().initializeShipments();
    this.$parent.moveForward();
  }

  assembleFromTemplate() {
    const loading = this.$loading({
      lock: true,
      text: "Loading",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });

    ScenarioHandler.getInstance()
      .assembleBaseOnTemplate(this.templateFiles[this.templateIndex])
      .then(res => {
        loading.close();
        this.$parent.moveForward();
      });
  }

  assembleFromPlanScenario() {
    console.log(this.planScenarioFile);
  }
}
</script>

<style lang="scss" scoped>
.mode-selector-container {
  display: flex;
  height: 400px;
  background: #f5f5f5;
}
.option {
  flex: 1;
  border-right: 1px solid #ffffff;
  display: flex;
  flex-direction: column;
}
.option:hover {
  background: #ffffff;
}
.option:last-child {
  border-right: 0px;
}
.upper-wrapper {
  flex: 0 0 300px;
  padding-top: 64px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  position: relative;
}
.bottom-wrapper {
  flex: 1;
  padding-top: 8px;
  text-align: center;
}
</style>
