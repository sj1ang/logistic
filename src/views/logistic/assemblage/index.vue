<template>
  <div class="main-container">
    <div class="scheduler-container">
      <assemblage-panel v-if="step == 0"></assemblage-panel>
      <mode-selector v-if="step == 1"></mode-selector>
      <scheduler v-if="step == 2"></scheduler>
    </div>
    <div class="bottom-container" :style="{width: width}">
      <bottom-bar style="flex: 0 0 24px" :step="step"></bottom-bar>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator'
  import {ProductPool} from "../../../engine/domain/Product"
  import {MyLocationPool} from "../../../engine/domain/MyLocation"
  import Scheduler from "../scheduler/index"
  import {TaskPool} from "../../../engine/domain/Task"
  import {TransportCostMatrixManager} from "../../../engine/domain/TransportCostMatrix"
  import {VehiclePool} from "../../../engine/domain/Vehicle"
  import {DriverPool} from "../../../engine/domain/Driver"
  import ModeSelector from "../../../components/ModeSelector/index"
  import AssemblagePanel from "../../../components/AssemblagePanel/index"
  import BottomBar from "../../../components/BottomBar/index"
  import {AppModule} from "../../../store/modules/app"

  @Component({
    name: 'Assemblage',
    components: {BottomBar, AssemblagePanel, ModeSelector, Scheduler}
  })
  export default class extends Vue {
    step: number = 0;
    private width = 'auto'

    constructor(){
      super();
    }

    get isOpened(){
      return AppModule.sidebar.opened
    }

    @Watch('isOpened')
    onSideBarStatusChanged(){
      this.consecutiveResize();
    }

    mounted() {
      this.width = this.$el.getBoundingClientRect().width.toString() + 'px'
      // window.addEventListener('scroll', this.handleResize)
      // window.addEventListener('resize', this.handleResize)
    }

    activated() {
      this.handleResize()
    }

    moveForward(){
      if(this.step < 3)
        this.step ++;
    }

    moveTwoSteps(){
      if(this.step < 2)
        this.step += 2;
    }

    private handleResize() {
      this.width = this.$el.getBoundingClientRect().width.toString() + 'px'
    }

    private consecutiveResize(){
      let resize = setInterval(()=>{this.width = this.$el.getBoundingClientRect().width.toString() + 'px'}, 5);
      setTimeout(()=>{clearInterval(resize)}, 2000);
    }
  }
</script>

<style lang="scss" scoped>
  .main-container{
    position: relative;
    height: 100%;
    width: 100%;
  }
  .scheduler-container{
    position: relative;
    /*top: 0;*/
    /*bottom: 24px;*/
    /*overflow: scroll;*/
  }
  .bottom-container{
    position: fixed;
    bottom: 0;
  }
</style>

