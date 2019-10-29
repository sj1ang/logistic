<template>
  <div>

  </div>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator'
  import {MyLocation} from '../../../engine/domain/MyLocation'
  import {getLocations} from "../../../api"

  @Component({
    name: 'Location',
  })
  export default class extends Vue {
    private locations: Array<MyLocation>;

    mounted(){
      let params = {};
      getLocations(params).then(res=>{
        console.log(res);
      });
    }
  }
</script>

<style lang="scss" scoped>

</style>

