<template>
  <div>
    <el-table :data="vehicles" size="mini">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="name" label="车型名称" width="200"></el-table-column>
      <el-table-column prop="fixedCost" label="固定成本"></el-table-column>
      <el-table-column prop="distanceCost" label="里程成本/公里"></el-table-column>
      <el-table-column prop="serviceTimeCost" label="服务成本/分钟"></el-table-column>
      <el-table-column prop="idleTimeCost" label="等待成本/分钟"></el-table-column>
      <el-table-column v-for="(name, index) in loadTitles" :key="index" :label="name">
        <template slot-scope="scope">
          {{vehicles[scope.$index].capacity.size[index]}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {Vehicle, VehiclePool} from '../../engine/domain/Vehicle'
  import {Constants} from "../../engine/Constant/Constants"

  @Component({
    name: 'ConfigurationVehiclePanel'
  })
  export default class extends Vue {
    private vehiclePool: VehiclePool;
    private vehicles: Array<Vehicle>;
    private loadTitles: Array<string>;

    constructor(){
      super();
      this.vehiclePool = VehiclePool.getInstance();
      this.vehicles = this.vehiclePool.vehicles;
      this.loadTitles = Constants.LOAD_TITLE;
    }
  }
</script>

<style lang="scss" scoped>

</style>
