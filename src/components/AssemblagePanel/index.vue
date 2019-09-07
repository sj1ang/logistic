<template>
  <div>

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {ProductPool} from "../../engine/domain/Product"
  import {MyLocationPool} from "../../engine/domain/MyLocation"
  import {TransportCostMatrixManager} from "../../engine/domain/TransportCostMatrix"
  import {VehiclePool} from "../../engine/domain/Vehicle"
  import {DriverPool} from "../../engine/domain/Driver"
  import {TaskPool} from "../../engine/domain/Task"

  @Component({
    name: 'AssemblagePanel'
  })
  export default class extends Vue {
    productPool: ProductPool;
    locationPool: MyLocationPool;

    date: Date;

    constructor(){
      super();
      this.date = new Date();
    }

    created(){
      this.assembly();
    }

    assembly(){
      MyLocationPool.getInstance().fetchLocations()
        .then(ProductPool.getInstance().fetchProduct)
        .then(TransportCostMatrixManager.getInstance().fetchTransportCostMatrix)
        .then(VehiclePool.getInstance().fetchVehicles)
        .then(DriverPool.getInstance().fetchDrivers)
        .then(TaskPool.getInstance().fetchTasks).then(res=>{
        console.log(res);

        // this.$parent.moveForward();
      })
    }
  }
</script>

<style lang="scss" scoped>

</style>
