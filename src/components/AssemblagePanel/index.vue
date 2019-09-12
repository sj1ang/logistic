<template>
  <div class="assemblage-container">
    <div class="option-wrapper">
      <el-radio v-model="type" label="order"
        >按当日订单装框（计划排线）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="delivery"
        >按当日发货单装框（套用排线计划）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="template"
        >生成模拟装框（创建模板）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="scenario"
        >导入Scenario（修改已有的物流清单）</el-radio
      >
      <div
        style="margin-left: 24px"
        v-if="type == 'scenario' && scenarioFiles.length > 0"
      >
        <el-select
          size="mini"
          v-model="scenarioIndex"
          placeholder="选择scenario"
        >
          <el-option
            v-for="(item, index) in scenarioFiles"
            :key="index"
            :label="item.name"
            :value="index"
            value-key="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <div
        style="margin-left: 24px"
        v-if="type == 'scenario' && scenarioFiles.length == 0"
      >
        <span style="font-size: 12px; color: #E65D6E">暂无scenario</span>
      </div>
    </div>
    <div class="option-wrapper" style="text-align: right; margin-top: 40px;">
      <div style="margin-left: 24px">
        <el-button
          size="mini"
          style="width: 100%"
          type="primary"
          @click="conduct"
          >执行</el-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ProductPool } from "../../engine/domain/Product";
import { MyLocationPool } from "../../engine/domain/MyLocation";
import { TransportCostMatrixManager } from "../../engine/domain/TransportCostMatrix";
import { VehiclePool } from "../../engine/domain/Vehicle";
import {Driver, DriverPool} from "../../engine/domain/Driver";
import { TaskPool } from "../../engine/domain/Task";
import { getScenario } from "../../api";
import { Scenario, ScenarioFile } from "../../engine/domain/Scenario";
import { ScenarioHandler } from "../../engine/domain/ScenarioHandler";
import { genUID } from "../../utils/common";
import {RoutePool} from "../../engine/domain/Route"
import {ShipmentPool} from "../../engine/domain/ShipmentPool"

@Component({
  name: "AssemblagePanel"
})
export default class extends Vue {
  productPool: ProductPool;
  locationPool: MyLocationPool;
  date: Date;
  type: string;
  scenarioFiles: Array<ScenarioFile>;
  scenarioIndex: number = 0;
  // result: string;

  constructor() {
    super();
    this.date = new Date();
    this.type = "order";
    this.scenarioFiles = new Array<ScenarioFile>();
    this.scenarioFiles.push(
      new ScenarioFile(
        1,
        "2019-9-12 物流清单",
        new Date(),
        new Date(),
        "蔡徐坤",
        genUID()
      )
    );
    // this.result = '连接至服务器...'
  }

  assembleEssentials(): Promise {
    return MyLocationPool.getInstance()
      .fetchLocations()
      .then(ProductPool.getInstance().fetchProduct)
      .then(TransportCostMatrixManager.getInstance().fetchTransportCostMatrix)
      .then(VehiclePool.getInstance().fetchVehicles)
      .then(DriverPool.getInstance().fetchDrivers);
  }

  assembleOrderTask(): Promise {
    return this.assembleEssentials().then(TaskPool.getInstance().fetchTasks);
  }

  assembleFromScenario(): Promise {
    let sid = this.scenarioFiles[this.scenarioIndex].id;
    let params = { params: { id: sid } };
    // let params = { params: { id: 4 } };
    return new ScenarioHandler()
      .fetchEssentialsAndScenario(params)
      .then(scenario => {
        console.log(scenario);
        TaskPool.getInstance().assembleTasksFromScenario(scenario);
        VehiclePool.getInstance().assembleVehiclesFromScenario(scenario);
        DriverPool.getInstance().assembleDriversFromScenario(scenario);
        RoutePool.getInstance().assembleRoutesFromScenario(scenario);
        ShipmentPool.getInstance().assembleShipmentsFromScenario(scenario);
        return Promise.resolve("assemble from scenario successfully...");
      });
  }

  conduct() {
    const loading = this.$loading({
      lock: true,
      text: "Loading",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });

    let promise: Promise;

    if (this.type == "order") {
      promise = this.assembleOrderTask();
    } else if ((this.type = "scenario")) {
      promise = this.assembleFromScenario();
    }

    if (promise) {
      promise.then(res => {
        loading.close();
        if (this.type == "scenario") {
          this.$parent.moveTwoSteps();
        } else {
          this.$parent.moveForward();
        }
      });
    } else {
      this.$message.error("ERROR!");
      loading.close();
    }
  }
}
</script>

<style lang="scss" scoped>
.assemblage-container {
  padding-top: 80px;
}
.option-wrapper {
  min-height: 40px;
  line-height: 40px;
  width: 200px;
  margin: auto;
}
</style>
