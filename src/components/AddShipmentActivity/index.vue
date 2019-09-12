<template>
  <div>
    <div class="function-button" @click="switchShipmentDialog">
      <i class="el-icon-circle-plus"></i>
    </div>
    <div class="function-button" @click="switchConfigurationDialog">
      <i class="el-icon-info"></i>
    </div>
    <div class="function-button" @click="saveScenario">
      <i class="el-icon-upload"></i>
    </div>
    <shipment-activity-dialog :activity="activity" :type="'insertion'" ref="shipmentDialog"></shipment-activity-dialog>
    <configuration-dialog ref="configurationDialog"></configuration-dialog>
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
  import {ScenarioDTO, ScenarioImpl} from '../../engine/domain/Scenario'
  import {postScenario} from "../../api"

  @Component({
    name: 'AddShipmentActivity',
    components: {ConfigurationDialog, ShipmentActivityDialog, ShipmentActivity}
  })
  export default class extends Vue {
    private activity: TourActivity;

    constructor(){
      super();
      this.activity = new AdditionalShipmentTourActivity("新建任务", null, 0, 0, 720, [0], undefined, genUID());
    }

    switchShipmentDialog(): void{
      this.activity = new AdditionalShipmentTourActivity("新建任务", null, 0, 0, 720, [0], undefined, genUID());
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

      let scenario = new ScenarioImpl();
      let scenarioDTO = new ScenarioDTO(scenario);
      let transData = {id: 1, content: scenarioDTO};
      // console.log(JSON.stringify(scenarioDTO));
      let params = JSON.stringify(transData);
      postScenario(params).then(res=>{
        console.log(res);
        loading.close();
      }).catch(err=>{

      })
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
