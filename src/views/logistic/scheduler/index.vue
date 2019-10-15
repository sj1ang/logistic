<template>
  <div style="display: flex; flex-direction: column;height: 100%; color: #626262; font-size: 14px; padding-bottom: 32px">
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
          <!--<div class="setting-button" @click="addShipmentTourActivity">-->
            <!--+-->
          <!--</div>-->
          <div class="setting-button" @click="tryFun">
            try
          </div>
          <!--<div class="setting-button" @click="editVehicles">-->
            <!--vcl-->
          <!--</div>-->
        </div>
      </div>
    </sticky>
    <div class="bottom-wrapper">
      <div v-for="(route, index) in routePool.routes">
        <div :class="['route-wrapper', {'route-wrapper-locked': route.isLocked}]">
          <div
            :class="['notice-wrapper', {'notice-wrapper-caution': route.noticeLevel == 3}, {'notice-wrapper-error': route.noticeLevel == 5}]"></div>
          <div style="flex: 1">
            <draggable v-model="routePool.routes[index].activities" group="1" @change="insertActivity($event, index)" :disabled="routePool.routes[index].isLocked"
                       style="padding-top: 4px; padding-left: 4px; min-height: 40px; display: flex; flex-wrap: wrap; flex: 1">
              <shipment-activity v-for="item in routePool.routes[index].activities" :key="item.uid"
                                 :activity="item"></shipment-activity>
            </draggable>
          </div>
          <driver-selector :route="route"></driver-selector>
          <div class="expand-icon-wrapper" @click="switchDetail(route)">
            <!--<i class="el-icon-lock" v-if="route.isLocked"></i>-->
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
                <el-input type="number" size="mini" style="width: 100%" v-model="route.fee" @blur="route.changeFee"></el-input>
              </div>
            </div>
            <route-index-panel :route="route"></route-index-panel>
            <notice-panel :route="route"></notice-panel>
          </div>
          <div class="route-detail-mid-wrapper">
            <task-panel :tasks="route.tasks"></task-panel>
          </div>
          <div class="route-detail-right-wrapper">
            <div style="flex: 1">
              <driver-panel :driver="route.driver" v-if="route.driver"></driver-panel>
              <div style="font-size: 12px; height: 32px; background: #f5f5f5; line-height: 24px; padding: 4px" v-else>请分配司机</div>
            </div>
            <div class="remove-route-wrapper">
              <el-button size="mini" style="width: 100%; height: 100%" type="warning" @click="removeRoute(route)">删除线路</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="route-wrapper route-add-button-wrapper" @click="addNewRoute">添加线路</div>
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
  import {ScenarioHandler} from "../../../engine/domain/ScenarioHandler"
  import BottomBar from "../../../components/BottomBar/index"

  @Component({
    name: 'Scheduler',
    components: {
      BottomBar,
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
    }

    insertActivity(evt, index) {
      this.routePool.getRoute(index).updateRoute();
    }

    // addShipmentTourActivity() {
    //   let l = this.locationPool.getLocation(1);
    //   let tourActivity = new ShipmentTourActivity("新建任务" + l.id, l, 1, 0, 100, [-1], undefined);
    //   this.shipmentPool.addShipmentTourActivity(tourActivity);
    // }

    addTourActivity2ShipmentPool() {
      this.shipmentPool.update();
    }

    removeRoute(route){
      this.$confirm('是否删除该线路？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        RoutePool.getInstance().removeRoute(route);
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {

      });
    }

    addNewRoute() {
      this.routePool.addNewRoute();
    }

    tryFun() {
      console.log(TaskPool.getInstance().taskShipmentMap);
      console.log(TaskPool.getInstance().taskAdditionalShipmentMap);

      ScenarioHandler.getInstance().save().then(res=>{
        console.log("saved...");
      });
    }

    // editVehicles() {
    //
    // }

    switchDetail(route: Route){
      route.showDetail = !route.showDetail;
    }

  }
</script>
<style lang="scss">
  .top-wrapper {
    height: 220px;
    background: #f5f5f5;
    width: 100%;
    display: flex;
    border-bottom: 2px solid #ffffff;
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
    /*background: #f8f8f8;*/
    border-top: 1px solid #d8d8d8;
    min-height: 40px;
    display: flex;
    /*box-sizing: border-box;*/
  }

  .route-wrapper-locked{
    background: #F2F6FC;
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
    background: #F56C6C;
  }

  .expand-icon-wrapper {
    margin: 4px 4px 4px 0;
    min-height: 32px;
    width: 32px;
    background: #d8d8d8;
    font-size: 20px;
    text-align: center;
    line-height: 32px;
    color: #ffffff;
  }

  .route-detail-wrapper{
    max-height: 256px;
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
    display: flex;
    flex-direction: column;
  }

  .remove-route-wrapper{
    /*background: #d8d8d8;*/
    margin-top: 4px;
    height: 32px;
    flex: 0 0 32px;
    /*width: 80px;*/
  }
</style>
