<template>
  <div style="display: flex; flex-direction: column;height: 100%; color: #626262; font-size: 14px">
    <sticky :z-index="10">
      <div class="top-wrapper">
        <div class="top-left-wrapper">
          <div class="index-wrapper"></div>
          <div class="shipment-wrapper">
            <draggable v-model="shipmentPool.shipments" group="1" @change="addTourActivity2ShipmentPool"
                       style="height: 100%; display: flex; flex-wrap: wrap; align-content: flex-start">
              <shipment-activity v-for="item in shipmentPool.shipments" :key="item.uid"
                                 :activity="item"></shipment-activity>
            </draggable>
          </div>
        </div>
        <div class="top-right-wrapper">
          <div class="setting-button" @click="addShipmentTourActivity">
            +
          </div>
          <div class="setting-button" @click="tryFun">
            try
          </div>
          <div class="setting-button" @click="editVehicles">
            vcl
          </div>
        </div>
      </div>
    </sticky>
    <div class="bottom-wrapper">
      <div class="route-wrapper" v-for="(route, index) in routePool.routes">
        <div :class="['notice-wrapper', {'notice-wrapper-caution': route.noticeManager.noticeLevel == 3}, {'notice-wrapper-error': route.noticeManager.noticeLevel == 5}]"></div>
        <div style="flex: 1">
          <draggable v-model="routePool.routes[index].activities" group="1" @change="insertActivity($event, index)"
                     style="padding-top: 4px; padding-left: 4px; min-height: 40px; display: flex; flex-wrap: wrap; flex: 1">
            <shipment-activity v-for="item in routePool.routes[index].activities" :key="item.uid"
                               :activity="item"></shipment-activity>
          </draggable>
        </div>
        <driver-selector :route="route"></driver-selector>
        <div class="expand-icon-wrapper"></div>
      </div>
      <div class="route-wrapper route-add-button-wrapper" @click="addRoute">添加线路</div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'
  import Sticky from "@/components/Sticky/index"
  import ShipmentActivity from "@/components/ShipmentActivity/index"
  import Draggable from "vuedraggable"
  import {DepotTourActivity, ShipmentTourActivity, TourActivity} from '../../../engine/domain/Activity'
  import {Route, RouteImpl, RoutePool} from "../../../engine/domain/Route"
  import {ShipmentPool, ShipmentPoolImpl} from '../../../engine/domain/ShipmentPool'
  import {MyLocationFactory} from "../../../engine/domain/MyLocation"
  import {convertMin2Time, convertTime2Min} from "../../../utils/common"
  import DriverSelector from "../../../components/DriverSelector/index"
  import {DriverPool} from '../../../engine/domain/Driver'
  import {VehiclePool} from '../../../engine/domain/Vehicle'

  @Component({
    name: 'Scheduler',
    components: {DriverSelector, ShipmentActivity, Sticky, Draggable}
  })
  export default class extends Vue {
    shipmentPool: ShipmentPool;
    routes: Array<Route>;
    routePool: RoutePool;
    loadIndex: string;
    driverPool: DriverPool;
    vehiclePool: VehiclePool;

    constructor() {
      super();
      this.shipmentPool = new ShipmentPoolImpl();
      this.routePool = RoutePool.getInstance();
      this.driverPool = DriverPool.getInstance();
      this.vehiclePool = VehiclePool.getInstance();

      this.routePool.addRoute();
      this.routePool.addRoute();

      let d1 = this.driverPool.createDriver("司机1");
      let d2 = this.driverPool.createDriver("司机2");
      let d3 = this.driverPool.createDriver("司机3");
      let d4 = this.driverPool.createDriver("司机4");
      let d5 = this.driverPool.createDriver("司机5");
      let d6 = this.driverPool.createDriver("司机6");
      let d7 = this.driverPool.createDriver("司机7");
      let d8 = this.driverPool.createDriver("司机8");
      let d9 = this.driverPool.createDriver("司机9");

      let v1 = this.vehiclePool.createVehicle("车型1", [21]);
      let v2 = this.vehiclePool.createVehicle("车型2", [21]);
      let v3 = this.vehiclePool.createVehicle("车型3", [21]);
      let v4 = this.vehiclePool.createVehicle("车型4", [21]);
      let v5 = this.vehiclePool.createVehicle("车型5", [21]);
      let v6 = this.vehiclePool.createVehicle("车型6", [21]);
      let v7 = this.vehiclePool.createVehicle("车型7", [21]);
      let v8 = this.vehiclePool.createVehicle("车型8", [21]);
      let v9 = this.vehiclePool.createVehicle("车型9", [21]);
      let v10 = this.vehiclePool.createVehicle("车型10", [21]);

      d1.addAvailableVehicle(v1);
      d2.addAvailableVehicle(v2);
      d3.addAvailableVehicle(v3);
      d4.addAvailableVehicle(v4);
      d5.addAvailableVehicle(v5);
      d6.addAvailableVehicle(v6);
      d7.addAvailableVehicle(v7);
      d8.addAvailableVehicle(v8);
      d9.addAvailableVehicle(v9);
      d9.addAvailableVehicle(v10);


    }

    created() {
      this.assembly();
    }

    assembly() {
      let l1 = MyLocationFactory.getInstance().createLocation();
      let l2 = MyLocationFactory.getInstance().createLocation();
      let l3 = MyLocationFactory.getInstance().createLocation();
      let l4 = MyLocationFactory.getInstance().createLocation();
      let l5 = MyLocationFactory.getInstance().createLocation();
      let l6 = MyLocationFactory.getInstance().createLocation();

      let sta1 = new ShipmentTourActivity("任务" + l1.id, l1, 1, 2, 6, [-1]);
      let sta2 = new ShipmentTourActivity("任务" + l2.id, l2, 2, 3, 8, [-2]);
      let sta3 = new ShipmentTourActivity("任务" + l3.id, l3, 1, 4, 10, [-3]);
      let sta4 = new ShipmentTourActivity("任务" + l4.id, l4, 2, 6, 12, [-4]);
      let sta5 = new ShipmentTourActivity("任务" + l5.id, l5, 2, 4, 14, [-5]);
      let sta6 = new ShipmentTourActivity("任务" + l6.id, l6, 2, 8, 12, [-6]);

      this.shipmentPool.addShipmentTourActivity(sta1);
      this.shipmentPool.addShipmentTourActivity(sta2);
      this.shipmentPool.addShipmentTourActivity(sta3);
      this.shipmentPool.addShipmentTourActivity(sta4);
      this.shipmentPool.addShipmentTourActivity(sta5);
      this.shipmentPool.addShipmentTourActivity(sta6);
    }

    insertActivity(evt, index) {
      this.routePool.getRoute(index).updateRoute();
    }

    addShipmentTourActivity() {
      let l = MyLocationFactory.getInstance().createLocation();
      let tourActivity = new ShipmentTourActivity("新建任务" + l.id, l, 1, 0, 100, [-1]);
      this.shipmentPool.addShipmentTourActivity(tourActivity);
    }

    addTourActivity2ShipmentPool() {
      this.shipmentPool.update();
    }

    addRoute() {
      this.routePool.addRoute();
    }

    tryFun(){

    }

    editVehicles(){

    }

  }
