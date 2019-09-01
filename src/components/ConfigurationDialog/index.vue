<template>
    <el-dialog title="" :fullscreen="true" :append-to-body='true' :visible.sync="dialogVisible">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="任务信息" name="first">
          <configuration-task-panel></configuration-task-panel>
        </el-tab-pane>
        <el-tab-pane label="车辆信息" name="second">
          <configuration-vehicle-panel></configuration-vehicle-panel>
        </el-tab-pane>
        <el-tab-pane label="司机管理" name="third">
          <configuration-driver-panel></configuration-driver-panel>
        </el-tab-pane>
        <el-tab-pane label="历史记录" name="forth">历史线路</el-tab-pane>
      </el-tabs>
    </el-dialog>
</template>

<script lang="ts">
  import {Component, Vue} from "vue-property-decorator"
  import {Task, TaskPool} from "../../engine/domain/Task"
  import ConfigurationTaskPanel from "../ConfigurationTaskPanel/index"
  import ConfigurationVehiclePanel from "../ConfigurationVehiclePanel/index"
  import ConfigurationDriverPanel from "../ConfigurationDriverPanel/index"

  @Component({
    name: 'ConfigurationDialog',
    components: {ConfigurationDriverPanel, ConfigurationVehiclePanel, ConfigurationTaskPanel}
  })
  export default class extends Vue {
    private dialogVisible: boolean = false;
    private taskPool: TaskPool;
    private tasks: Array<Task>;
    private activeName: string;

    constructor(){
      super();
      this.taskPool = TaskPool.getInstance();
      this.tasks = this.taskPool.tasks;
      this.activeName = "first";
    }

    showDialog() {
      this.dialogVisible = true;
    }

    handleClick(tab, event) {
      console.log(tab, event);
    }
  }

</script>

<style lang="scss" scoped>

</style>
