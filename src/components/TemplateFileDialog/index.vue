<template>
  <el-dialog>

  </el-dialog>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'

  @Component({
    name: 'TemplateFileDialog'
  })
  export default class extends Vue {

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
