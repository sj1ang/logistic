<template>
  <el-dialog title="司机考核" :append-to-body='true' :visible.sync="dialogVisible"> driver penalty dialog</el-dialog>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'

  @Component({
    name: 'DriverPenaltyDialog'
  })
  export default class extends Vue {
    private dialogVisible: boolean = false;

    showDialog() {
      this.dialogVisible = true;
    }
  }
</script>

<style lang="scss" scoped>

</style>
