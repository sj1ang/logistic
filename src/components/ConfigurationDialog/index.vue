<template>
    <el-dialog :fullscreen="true" :append-to-body='true' :visible.sync="dialogVisible">
      dialog
    </el-dialog>
</template>

<script lang="ts">
  import {Component, Vue} from "vue-property-decorator"

  @Component({
    name: 'ConfigurationDialog'
  })
  export default class extends Vue {
    private dialogVisible = false;
    constructor(){
      super();
    }

    showDialog() {
      console.log('visible...');
      this.dialogVisible = true;
    }
  }

</script>

<style lang="scss" scoped>

</style>
