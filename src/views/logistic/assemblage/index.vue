<template>
  <div v-if="!ready">assembling</div>
  <scheduler v-else></scheduler>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'
  import {ProductPool} from "../../../engine/domain/Product"
  import {MyLocationPool} from "../../../engine/domain/MyLocation"
  import Scheduler from "../scheduler/index"
  import {TaskPool} from "../../../engine/domain/Task"

  @Component({
    name: 'Assemblage',
    components: {Scheduler}
  })
  export default class extends Vue {
    productPool: ProductPool;
    locationPool: MyLocationPool;
    ready: boolean = false;

    created(){
      this.ready = false;
      this.assembly();
    }

    assembly(){
      MyLocationPool.getInstance().fetchLocations().then(ProductPool.getInstance().fetchProduct).then(TaskPool.getInstance().fetchTasks).then(res=>{
        console.log(res);



        this.ready = true;
      })
    }
  }
</script>

<style lang="scss" scoped>

</style>

