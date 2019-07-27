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

  @Component({
    name: 'Scheduler',
    components: {ShipmentActivity, Sticky, Draggable}
  })
  export default class extends Vue {
    shipmentPool: ShipmentPool;
    routes: Array<Route>;
    routePool: RoutePool;
    loadIndex: string;

    constructor() {
      super();
      this.shipmentPool = new ShipmentPoolImpl();
      this.routePool = RoutePool.getInstance();

      let r1 = new RouteImpl();
      let r2 = new RouteImpl();

      this.routePool.addRoute();
      this.routePool.addRoute();
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

      let sta1 = new ShipmentTourActivity("任务" + l1.id, l1, 1, 2, 6);
      let sta2 = new ShipmentTourActivity("任务" + l2.id, l2, 2, 3, 8);
      let sta3 = new ShipmentTourActivity("任务" + l3.id, l3, 1, 4, 10);
      let sta4 = new ShipmentTourActivity("任务" + l4.id, l4, 2, 6, 12);
      let sta5 = new ShipmentTourActivity("任务" + l5.id, l5, 2, 4, 14);
      let sta6 = new ShipmentTourActivity("任务" + l6.id, l6, 2, 8, 12);

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
      let tourActivity = new ShipmentTourActivity("新建任务", MyLocationFactory.getInstance().createLocation(), 1, 0, 100);
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
</style>
