<template>
  <div>
    <el-table :data="tasks" size="mini">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="name" label="任务名称" width="180"></el-table-column>
      <el-table-column :label="title" width="80" v-for="(title, index) in titles">
        <template slot-scope="scope">
          {{-scope.row.load.size[index]}}
        </template>
      </el-table-column>
      <el-table-column prop="uid" label="任务编号"></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {Task, TaskPool} from "../../engine/domain/Task"
  import {Constants} from "../../engine/Constant/Constants"

  @Component({
    name: 'ConfigurationTaskPanel'
  })
  export default class extends Vue {
    private taskPool: TaskPool;
    private tasks: Array<Task>;
    private titles: Array<string>;

    constructor(){
      super();
      this.taskPool = TaskPool.getInstance();
      this.tasks = this.taskPool.tasks;
      this.titles = Constants.LOAD_TITLE;
      console.log(this.tasks);
    }
  }
</script>

<style lang="scss" scoped>

</style>
