<template>
  <div class="mode-selector-container">
    <div class="option">
      <div class="upper-wrapper">
        <span style="line-height: 20px">根据已有的订单自动生成配送任务<br>但不会分配线路</span>
      </div>
      <div class="bottom-wrapper">
        <el-button type="primary" size="mini" @click="generateBlankPlan">生成空白计划</el-button>
      </div>
    </div>
    <div class="option">
      <div class="upper-wrapper">
        <span style="line-height: 20px">依据模板自动生成配送任务和线路</span>
        <div style="position: absolute; bottom: 8px; left: 0; right: 0">
          <el-select size="mini"></el-select>
        </div>
      </div>
      <div class="bottom-wrapper">
        <el-button type="primary" size="mini">依据模板生成</el-button>
      </div>
    </div>
    <div class="option">
      <div class="upper-wrapper">
        <span style="line-height: 20px">在任务计划上进行修改<br>保存为配送记录</span>
      </div>
      <div class="bottom-wrapper">
        <el-button type="primary" size="mini">导入已有计划</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {ShipmentPool} from "../../engine/domain/ShipmentPool"

  @Component({
    name: 'ModeSelector'
  })
  export default class extends Vue {

    generateBlankPlan(){
      ShipmentPool.getInstance().initializeShipments();
      this.$parent.moveForward();
    }
  }
</script>

<style lang="scss" scoped>
  .mode-selector-container{
    display: flex;
    height: 400px;
    background: #f5f5f5;
  }
  .option{
    flex: 1;
    border-right: 1px solid #ffffff;
    display: flex;
    flex-direction: column;

  }
  .option:hover{
    background: #ffffff;
  }
  .option:last-child{
    border-right: 0px;
  }
  .upper-wrapper{
    flex: 0 0 300px;
    padding-top: 64px;
    text-align: center;
    font-size: 14px;
    color: #606266;
    position: relative;
  }
  .bottom-wrapper{
    flex: 1;
    padding-top: 8px;
    text-align: center;
  }
</style>
