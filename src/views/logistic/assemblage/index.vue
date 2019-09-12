<template>
  <div class="scheduler-container">
    <assemblage-panel v-if="step == 0"></assemblage-panel>
    <mode-selector v-if="step == 1"></mode-selector>
    <scheduler v-if="step == 2"></scheduler>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'
  import {ProductPool} from "../../../engine/domain/Product"
  import {MyLocationPool} from "../../../engine/domain/MyLocation"
  import Scheduler from "../scheduler/index"
  import {TaskPool} from "../../../engine/domain/Task"
  import {TransportCostMatrixManager} from "../../../engine/domain/TransportCostMatrix"
  import {VehiclePool} from "../../../engine/domain/Vehicle"
  import {DriverPool} from "../../../engine/domain/Driver"
  import ModeSelector from "../../../components/ModeSelector/index"
  import AssemblagePanel from "../../../components/AssemblagePanel/index"

  @Component({
    name: 'Assemblage',
    components: {AssemblagePanel, ModeSelector, Scheduler}
  })
  export default class extends Vue {
    step: number = 0;

    moveForward(){
      if(this.step < 3)
        this.step ++;
    }

    moveTwoSteps(){
      if(this.step < 2)
        this.step += 2;
    }
  }
</script>

<style lang="scss" scoped>
  .scheduler-container{

  }
</style>

