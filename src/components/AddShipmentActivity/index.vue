<template>
  <div>
    <div class="function-button" @click="switchShipmentDialog">
      <i class="el-icon-circle-plus"></i>
    </div>
    <div class="function-button" @click="switchConfigurationDialog">
      <i class="el-icon-info"></i>
    </div>
    <div class="function-button" @click="trySave">
      <i class="el-icon-s-promotion"></i>
    </div>
    <shipment-activity-dialog
      :activity="activity"
      :type="'insertion'"
      ref="shipmentDialog"
    ></shipment-activity-dialog>
    <configuration-dialog ref="configurationDialog"></configuration-dialog>
    <el-dialog
      el-dialog
      title="保存新的模板"
      :visible.sync="templateDialogVisible"
      :append-to-body="true"
      width="50%"
      v-if="templateDialogVisible"
    >
      <el-form v-model="file" size="mini" label-width="80px">
        <el-form-item label="模板名称">
          <el-input v-model="file.name"></el-input>
        </el-form-item>
        <el-form-item label="创建者">
          <el-input v-model="file.creator" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item>
          <div style="text-align: right">
            <el-button type="primary" @click="saveAndCloseDialog">创建</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ShipmentActivity from "../ShipmentActivity/index";
import {
  AdditionalShipmentTourActivity,
  ShipmentTourActivity,
  TourActivity
} from "../../engine/domain/Activity";
import { MyLocationPool } from "../../engine/domain/MyLocation";
import ShipmentActivityDialog from "../ShipmentActivityDialog/index";
import { genUID } from "../../utils/common";
import { TaskPool } from "../../engine/domain/Task";
import ConfigurationDialog from "../ConfigurationDialog/index";
import {
  MyFile,
  ScenarioDTO,
  ScenarioImpl,
  TemplateFile
} from "../../engine/domain/Scenario";
import { postScenario } from "../../api";
import { ScenarioHandler } from "../../engine/domain/ScenarioHandler";
import { Constants } from "../../engine/Constant/Constants";

@Component({
  name: "AddShipmentActivity",
  components: { ConfigurationDialog, ShipmentActivityDialog, ShipmentActivity }
})
export default class extends Vue {
  private activity: TourActivity;
  templateDialogVisible: boolean = false;

  private name: string = "";
  private isReady: boolean = true;
  private file: MyFile | undefined;

  constructor() {
    super();
    this.activity = AdditionalShipmentTourActivity.createAdditionalShipmentTourActivity(
      "新建任务",
      null,
      0,
      0,
      720,
      [0],
      undefined,
      genUID()
    );
  }

  switchShipmentDialog(): void {
    this.activity = AdditionalShipmentTourActivity.createAdditionalShipmentTourActivity(
      "新建任务",
      null,
      0,
      0,
      720,
      [0],
      undefined,
      genUID()
    );
    this.$refs.shipmentDialog.showDialog();
  }

  switchConfigurationDialog(): void {
    console.log("switching...");
    this.$refs.configurationDialog.showDialog();
  }

  trySave(){
    if(ScenarioHandler.getInstance().selectedType == Constants.FETCH_MOCK_TASKS){
      let file = ScenarioHandler.getInstance().saveManager.getFile();
      if(!file.id){
        this.file = file;
        this.templateDialogVisible = true;
      }else{
        this.save()
      }
    }else{
      this.save();
    }
  }

  save() {
    ScenarioHandler.getInstance()
      .save()
      .then(res => {
        console.log(res);
      });
  }

  saveAndCloseDialog(){
    this.save();
    this.templateDialogVisible = false;
  }
}
</script>

<style lang="scss" scoped>
.function-button {
  height: 32px;
  width: 32px;
  background: #d8d8d8;
  margin: 4px;
  line-height: 32px;
  text-align: center;
  font-size: 20px;
  color: #ffffff;
}
</style>
