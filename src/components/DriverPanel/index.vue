<template>
  <div class="driver-panel-wrapper">
    <div style="height: 32px">
      <div style="display: flex; flex-wrap: wrap">
        <div
          v-for="(isWork, index) in driver.workdays"
          :class="['day-wrapper', { 'work-day-wrapper': isWork }]"
        ></div>
      </div>
    </div>
    <div style="display: flex; flex-wrap: wrap; background: #f5f5f5; margin-bottom: 4px">
      <div
        :class="[
          'box-info',
          { veg630box: index == 0 },
          { vegstdbox: index == 1 },
          { redbox: index == 2 }
        ]"
        v-for="(title, index) in driver.boxCollection.boxTypes"
        style="display: flex;"
      >
        <div style="height: 16px; line-height: 14px; padding: 1px 0;">
          <svg-icon name="box"></svg-icon>
        </div>
        <div class="box-number">{{ driver.boxCollection.boxSent[index] }}</div>
        <div class="box-number">
          {{ driver.boxCollection.boxReturned[index] }}
        </div>
      </div>
    </div>
    <div
      class="driver-summary-wrapper"
      v-for="(reason, index) in driver.punishment.reasons"
    >
      {{ reason }}
    </div>
    <div class="driver-summary-wrapper" v-if="driver.punishment.penaltyFee > 0">
      考核处罚：{{ driver.punishment.penaltyFee }}元
    </div>
    <div>
      <el-button
        size="mini"
        type="danger"
        style="width: 100%; height: 32px"
        @click="switchDriverPenaltyDialog"
        >司机考核</el-button
      >
    </div>
    <driver-penalty-dialog
      ref="driverPenaltyDialog"
      :driver="driver"
    ></driver-penalty-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Driver } from "../../engine/domain/Driver";
import DriverPenaltyDialog from "../DriverPenaltyDialog/index";

@Component({
  name: "DriverPanel",
  components: { DriverPenaltyDialog }
})
export default class extends Vue {
  @Prop() private driver: Driver;

  switchDriverPenaltyDialog() {
    this.$refs.driverPenaltyDialog.showDialog();
  }
}
</script>

<style lang="scss" scoped>
.driver-panel-wrapper {
}

.day-wrapper {
  height: 12px;
  width: 12px;
  margin: 0px 4px 4px 0;
  background: #d8d8d8;
}

.work-day-wrapper {
  background: #4ab7bd;
}

.day-wrapper:nth-child(7n) {
  margin-right: 0;
}

.route-detail-row {
  display: flex;
  height: 40px;
  background: #f5f5f5;
  padding: 4px;
  line-height: 32px;
  color: #909399;
}

.route-detail-title {
  width: 64px;
}

.route-detail-content {
  flex: 1 1;
}

.driver-summary-wrapper {
  height: 24px;
  background: #f5f5f5;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 16px;
  padding: 4px;
}

.box-info {
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  padding: 4px;
  display: flex;
  width: 54px;
}

.box-number {
  line-height: 16px;
  font-size: 12px;
  padding: 0 0 0 4px;
  width: 20px;
  flex: 1;
  color: #606266;
}

.veg630box {
  color: #409eff;
}

.vegstdbox {
  color: #30b08f;
}

.redbox {
  color: red;
}
</style>
