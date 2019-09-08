<template>
  <div class="indices-wrapper">
    <index-cell title="补货" :value="route.additionalFee.toFixed(2)" unit="元"></index-cell>
    <index-cell title="总价" :value="totalFee.toFixed(2)" unit="元"></index-cell>
    <!--<index-cell title="里程" :value="route.distance.toFixed(2)" unit="km"></index-cell>-->
    <index-cell title="等待" :value="route.idleTime.toFixed(0)" unit="min"></index-cell>
    <!--<index-cell title="装卸" :value="route.distance.toFixed(0)" unit="min"></index-cell>-->
    <index-cell title="耗时" :value="route.duration.toFixed(0)" unit="min"></index-cell>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import {Route} from "../../engine/domain/Route"
  import IndexCell from "../IndexCell/index"

  @Component({
    name: 'RouteIndexPanel',
    components: {IndexCell}
  })
  export default class extends Vue {
    @Prop() private route: Route;

    get totalFee(){
      let fee = this.route.fee == "" ? 0 : this.route.fee;
      return Number.parseFloat(<string>fee) + this.route.additionalFee
    }
  }
</script>

<style lang="scss" scoped>
  .indices-wrapper{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
</style>
