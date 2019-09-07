<template>
  <div style="display: flex; flex-direction: column;height: 100%; color: #626262; font-size: 14px">
    <sticky :z-index="10">
      <div class="top-wrapper">
        <div class="top-left-wrapper">
          <!--<div class="index-wrapper">-->
            <!--&lt;!&ndash;<index-cell title="里程" :value="9999.99" unit="km"></index-cell>&ndash;&gt;-->
          <!--</div>-->
          <div class="shipment-wrapper">
            <draggable v-model="shipmentPool.shipments" group="1" @change="addTourActivity2ShipmentPool"
                       style="height: 100%; display: flex; flex-wrap: wrap; align-content: flex-start">
              <shipment-activity v-for="item in shipmentPool.shipments" :key="item.uid"
                                 :activity="item"></shipment-activity>
            </draggable>
          </div>
        </div>
        <div class="top-right-wrapper">
          <div>
            <add-shipment-activity></add-shipment-activity>
          </div>
          <!--<add-shipment-activity></add-shipment-activity>-->
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
      <div v-for="(route, index) in routePool.routes">
        <div class="route-wrapper">
          <div
            :class="['notice-wrapper', {'notice-wrapper-caution': route.noticeLevel == 3}, {'notice-wrapper-error': route.noticeLevel == 5}]"></div>
          <div style="flex: 1">
            <draggable v-model="routePool.routes[index].activities" group="1" @change="insertActivity($event, index)"
                       style="padding-top: 4px; padding-left: 4px; min-height: 40px; display: flex; flex-wrap: wrap; flex: 1">
              <shipment-activity v-for="item in routePool.routes[index].activities" :key="item.uid"
                                 :activity="item"></shipment-activity>
            </draggable>
          </div>
          <driver-selector :route="route"></driver-selector>
          <div class="expand-icon-wrapper" @click="switchDetail(route)">
          </div>
        </div>
        <div class="route-detail-wrapper" v-if="route.showDetail">
          <div class="route-detail-left-wrapper">
            <div class="route-detail-row">
              <div class="route-detail-title">锁住线路</div>
              <div class="route-detail-content">
                <el-switch v-model="route.isLocked"></el-switch>
              </div>
              <div class="route-detail-title">冻结线路</div>
              <div class="route-detail-content">
                <el-switch v-model="route.isFrozen"></el-switch>
              </div>
            </div>
            <div class="route-detail-row">
              <div class="route-detail-title">线路费用</div>
              <div class="route-detail-content">
                <el-input type="number" size="mini" style="width: 100%" v-model="route.fee"></el-input>
              </div>
            </div>
            <route-index-panel :route="route"></route-index-panel>
            <notice-panel :route="route"></notice-panel>
          </div>
          <div class="route-detail-mid-wrapper">
            <task-panel :tasks="route.tasks"></task-panel>
          </div>
          <div class="route-detail-right-wrapper">
            <driver-panel :driver="route.driver" v-if="route.driver"></driver-panel>
            <div style="font-size: 12px; height: 24px; background: #f5f5f5; line-height: 16px; padding: 4px" v-else>请分配司机</div>
          </div>
        </div>
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
  import {ShipmentPool} from '../../../engine/domain/ShipmentPool'
  import {MyLocationPool} from "../../../engine/domain/MyLocation"
  import DriverSelector from "../../../components/DriverSelector/index"
  import {DriverPool} from '../../../engine/domain/Driver'
  import {VehiclePool} from '../../../engine/domain/Vehicle'
  import NoticePanel from "../../../components/NoticePanel/index"
  import DriverPanel from "../../../components/DriverPanel/index"
  import AddShipmentActivity from "../../../components/AddShipmentActivity/index"
  import {TaskPool} from '../../../engine/domain/Task'
  import TaskPanel from "../../../components/TaskPanel/index"
  import IndexCell from "../../../components/IndexCell/index"
  import RouteIndexPanel from "../../../components/RouteIndexPanel/index"
  import {ProductPool} from '../../../engine/domain/Product'

  @Component({
    name: 'Scheduler',
    components: {
      RouteIndexPanel,
      IndexCell,
      TaskPanel,
      AddShipmentActivity, DriverPanel, NoticePanel, DriverSelector, ShipmentActivity, Sticky, Draggable}
  })
  export default class extends Vue {
    shipmentPool: ShipmentPool;
    routes: Array<Route>;
    routePool: RoutePool;
    loadIndex: string;
    driverPool: DriverPool;
    vehiclePool: VehiclePool;
    taskPool: TaskPool;
    productPool: ProductPool;
    locationPool: MyLocationPool;

    constructor() {
      super();
      this.shipmentPool = ShipmentPool.getInstance();
      this.routePool = RoutePool.getInstance();
      this.driverPool = DriverPool.getInstance();
      this.vehiclePool = VehiclePool.getInstance();
      this.taskPool = TaskPool.getInstance();
      this.productPool = ProductPool.getInstance();
      this.locationPool = MyLocationPool.getInstance();

      this.routePool.addRoute();
      this.routePool.addRoute();

      // let d1 = this.driverPool.createDriver("司机1");
      // let d2 = this.driverPool.createDriver("司机2");
      // let d3 = this.driverPool.createDriver("司机3");
      // let d4 = this.driverPool.createDriver("司机4");
      // let d5 = this.driverPool.createDriver("司机5");
      // let d6 = this.driverPool.createDriver("司机6");
      // let d7 = this.driverPool.createDriver("司机7");
      // let d8 = this.driverPool.createDriver("司机8");
      // let d9 = this.driverPool.createDriver("司机9");

      // let v1 = VehiclePool.getInstance().getVehicle("4504aa8a-4bef-4d83-bacc-241af119ea5d");
      //
      // d1.addAvailableVehicle(v1);
      // d2.addAvailableVehicle(v1);
      // d3.addAvailableVehicle(v1);
      // d4.addAvailableVehicle(v1);
      // d5.addAvailableVehicle(v1);
      // d6.addAvailableVehicle(v1);
      // d7.addAvailableVehicle(v1);
      // d8.addAvailableVehicle(v1);
      // d9.addAvailableVehicle(v1);
    }

    created() {
      this.assembly();
    }

    assembly() {
      // let l1 = this.locationPool.getLocation(1);
      // let l2 = this.locationPool.getLocation(2);
      // let l3 = this.locationPool.getLocation(3);
      // let l4 = this.locationPool.getLocation(4);
      // let l5 = this.locationPool.getLocation(5);
      // let l6 = this.locationPool.getLocation(6);
      //
      // let t1 = this.taskPool.createTask("任务1");
      // let t2 = this.taskPool.createTask("任务2");
      // let t3 = this.taskPool.createTask("任务3");
      // let t4 = this.taskPool.createTask("任务4");
      // let t5 = this.taskPool.createTask("任务5");
      // let t6 = this.taskPool.createTask("任务6");
      //
      // let sta1 = new ShipmentTourActivity("配送" + l1.id, l1, 1, 2, 6, [-1], t1);
      // let sta2 = new ShipmentTourActivity("配送" + l2.id, l2, 2, 3, 8, [-2], t2);
      // let sta3 = new ShipmentTourActivity("配送" + l3.id, l3, 1, 4, 10, [-3], t3);
      // let sta4 = new ShipmentTourActivity("配送" + l4.id, l4, 2, 6, 12, [-4], t4);
      // let sta5 = new ShipmentTourActivity("配送" + l5.id, l5, 2, 4, 14, [-5], t5);
      // let sta6 = new ShipmentTourActivity("配送" + l6.id, l6, 2, 8, 12, [-6], t6);
      //
      // this.shipmentPool.addShipmentTourActivity(sta1);
      // this.shipmentPool.addShipmentTourActivity(sta2);
      // this.shipmentPool.addShipmentTourActivity(sta3);
      // this.shipmentPool.addShipmentTourActivity(sta4);
      // this.shipmentPool.addShipmentTourActivity(sta5);
      // this.shipmentPool.addShipmentTourActivity(sta6);
      // })

      // this.shipmentPool.initializeShipments();
    }

    insertActivity(evt, index) {
      this.routePool.getRoute(index).updateRoute();
    }

    addShipmentTourActivity() {
      let l = this.locationPool.getLocation(1);
      let tourActivity = new ShipmentTourActivity("新建任务" + l.id, l, 1, 0, 100, [-1], undefined);
      this.shipmentPool.addShipmentTourActivity(tourActivity);
    }

    addTourActivity2ShipmentPool() {
      this.shipmentPool.update();
    }

    addRoute() {
      this.routePool.addRoute();
    }

    tryFun() {

    }

    editVehicles() {

    }

    switchDetail(route: Route){
      route.showDetail = !route.showDetail;
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
    /*flex-direction: column;*/
  }

  .index-wrapper {
    /*display: flex;*/
    margin: 0 8px;
    height: 24px;
    flex: 0 0 24px;
  }

  .shipment-wrapper {
    padding-top: 4px;
    padding-left: 8px;
    flex: 1;
    overflow: scroll;
    z-index: 1000;
  }

  .top-right-wrapper {
    /*background: #d8d8d8;*/
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

  .route-driver-wrapper {
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

  .notice-wrapper-caution {
    background: #FFBA00;
  }

  .notice-wrapper-error {
    background: #C03639;
  }

  .expand-icon-wrapper {
    margin: 4px 4px 4px 0;
    min-height: 32px;
    width: 32px;
    background: #d8d8d8;
  }

  .route-detail-wrapper{
    max-height: 160px;
    background: #ffffff;
    display: flex;
  }

  .route-detail-left-wrapper{
    /*padding: 4px;*/
    margin: 4px;
    flex: 0 0 240px;
    font-size: 12px;
    overflow: scroll;
  }

  .route-detail-row{
    display: flex;
    height: 40px;
    background: #f5f5f5;
    padding: 4px;
    line-height: 32px;
    color: #909399;
  }

  .route-detail-title{
    width: 64px;
  }

  .route-detail-content{
    flex: 1 1
  }

  .route-detail-mid-wrapper{
    /*border-left: 1px solid #f5f5f5;*/
    flex: 1;
  }

  .route-detail-right-wrapper{
    padding: 4px;
    /*border-left: 1px solid #f5f5f5;*/
    flex: 0 0 116px;
  }
</style>
