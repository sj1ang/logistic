<template>
  <div>
    <el-table :data="drivers" size="mini">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="name" label="司机" width="100"></el-table-column>
      <el-table-column label="休息">
        <template slot-scope="rest">
          <i class="el-icon-hot-water" v-if="!drivers[rest.$index].isAvailable" style="font-size: 14px"></i>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="100">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="switchDriver(drivers[scope.$index])" v-if="drivers[scope.$index].isAvailable">休息</el-button>
          <el-button type="text" size="small" @click="switchDriver(drivers[scope.$index])" v-else>就绪</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import {Driver, DriverPool} from "../../engine/domain/Driver"

  @Component({
    name: 'ConfigurationDriverPanel'
  })
  export default class extends Vue {
    private drivers: Array<Driver>;
    private driverPool: DriverPool;

    constructor(){
      super();
      this.driverPool = DriverPool.getInstance();
      this.drivers = this.driverPool.drivers;
    }

    switchDriver(driver){
      if(driver.isAvailable){
        driver.rest();
      }else{
        driver.work();
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