</script>
<style lang="scss">
  .top-wrapper {
    height: 220px;
    background: #f5f5f5;
    display: flex;
  }

  .top-left-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .index-wrapper {
    height: 36px;
    flex: 0 0 36px;
  }

  .shipment-wrapper {
    padding-top: 4px;
    padding-left: 8px;
    flex: 1;
    overflow: scroll;
  }

  .top-right-wrapper {
    background: #d8d8d8;
    flex: 0 0 40px;
  }

  .setting-button {
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #ffffff;
    border-bottom: 1px solid #ffffff;
    user-select: none;
  }

  .bottom-wrapper {
    flex: 1 0 auto;
  }

  .route-wrapper {
    background: #f8f8f8;
    border-top: 1px solid #d8d8d8;
    min-height: 40px;
    display: flex;
    /*box-sizing: border-box;*/
  }

  .route-driver-wrapper{
    margin: 4px;
    width: 80px;
    /*height: ;*/
    background: #d8d8d8;
  }

  .route-add-button-wrapper {
    display: block;
    background: #ffffff;
    border-bottom: 1px dashed #d8d8d8;
    text-align: center;
    line-height: 40px;
    user-select: none;
  }

  .notice-wrapper {
    margin-top: 4px;
    margin-bottom: 4px;
    flex: 0 0 4px;
    overflow: hidden;
    background: #4AB7BD;
  }

  .notice-wrapper-caution{
    background: #FFBA00;
  }

  .notice-wrapper-error{
    background: #C03639;
  }

  .expand-icon-wrapper{
    margin: 4px 4px 4px 0;
    height: 32px;
    width: 32px;
    background: #d8d8d8;
  }
</style>
