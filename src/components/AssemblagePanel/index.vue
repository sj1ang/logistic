<template>
  <div class="assemblage-container">
    <div class="option-wrapper">
      <el-radio v-model="type" label="order">按当日订单装框（计划排线）</el-radio>
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="delivery">按当日发货单装框（套用排线计划）</el-radio>
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="template">生成模拟装框（创建模板）</el-radio>
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="scenario" @click="fetchScenario">导入Scenario（修改已有的物流清单）</el-radio>
    </div>
    <div class="option-wrapper" style="text-align: right; margin-top: 40px">
      <el-button size="mini" style="width: 100%" type="primary" @click="assembleTask">执行</el-button>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {ProductPool} from "../../engine/domain/Product"
  import {MyLocationPool} from "../../engine/domain/MyLocation"
  import {TransportCostMatrixManager} from "../../engine/domain/TransportCostMatrix"
  import {VehiclePool} from "../../engine/domain/Vehicle"
  import {DriverPool} from "../../engine/domain/Driver"
  import {TaskPool} from "../../engine/domain/Task"
  import {getScenario} from "../../api"
  import {Scenario} from '../../engine/domain/Scenario'
  import {ScenarioHandler} from "../../engine/domain/ScenarioHandler"

  @Component({
    name: 'AssemblagePanel'
  })
  export default class extends Vue {
    productPool: ProductPool;
    locationPool: MyLocationPool;
    date: Date;

    type: string;
    // result: string;

    constructor(){
      super();
      this.date = new Date();
      this.type = 'order';
      // this.result = '连接至服务器...'
    }

    assembleEssentials(): Promise{
      return MyLocationPool.getInstance().fetchLocations()
        .then(ProductPool.getInstance().fetchProduct)
        .then(TransportCostMatrixManager.getInstance().fetchTransportCostMatrix)
        .then(VehiclePool.getInstance().fetchVehicles)
        .then(DriverPool.getInstance().fetchDrivers)
    }

    assembleOrderTask(): Promise{
      return this.assembleEssentials()
        .then(TaskPool.getInstance().fetchTasks);
      // .then(res=>{
      //   console.log(res);
      //   this.$parent.moveForward();
      // })
    }

    fetchScenario(): Promise{
      let params = {'params': {id: 1}};
      return new ScenarioHandler().fetchScenario(params);
    }

    assembleTask(){
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      let promise: Promise;

      if(this.type == 'order'){
        promise = this.assembleOrderTask();
      }else if(this.type = 'scenario'){
        promise = this.fetchScenario();
      }

      if(promise) {
        promise.then(res => {
          console.log(res);
          loading.close();
          this.$parent.moveForward();
        })
      }else{
        console.log("error!");
        loading.close();
      }
    }

    importScenario(){

    }
  }
</script>

<style lang="scss" scoped>
  .assemblage-container{
    padding-top: 80px;
  }
  .option-wrapper{
    height: 40px;
    line-height: 40px;
    width: 200px;
    margin: auto;
  }
</style>
