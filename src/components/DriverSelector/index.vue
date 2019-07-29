<template>
  <div class="main-container">
    <!--<div style="border-left: 1px solid #d8d8d8; width: 4px; box-sizing: border-box"></div>-->
    <div class="driver-wrapper" @click="switchDialog">
      <div v-if="route.driver" class="driver-info-wrapper">
        <div class="driver-info-upper-wrapper">{{route.driver.name}}</div>
        <div class="driver-info-bottom-wrapper">{{route.driver.vehicle.name}}</div>
      </div>
      <div v-else>待选择</div>
    </div>
    <el-dialog title="选择司机" :visible.sync="dialogVisible">
      <div class="driver-list-wrapper">
        <div v-for="(driver, index) in drivers" class="driver-row-wrapper">
          <div class="driver-name-wrapper">{{driver.name}}</div>
          <div style="flex: 1; display: flex">
            <div v-for="(vehicle, index) in driver.availableVehicles" :class="['vehicle-selector', {'vehicle-selector-chosen': (driver.vehicle && driver.vehicle.uid == vehicle.uid)}]" @click="chooseVehicle(driver, vehicle)">{{vehicle.name}}</div>
          </div>
          <div class="operation-button-wrapper">
            <el-button
              type="text"
              size="small"
              @click="assignDriver(route, driver)">
              选择
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import {Route} from "../../engine/domain/Route"
  import {Driver, DriverPool} from "../../engine/domain/Driver"
  import {Vehicle} from "../../engine/domain/Vehicle"

  @Component({
    name: 'DriverSelector'
  })
  export default class extends Vue {
    @Prop() private route: Route;
    private title: string = "司机名";
    private drivers: Array<Driver>;
    private dialogVisible = false;

    constructor() {
      super();
      this.drivers = DriverPool.getInstance().drivers;
    }

    switchDialog() {
      this.dialogVisible = true;
    }

    assignDriver(route: Route, driver: Driver){
      route.assignDriver(driver);
      this.dialogVisible = false;
    }

    chooseVehicle(driver: Driver, vehicle: Vehicle){
      driver.assignVehicle(vehicle);
    }
  }
</script>

<style lang="scss" scoped>
  .main-container {
    width: 64px;
    margin: 4px;
    display: flex;
  }

  .driver-wrapper {
    line-height: 32px;
    text-align: center;
    user-select: none;
    background: #d8d8d8;
    font-size: 12px;
    flex: 0 0 64px;
  }

  .driver-info-wrapper{
    height: 32px;
    padding: 2px;
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .driver-info-upper-wrapper{
    line-height: 16px;
    font-size: 12px;
  }

  .driver-info-bottom-wrapper{
    line-height: 12px;
    font-size: 10px;
    color: #909399;
  }

  .driver-list-wrapper{
    height: 264px;
    overflow: scroll
  }

  .driver-list-wrapper::-webkit-scrollbar{
    display: none;
  }

  .driver-row-wrapper {
    height: 40px;
    padding: 4px;
    background: #f8f8f8;
    /*border-top: 1px solid #d8d8d8;*/
    margin-bottom: 4px;
    display: flex;
  }

  .driver-name-wrapper {
    line-height: 32px;
    color: #606266;
    flex: 0 0 56px;
    text-align: center;
    font-size: 12px;
  }

  .vehicle-selector{
    line-height: 32px;
    /*width: 64px;*/
    text-align: center;
    font-size: 12px;
    color: #606266;
    user-select: none;
    padding: 0 8px 0 8px;
  }

  .vehicle-selector:last-child{
    margin-right: 0px;
  }

  .vehicle-selector-chosen{
    color: #4AB7BD;
  }

  .operation-button-wrapper {
    flex: 0 0 40px;
    text-align: center;
    /*line-height: 32px;*/
  }
</style>
