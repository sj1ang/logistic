<template>
  <div class="assemblage-container">
    <div class="option-wrapper">
      <el-radio v-model="type" label="order"
        >按配送日订单装框（创建物流计划单）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="delivery"
        >按配送日发货单装框（创建物流结单）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="mock"
        >生成模拟装框（创建模板）</el-radio
      >
    </div>
    <div class="option-wrapper">
      <el-radio v-model="type" label="scenario"
        >导入Scenario（修改已有的物流单）</el-radio
      >
      <div style="margin-left: 24px">
        <el-date-picker
          v-if="type == 'order' || type == 'delivery'"
          size="mini"
          v-model="selectedDate"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
        <el-select
          size="mini"
          v-model="scenarioIndex"
          placeholder="选择scenario"
          v-if="type == 'scenario' && scenarioFiles.length > 0"
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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ProductPool } from "../../engine/domain/Product";
import { MyLocationPool } from "../../engine/domain/MyLocation";
import { TransportCostMatrixManager } from "../../engine/domain/TransportCostMatrix";
import { VehiclePool } from "../../engine/domain/Vehicle";
import { Driver, DriverPool } from "../../engine/domain/Driver";
import { TaskPool } from "../../engine/domain/Task";
import { getScenario } from "../../api";
import { Scenario, ScenarioFile } from "../../engine/domain/Scenario";
import { ScenarioHandler } from "../../engine/domain/ScenarioHandler";
import { genUID } from "../../utils/common";
import { RoutePool } from "../../engine/domain/Route";
import { ShipmentPool } from "../../engine/domain/ShipmentPool";

@Component({
  name: "AssemblagePanel"
})
export default class extends Vue {
  productPool: ProductPool;
  locationPool: MyLocationPool;
  date: Date;
  type: string = "order";
  scenarioFiles: Array<ScenarioFile>;
  scenarioIndex: number = 0;
  selectedDate: Date;
  pickerOptions: Object = {
    disabledDate(time): boolean {
      let dateTime = new Date();
      dateTime.setDate(dateTime.getDate() + 1);
      return time.getTime() > dateTime;
    }
  };

  constructor() {
    super();
    this.date = new Date();
    this.type = "order";
    this.scenarioFiles = new Array<ScenarioFile>();

    let dateTime = new Date();
    dateTime.setDate(dateTime.getDate() + 1);
    this.selectedDate = dateTime;
  }

  @Watch("type")
  onTypeChanged() {
    if (this.type == "order") {
      let dateTime = new Date();
      dateTime.setDate(dateTime.getDate() + 1);
      this.selectedDate = dateTime;
    } else if (this.type == "delivery") {
      this.selectedDate = new Date();
    }
  }

  created() {
    const loading = this.$loading({
      lock: true,
      text: "Loading",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });

    ScenarioHandler.getInstance()
      .fetchScenarioFileList()
      .then(res => {
        this.scenarioFiles = ScenarioHandler.getInstance().files;
        console.log(this.scenarioFiles);
        console.log(res);
        loading.close();
      });
  }

  assembleEssentials(): Promise {
    // return MyLocationPool.getInstance()
    //   .fetchLocations()
    //   .then(ProductPool.getInstance().fetchProduct)
    //   .then(TransportCostMatrixManager.getInstance().fetchTransportCostMatrix)
    //   .then(VehiclePool.getInstance().fetchVehicles)
    //   .then(DriverPool.getInstance().fetchDrivers);

    return ScenarioHandler.getInstance().fetchAllEssentials();
  }

  assembleOrderTask(): Promise {
    return this.assembleEssentials().then(res => {
      return TaskPool.getInstance().fetchTasks(true);
    });
  }

  assembleMockTask(): Promise {
    return this.assembleEssentials().then(res => {
      return TaskPool.getInstance().fetchTasks(false);
    });
  }

  assembleFromScenario(): Promise {
    let sid = this.scenarioFiles[this.scenarioIndex].id;
    let params = { params: { id: sid } };
    return ScenarioHandler.getInstance()
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

    ScenarioHandler.getInstance().setSelectedScenarioFile(
      this.scenarioFiles[this.scenarioIndex]
    );

    ScenarioHandler.getInstance().type = this.type;

    let promise: Promise;

    if (this.type == "order") {
      promise = this.assembleOrderTask();
    } else if(this.type == "mock"){
      promise = this.assembleMockTask();
    }else if ((this.type = "scenario")) {
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
