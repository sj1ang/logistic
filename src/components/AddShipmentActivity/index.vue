<template>
  <div>
    <div class="function-button" @click="switchShipmentDialog"></div>
    <div class="function-button" @click="switchConfigurationDialog"></div>
    <shipment-activity-dialog :activity="activity" :type="'insertion'" ref="shipmentDialog"></shipment-activity-dialog>
    <configuration-dialog ref="configurationDialog"></configuration-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import ShipmentActivity from "../ShipmentActivity/index"
  import {ShipmentTourActivity, TourActivity} from "../../engine/domain/Activity"
  import {MyLocationFactory} from "../../engine/domain/MyLocation"
  import ShipmentActivityDialog from "../ShipmentActivityDialog/index"
  import {genUID} from "../../utils/common"
  import {TaskPool} from "../../engine/domain/Task"
  import ConfigurationDialog from "../ConfigurationDialog/index"

  @Component({
    name: 'AddShipmentActivity',
    components: {ConfigurationDialog, ShipmentActivityDialog, ShipmentActivity}
  })
  export default class extends Vue {
    private activity: TourActivity;

    constructor(){
      super();
      let l = MyLocationFactory.getInstance().createLocation();
      this.activity = new ShipmentTourActivity("新建任务" + l.id, l, 1, 0, 100, [-1], undefined);
    }

    switchShipmentDialog(): void{
      let l = MyLocationFactory.getInstance().createLocation();
      this.activity = new ShipmentTourActivity("新建任务" + l.id, l, 1, 0, 100, [-1], undefined);

      this.$refs.shipmentDialog.showDialog();
    }

    switchConfigurationDialog(): void{
      console.log('switching...');
      this.$refs.configurationDialog.showDialog();
    }
  }
</script>

<style lang="scss" scoped>
  .function-button{
    height: 32px;
    width: 32px;
    background: #d8d8d8;
    margin: 4px;
  }
</style>
