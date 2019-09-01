<template>
  <div class="cell-wrapper">
    <div class="title-wrapper">{{title}}</div>
    <div class="value-wrapper">{{value}}</div>
    <div>{{unit}}</div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'

  @Component({
    name: 'IndexCell'
  })
  export default class extends Vue {
    @Prop() title: string;
    @Prop() value: number;
    @Prop() unit: string;
  }
</script>

<style lang="scss" scoped>
  .cell-wrapper{
    display: flex;
    height: 24px;
    width: 118px;
    background: #4AB7BD;
    color: white;
    padding: 2px;
    line-height: 20px;
    font-size: 12px;
    margin: 4px 0 0 0;
    user-select: none;
  }
  .title-wrapper{
    flex: 0 0 26px;
  }
  .value-wrapper{

  }
  .unit-wrapper{
    /*flex: 0 0 16px;*/
  }

</style>
