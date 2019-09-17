<template>
  <div>
    <div class="function-button" @click="switchShipmentDialog">
      <i class="el-icon-circle-plus"></i>
    </div>
    <div class="function-button" @click="switchConfigurationDialog">
      <i class="el-icon-info"></i>
    </div>
    <div class="function-button" @click="saveScenario" v-if="type == 'scenario'">
      <i class="el-icon-s-promotion"></i>
    </div>
    <div class="function-button" @click="saveTemplate" v-if="type == 'mock'">
      <i class="el-icon-upload"></i>
    </div>
    <shipment-activity-dialog :activity="activity" :type="'insertion'" ref="shipmentDialog"></shipment-activity-dialog>
    <configuration-dialog ref="configurationDialog"></configuration-dialog>
    <el-dialog el-dialog title="保存新的模板" :visible.sync="templateDialogVisible" :append-to-body='true' width="50%" v-if="templateDialogVisible">
      <el-form v-model="templateFile" size="mini" label-width="80px">
        <el-form-item label="模板名称">
          <el-input v-model="templateFile.name"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import ShipmentActivity from "../ShipmentActivity/index"
  import {AdditionalShipmentTourActivity, ShipmentTourActivity, TourActivity} from "../../engine/domain/Activity"
  import {MyLocationPool} from "../../engine/domain/MyLocation"
  import ShipmentActivityDialog from "../ShipmentActivityDialog/index"
  import {genUID} from "../../utils/common"
  import {TaskPool} from "../../engine/domain/Task"
  import ConfigurationDialog from "../ConfigurationDialog/index"
  import {ScenarioDTO, ScenarioImpl, TemplateFile} from '../../engine/domain/Scenario'
  import {postScenario} from "../../api"
  import {ScenarioHandler} from "../../engine/domain/ScenarioHandler"

  @Component({
    name: 'AddShipmentActivity',
    components: {ConfigurationDialog, ShipmentActivityDialog, ShipmentActivity}
  })
  export default class extends Vue {
    private activity: TourActivity;
    private type: string;

    private templateFile: TemplateFile;
    templateDialogVisible: boolean = false;

    constructor(){
      super();
      this.activity = AdditionalShipmentTourActivity.createAdditionalShipmentTourActivity("新建任务", null, 0, 0, 720, [0], undefined, genUID());
      this.type = ScenarioHandler.getInstance().type;
    }

    switchShipmentDialog(): void{
      this.activity = AdditionalShipmentTourActivity.createAdditionalShipmentTourActivity("新建任务", null, 0, 0, 720, [0], undefined, genUID());
      this.$refs.shipmentDialog.showDialog();
    }

    switchConfigurationDialog(): void{
      console.log('switching...');
      this.$refs.configurationDialog.showDialog();
    }

    saveScenario(): void{
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });

      ScenarioHandler.getInstance().saveScenario().then(res=>{
        loading.close();
      });
    }

    saveTemplate(): void{

      if(!this.templateFile){
        this.templateFile = new TemplateFile(undefined, "新建模板", new Date(), new Date(), undefined, "蔡徐坤", genUID(), genUID());
        console.log(this.templateFile);
      }

      this.templateDialogVisible = true;
      console.log('template...');
    }
  }
</script>

<style lang="scss" scoped>
  .function-button{
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
