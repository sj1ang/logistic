<template>
  <div>
    <el-table :data="tasks" size="mini">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="name" label="任务名称" width="180"></el-table-column>
      <el-table-column prop="uid" label="任务编号"></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {Task, TaskPool} from "../../engine/domain/Task"

  @Component({
    name: 'ConfigurationTaskPanel'
  })
  export default class extends Vue {
    private taskPool: TaskPool;
    private tasks: Array<Task>;

    constructor(){
      super();
      this.taskPool = TaskPool.getInstance();
      this.tasks = this.taskPool.tasks;
    }
  }
</script>

<style lang="scss" scoped>

</style>
