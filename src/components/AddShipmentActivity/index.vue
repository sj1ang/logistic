<template>
  <div>
    <div class="function-button" @click="switchDialog"></div>
    <shipment-activity-dialog :activity="activity" :type="'insertion'" ref="dialog"></shipment-activity-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import ShipmentActivity from "../ShipmentActivity/index"
  import {ShipmentTourActivity, TourActivity} from "../../engine/domain/Activity"
  import {MyLocationFactory} from "../../engine/domain/MyLocation"
  import ShipmentActivityDialog from "../ShipmentActivityDialog/index"

  @Component({
    name: 'AddShipmentActivity',
    components: {ShipmentActivityDialog, ShipmentActivity}
  })
  export default class extends Vue {
    private activity: TourActivity;

    constructor(){
      super();
      this.createNewActivity();
    }

    createNewActivity(){
      let l = MyLocationFactory.getInstance().createLocation();
      this.activity = new ShipmentTourActivity("新建任务" + l.id, l, 1, 0, 100, [-1]);
    }

    switchDialog(): void{
      this.createNewActivity();
      this.$refs.dialog.showDialog();
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
