<template>
  <div class="task-panel-wrapper">
    <div class="task-menu-wrapper">
      <div class="task-menu-cell" v-for="(task, index) in tasks" @click="chooseTask(task, index)">
        <div :class="['task-menu-indicator', {'task-menu-indicator-active': taskIndex == index}]"></div>
        <div class="task-menu-text-wrapper">
          {{task.name}}
        </div>
      </div>
    </div>
    <div class="task-detail-wrapper">
      <div v-if="tasks[taskIndex]">
        {{tasks[taskIndex].name}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {Route} from "../../engine/domain/Route"
  import {Task} from "../../engine/domain/Task"
  import {ShipmentTourActivity} from "../../engine/domain/Activity"

  @Component({
    name: 'TaskPanel'
  })
  export default class extends Vue {
    @Prop() private tasks: Array<Task>;
    private taskIndex: number;
    private taskUid: string| undefined;

    constructor(){
      super();
      this.taskIndex = 0;
    }

    @Watch('tasks', {deep: true})
    onTasksChanged(){
      if(this.taskUid){
        let index = this.tasks.findIndex(x=>{
          return x.uid == this.taskUid
        })

        this.taskIndex = index == -1 ? 0 : index;
      }
    }

    chooseTask(task, index){
      this.taskUid = task.uid;
      this.taskIndex = index;
    }

  }
</script>

<style lang="scss" scoped>
  .task-panel-wrapper{
    height: 100%;
    display: flex;
  }
  .task-menu-wrapper{
    flex: 0 0 80px;
    margin: 4px 0;
    overflow: scroll;
    background: #f5f5f5;
  }

  .task-menu-cell{
    list-style: none;
    height: 32px;
    line-height: 32px;
    width: 100%;
    border-bottom: 1px solid #ffffff;
    font-size: 12px;
    color: #909399;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    background: #f5f5f5;
    user-select: none;
  }

  .task-menu-cell-active{
    background: #d8d8d8;
  }

  .task-menu-indicator{
    height: 16px;
    flex: 0 0 4px;
    background: #f5f5f5;
    margin: 8px 0;
  }

  .task-menu-indicator-active{
    background: #4AB7BD;
  }

  .task-menu-text-wrapper{
    padding-left: 4px;
  }

  .task-detail-wrapper{
    flex: 1;
    margin: 4px;
  }
</style>
