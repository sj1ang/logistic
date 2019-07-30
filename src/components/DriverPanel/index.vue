<template>
  <div class="driver-panel-wrapper">
    <!--<div class="route-detail-row">-->
      <!--<div class="route-detail-title">{{driver.name}}</div>-->
      <!--<div class="route-detail-content">-->

      <!--</div>-->
    <!--</div>-->
    <div style="height: 40px">
      <div style="display: flex;">
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
      </div>
      <div style="display: flex;">
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
        <div class="working-day-wrapper"></div>
      </div>
    </div>
    <div class="driver-summary-wrapper">
      近三十天：#21
    </div>
    <div class="driver-summary-wrapper">
      无投诉
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import {Driver} from '../../engine/domain/Driver'

  @Component({
    name: 'DriverPanel'
  })
  export default class extends Vue {
    @Prop() private driver: Driver
  }
</script>

<style lang="scss" scoped>
  .driver-panel-wrapper {

  }

  .working-day-wrapper {
    height: 12px;
    width: 12px;
    margin: 4px 4px 0px 0;
    background: #4AB7BD;
  }

  .working-day-wrapper:last-child {
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
    flex: 1 1
  }
  .driver-summary-wrapper{
    height: 24px;
    background: #f5f5f5;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    line-height: 16px;
    padding: 4px;
  }
</style>
