<template>
  <div style=""><svg-icon name="box"></svg-icon></div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {Route} from '../../engine/domain/Route'

  @Component({
    name: 'BoxCell'
  })
  export default class extends Vue {
    @Prop() private type: string;
    @Prop() private num: number;
  }
</script>

<style lang="scss" scoped>

</style>
