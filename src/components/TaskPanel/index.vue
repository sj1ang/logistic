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
      <div v-if="tasks[taskIndex]" class="order-outer-wrapper">
        <div style="display: flex">
          <div class="tabs-wrapper">
            <div :class="['tab', {'tab-active': subTaskIndex == index}]" v-for="(subTask, index) in tasks[taskIndex].subTasks" @click="chooseSubTask(subTask, index)">
              {{subTask.bill.name}}
            </div>
          </div>
          <div style="width: 64px; background: #f5f5f5; line-height: 32px; text-align: center">
            <el-switch v-model="isPacked"></el-switch>
          </div>
        </div>
        <div class="sub-task-panel-wrapper">
          <div v-if="!isPacked">
            <div v-for="(entry, index) in tasks[taskIndex].subTasks[subTaskIndex].bill.entries" class="entry-row">
              <div style="flex: 0 0 80px">{{entry.prodCode}}</div>
              <div style="flex: 0 0 160px">{{entry.prodName}}</div>
              <div style="flex: 0 0 40px">{{entry.qty}}</div>
              <div style="flex: 0 0 40px">{{entry.unit}}</div>
              <div style="flex: 1">{{entry.remark}}</div>
            </div>
          </div>
          <div v-else>
            <div v-for="(box, index) in tasks[taskIndex].subTasks[subTaskIndex].boxes"
                 :class="['box-wrapper', {'veg-std-box': box.type == 'VEGSTDBOX'}, {'veg-630-box': box.type == 'VEG630BOX'}, {'red-box': box.type == 'REDBOX'}, {'oil-box': box.type == 'OILBOX'}, {'soy-box': box.type =='SOYBOX'}, {'egg-box': box.type == 'EGGBOX'}, {'rice-bag': box.type == 'RICEBAG'}]"
                 v-if="box.items.length > 0">
              <div v-for="(item, itemIndex) in box.items" class="item-wrapper">
                <div style="height: 15px; line-height: 15px">{{item.product.name}}</div>
                <div style="height: 15px; line-height: 15px">{{item.quantity.toFixed(2)}}{{item.product.unit}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {Route} from "../../engine/domain/Route"
  import {Task} from "../../engine/domain/Task"
  import {ShipmentTourActivity} from "../../engine/domain/Activity"
  import {SubTask} from "../../engine/domain/SubTask"

  @Component({
    name: 'TaskPanel'
  })
  export default class extends Vue {
    @Prop() private tasks: Array<Task>;
    private taskIndex: number;
    private taskUid: string | undefined;
    private subTask: SubTask | undefined;
    private subTaskIndex: number;
    private isPacked: boolean = false;

    constructor(){
      super();
      this.taskIndex = 0;
      this.subTaskIndex = 0;
      this.subTask = undefined;
    }

    @Watch('tasks', {deep: true})
    onTasksChanged(){
      if(this.taskUid){
        let index = this.tasks.findIndex(x=>{
          return x.uid == this.taskUid
        })

        // this.taskIndex = index == -1 ? 0 : index;

        if(index == -1){
          this.taskIndex = 0;
          this.subTaskIndex = 0;
        }else{
          this.taskIndex = index;
        }
      }
    }

    chooseTask(task, index){
      this.taskUid = task.uid;
      if(index != this.taskIndex) {
        this.taskIndex = index;
        this.subTaskIndex = 0;
      }
    }

    chooseSubTask(subTask, index){
      this.subTask = subTask;
      this.subTaskIndex = index;
    }

  }
</script>

<style lang="scss" scoped>
  .task-panel-wrapper{
    height: 100%;
    display: flex;
    user-select: none;
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
    margin: 4px 0 4px 4px;
  }

  .order-outer-wrapper{
    width: 100%;
    background: #ffffff;
    border: 1px solid #f5f5f5;
    height: 100%;
    position: relative;
  }
  .tabs-wrapper{
    height: 32px;
    background: #f5f5f5;
    display: flex;
    flex: 1;
  }
  .tab{
    min-width: 80px;
    padding: 0 8px;
    line-height: 32px;
    font-size: 10px;
    text-align: center;
  }
  .tab-active{
    background: #ffffff;
  }
  .sub-task-panel-wrapper{
    position: absolute;
    top: 32px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    overflow: scroll;
    margin: 2px;
  }
  .entry-row{
    min-height: 16px;
    font-size: 10px;
    line-height: 15px;
    border-bottom: 1px solid #f5f5f5;
    display: flex;
  }
  .entry-row:last-child{
    border-bottom: 0px;
  }
  .box-wrapper{
    display: flex;
    font-size: 10px;
    margin-bottom: 4px;
    border: 1px solid #f5f5f5;
    box-sizing: border-box;
    height: 32px;
    padding-left: 4px;
  }
  .item-wrapper{
    margin-right: 8px;
    height: 32px;
  }
  .veg-std-box{
    border-color: #30B08F;
  }
  .veg-630-box{
    border-color: #409EFF;
  }
  .red-box{
    border-color: red;
  }
  .oil-box{
    border-color: #FFBA00;
  }
  .soy-box{
    border-color: chocolate;
  }
  .egg-box{
    border-color: #2d3a4b;
  }
  .rice-bag{
    border-color: gray;
  }
</style>
